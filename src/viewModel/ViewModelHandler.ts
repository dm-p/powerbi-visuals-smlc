/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import DataViewMetadata = powerbi.DataViewMetadata;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
    import DataViewObject = powerbi.DataViewObject;
    import DataViewCategorical = powerbi.DataViewCategorical;
    import Fill = powerbi.Fill;
    import { legendInterfaces, axis } from 'powerbi-visuals-utils-chartutils';
    import MarkerShape = legendInterfaces.MarkerShape;
    import { textMeasurementService, valueFormatter } from 'powerbi-visuals-utils-formattingutils';
    import TextProperties = textMeasurementService.TextProperties;
    import getTailoredTextOrDefault = textMeasurementService.textMeasurementService.getTailoredTextOrDefault;
    import measureSvgTextWidth = textMeasurementService.textMeasurementService.measureSvgTextWidth;
    import measureSvgTextHeight = textMeasurementService.textMeasurementService.measureSvgTextHeight;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

/** External dependencies */
    import * as d3 from 'd3';

/** Internal dependencies */
    import Debugger from '../debug/Debugger';
    import VisualSettings from '../settings/VisualSettings';
    import IViewModel from './IViewModel';
    import ISmallMultipleMeasure from './ISmallMultipleMeasure';
    import ISmallMultipleMeasureValue from './ISmallMutlipleMeasureValue';
    import { VisualConstants } from '../constants';
    import IText from './IText';
    import ValueAxisSettings from '../settings/ValueAxisSettings';
    import CategoryAxisSettings from '../settings/CategoryAxisSettings';
    import IAxis from './IAxis';
    import EAxisType from './EAxisType';
    import EAxisScaleType from './EAxisScaleType';
    import DataViewHelper from '../dataView/DataViewHelper';
    import IStatistics from './IStatistics';
    import SmallMultiplesHelper from '../smallMultiple/SmallMultiplesHelper';
    import { LayoutMode } from '../smallMultiple/enums';

/**
 *
 */
    export default class ViewModelHandler {

        /** View model */
            public viewModel: IViewModel;
        /** Host services */
            private host: IVisualHost;
        /** Data view mapping metadata */
            private metadata: DataViewMetadata;
        /** Data view categorical mapping */
            private categorical: DataViewCategorical;
        /** Category column */
            private categoryColumn: DataViewMetadataColumn;
        /** Small multiple column */
            private smallMultipleColumn: DataViewCategoryColumn;
        /** Visual settings */
            public settings: VisualSettings;
        /** Localisation manager */
            private localisationManager: ILocalizationManager;
        /** Small Multiples Helper */
            private smallMultiplesHelper: SmallMultiplesHelper;

            constructor(host: IVisualHost) {
                Debugger.log('View model constructor');
                this.host = host;
                this.localisationManager = host.createLocalizationManager();
                this.reset();
            }

        /**
         * Resets view model back to initial state, ensuring that anything is cleaned-up from previous execution
         */
            private reset() {
                Debugger.log('Resetting view model...');
                this.viewModel = ViewModelHandler.initialState();
                Debugger.log('Finished resetting view model.');
            }

        /** Template view model for instantiation */
            static initialState(): IViewModel {
                return {
                    locale: '',
                    dataViewIsValid: false,
                    measureMetadata: [],
                    multiples: [],
                    categoryMetadata: null,
                    statistics: {
                        min: null,
                        max: null
                    },
                    label: {
                        text: null,
                        dominantBaseline: '',
                        textAnchor: ''
                    },
                    layout: {
                        visualViewport: null,
                        chartViewport: null,
                        grid: {
                            rows: 1,
                            columns: VisualConstants.defaults.layout.multipleDataReductionCap
                        },
                        x: 0,
                        y: 0,
                        minimumViewport: {
                            height: VisualConstants.ranges.multipleSize.min,
                            width: VisualConstants.ranges.multipleSize.min
                        },
                        smallMultipleXConstant: 0,
                        smallMultipleBorderOffset: 0,
                        smallMultipleDimensions: {
                            height: 0,
                            width: 0
                        },
                        rowDimensions: {
                            height: 0,
                            width: 0
                        },
                        smallMultipleMargin: {
                            top: VisualConstants.defaults.smallMultiple.margin.top,
                            bottom: VisualConstants.defaults.smallMultiple.margin.bottom,
                            left: VisualConstants.defaults.smallMultiple.margin.left,
                            right: VisualConstants.defaults.smallMultiple.margin.right
                        },
                        smallMultipleChartDimensions: {
                            height: 0,
                            width: 0
                        }
                    },
                    legend: {
                        dataPoints: []
                    },
                    viewport: {
                        height: null,
                        width: null
                    },
                    initialViewport: {
                        height: null,
                        width: null
                    },
                    yAxis: {
                        axisType: EAxisType.Value,
                        numberFormat: null,
                        masterTitle: null,
                        tickLabels: null,
                        tickWidth: 0,
                        tickHeight: 0,
                        tickValues: null,
                        ticks: null,
                        scale: null,
                        titleIsCollapsed: false,
                        ticksAreCollapsed: false,
                        scaleType: EAxisScaleType.Linear
                    },
                    xAxis: {
                        axisType: EAxisType.Category,
                        numberFormat: null,
                        masterTitle: null,
                        tickLabels: null,
                        tickWidth: 0,
                        tickHeight: 0,
                        tickValues: null,
                        ticks: null,
                        scale: null,
                        titleIsCollapsed: false,
                        ticksAreCollapsed: false,
                        scaleType: null
                    }
                };
            }

        /**
         * Tests the data view mapping for valid criteria, so that we know the data is valid.
         * Also sets flags in the view model that we can use to drive behaviour later on.
         */
            validateDataViewMapping(options: VisualUpdateOptions) {
                Debugger.log('Resolving data view mapping...');
                this.reset();
                let dataViews = options.dataViews;

                /** Test 1: Data view has valid bare-minimum entries */
                    Debugger.log('Test 1: Valid data view mapping...');
                    if (!dataViews
                        || !dataViews[0]
                        || !dataViews[0].categorical
                        || !dataViews[0].categorical.categories
                        || !dataViews[0].categorical.values
                        || !dataViews[0].metadata
                        || !dataViews[0].categorical.values.length
                        || !dataViews[0].categorical.values[0].source
                        || !dataViews[0].categorical.values[0].source.groupName
                    ) {
                        Debugger.log('Test 1 FAILED. Not all objects are present.');
                        this.viewModel.dataViewIsValid = false;
                        return;
                    }
                    Debugger.log('Test 1 PASSED. Data view mappings are valid :)');
                    Debugger.footer();
                    this.metadata = dataViews[0].metadata;
                    this.categorical = dataViews[0].categorical;
                    this.smallMultipleColumn = this.categorical.categories[0];
                    this.categoryColumn = this.metadata.columns.filter((c) => c.roles.category)[0];
                    this.viewModel.dataViewIsValid = true;
                    this.viewModel.locale = this.host.locale;
            }

        /** Maps everything we need from the data view to the view model */
            mapDataView() {

                Debugger.log('Mapping Data View to View Model');

                /** Map out measures into view model - use `grouped()` to get the correct order of measures based on the dataView */
                    Debugger.log('Mapping measures...');
                    this.categorical.values.grouped()[0].values.map((v) => v.source).map((m, mi) => {

                        /** Initialise new values */
                            let defaultColour: Fill = {
                                    solid: {
                                        color: this.host.colorPalette.getColor(`${m.displayName}`).value
                                    }
                                };

                        /** We seem to be unable to increment the colour index when looping in this particular case. Not sure why. Might be
                         *  a bug with `getColor`... will see if I can find a solid solution and report to the visuals team if I can figure
                         *  it out. The issue seems to stem form the fact that we can't increment the colorIndex in the palette, so I'm going
                         *  to override it manually. This basically forces the palette to assign the next colour.
                         */
                            this.host.colorPalette['colorIndex'] = mi + 1;

                        /** Persist out measure metadata and config */
                            this.viewModel.measureMetadata.push({
                                metadata: m,
                                formatter: valueFormatter.create({
                                    format: valueFormatter.getFormatStringByColumn(m),
                                    cultureSelector: this.viewModel.locale
                                }),
                                stroke: DataViewHelper.getMetadataObjectValue<Fill>(m, 'lines', 'stroke', defaultColour).solid.color,
                                selectionId: this.host.createSelectionIdBuilder()
                                    .withMeasure(m.queryName)
                                    .createSelectionId(),
                                strokeWidth: DataViewHelper.getMetadataObjectValue<number>(m, 'lines', 'strokeWidth', VisualConstants.defaults.lines.strokeWidth),
                                lineShape: DataViewHelper.getMetadataObjectValue<string>(m, 'lines', 'lineShape', VisualConstants.defaults.lines.lineShape),
                                lineStyle: DataViewHelper.getMetadataObjectValue<string>(m, 'lines', 'lineStyle', VisualConstants.defaults.lines.lineStyle),
                                showArea: DataViewHelper.getMetadataObjectValue<boolean>(m, 'lines', 'showArea', VisualConstants.defaults.lines.showArea),
                                backgroundTransparency: DataViewHelper.getMetadataObjectValue<number>(m, 'lines', 'backgroundTransparency', VisualConstants.defaults.lines.backgroundTransparency)
                            });

                    });

                /** Get all category values */
                    this.viewModel.categoryMetadata = {
                        metadata: this.categoryColumn,
                        values: [...new Set(this.categorical.values.map((v) => {
                                    switch (true) {
                                        case this.categoryColumn.type.dateTime: {
                                            return new Date(<string>v.source.groupName);
                                        }
                                        case this.categoryColumn.type.numeric: {
                                            return <number>v.source.groupName;
                                        }
                                        case this.categoryColumn.type.text: {
                                            return <string>v.source.groupName;
                                        }
                                    }
                                })
                            )],
                        extents: null
                    };
                    this.viewModel.categoryMetadata.extents = this.getCategoryExtents();

                /** Map out by small multiple */
                    Debugger.log('Mapping small multiples...');
                    this.smallMultipleColumn.values.map((c: string, ci) => {
                        let name = c || this.localisationManager.getDisplayName('Visual_Blank_Descriptor');
                        Debugger.log(`Processing ${name}...`);
                        let measures: ISmallMultipleMeasure[] = [];

                        /** Add measures to multiple */
                            this.viewModel.measureMetadata.map((m, mi) => {
                                Debugger.log(`Measure: ${m.metadata.displayName}`);
                                let values: ISmallMultipleMeasureValue[] = [];

                                /** Filter values by measure and add to array element */
                                    this.categorical.values.filter((v) => v.source.queryName === m.metadata.queryName)
                                        .map((v, vi) => {
                                            let value = <number>v.values[ci],
                                                category = this.categoryColumn.type.dateTime
                                                    ?   new Date(<string>v.source.groupName)
                                                    :   this.categoryColumn.type.numeric
                                                        ?   <number>v.source.groupName
                                                        :   <string>v.source.groupName;
                                            this.viewModel.statistics.min = {
                                                value: d3.min([value, this.viewModel.statistics.min && this.viewModel.statistics.min.value]),
                                                category: null,
                                                index: null
                                            };
                                            this.viewModel.statistics.max = {
                                                value: d3.max([value, this.viewModel.statistics.max && this.viewModel.statistics.max.value]),
                                                category: null,
                                                index: null
                                            };
                                            values.push({
                                                index: vi,
                                                category: category,
                                                value: value,
                                                selectionId: this.host.createSelectionIdBuilder()
                                                    .withCategory(this.categorical.categories[0], ci)
                                                    .withMeasure(m.metadata.queryName)
                                                    .withSeries(this.categorical.values, this.categorical.values[vi])
                                                    .createSelectionId(),
                                                tooltip: value
                                                    ?   {
                                                            header: `${name} - ${valueFormatter.format(category, this.categoryColumn.format, false, this.viewModel.locale)}`,
                                                            displayName: m.metadata.displayName,
                                                            value: m.formatter.format(value),
                                                            color: m.stroke
                                                        }
                                                    :   null
                                            });
                                        });

                                    /** We don't yet have the typings for latest d3-array changes (e.g. least, greatest) so we'll fudge
                                     *  something that pretty much gives us the same thing. Maybe we can replace later on.
                                     */
                                        let statistics: IStatistics = {
                                            min: values
                                                    .filter((v) => v.value !== null)
                                                    .sort((a, b) => d3.ascending(a.value, b.value))[0] || null,
                                            max: values
                                                    .filter((v) => v.value !== null)
                                                    .sort((a, b) => d3.descending(a.value, b.value))[0] || null,
                                            first: values
                                                    .filter((v) => v.value !== null)
                                                    .slice(0, 1)
                                                    .sort((a, b) => d3.ascending(a.category, b.category))[0] || null,
                                            last: values
                                                    .filter((v) => v.value !== null)
                                                    .slice(-1)[0] || null
                                        };

                                    measures.push({
                                        values: values,
                                        statistics: statistics
                                    });
                            });

                            Debugger.log('Adding to multiples array...');
                            this.viewModel.multiples.push({
                                name: name,
                                measures: measures,
                                margin: {
                                    top: VisualConstants.defaults.smallMultiple.margin.top,
                                    bottom: VisualConstants.defaults.smallMultiple.margin.bottom,
                                    left: VisualConstants.defaults.smallMultiple.margin.left,
                                    right: VisualConstants.defaults.smallMultiple.margin.right
                                },
                                spacing: {
                                    top: (this.settings.layout.spacingBetweenRows) / 2 || 0,
                                    bottom: (this.settings.layout.spacingBetweenRows) / 2 || 0,
                                    left: (this.settings.layout.spacingBetweenColumns) / 2 || 0,
                                    right: (this.settings.layout.spacingBetweenRows) / 2 || 0
                                },
                                selectionId: this.host.createSelectionIdBuilder()
                                    .withCategory(this.categorical.categories[0], ci)
                                    .createSelectionId(),
                                column: 0,
                                row: 0,
                                backgroundColour: null,
                                titleColour: null
                            });

                    });

                    this.smallMultiplesHelper = new SmallMultiplesHelper(this.viewModel.multiples.length, {
                        mode: LayoutMode[this.settings.layout.mode],
                        columnCap: this.settings.layout.numberOfColumns || VisualConstants.defaults.layout.multipleDataReductionCap,
                        columnSpacing: this.settings.layout.spacingBetweenColumns,
                        smallMultipleWidth: this.settings.layout.multipleWidth
                    });

            }

        /** Populates legend data */
            populateLegend() {
                Debugger.log('Populating legend data...');
                this.viewModel.legend = {
                    title: (this.settings.legend.showTitle
                                ?   (
                                        this.settings.legend.titleText
                                            ?   this.settings.legend.titleText
                                            :   this.categoryColumn.displayName
                                    )
                                    + (
                                        this.settings.legend.includeRanges
                                            ? ` (${
                                                    valueFormatter.format(this.viewModel.categoryMetadata.extents[0], this.categoryColumn.format, false, this.viewModel.locale)
                                                } - ${
                                                    valueFormatter.format(this.viewModel.categoryMetadata.extents[1], this.categoryColumn.format, false, this.viewModel.locale)
                                                })`
                                            : ''
                                    )
                                : null
                    ),
                    fontSize: this.settings.legend.fontSize,
                    labelColor: this.settings.legend.fontColor,
                    dataPoints: this.viewModel.measureMetadata.map(function(m, i) {
                        return {
                            label: m.metadata.displayName,
                            color: m.stroke,
                            markerShape: MarkerShape.longDash,
                            selected: false,
                            identity: m.selectionId
                        };
                    })
                };
            }

        /** Works out what axes shoud look like in an ideal world */
            initialiseAxes() {

                Debugger.footer();
                Debugger.log('Initialising axes...');

                /** Y-axis setup */
                    Debugger.log('Master Y-axis number formatting...');
                    this.viewModel.yAxis.numberFormat = valueFormatter.create({
                        format: valueFormatter.getFormatStringByColumn(this.viewModel.measureMetadata[0].metadata),
                        value: this.settings.yAxis.labelDisplayUnits === 0
                            ?   this.viewModel.statistics.max.value
                            :   this.settings.yAxis.labelDisplayUnits,
                        precision: this.settings.yAxis.precision,
                        cultureSelector: this.viewModel.locale
                    });
                    Debugger.log('Master Y-axis title...');
                    this.viewModel.yAxis.masterTitle = this.resolveMasterAxisTitle(this.viewModel.yAxis, this.settings.yAxis);

                    Debugger.log('Y-axis scale & domain...');
                    this.viewModel.yAxis.scale = d3.scaleLinear()
                        .domain([
                                    this.settings.yAxis.start === 0
                                        ?   0
                                        : this.settings.yAxis.start || this.viewModel.statistics.min.value,
                                    this.settings.yAxis.end === 0
                                        ?   0
                                        :   this.settings.yAxis.end || this.viewModel.statistics.max.value
                                ])
                        .nice();

                    Debugger.log('Y-axis ticks...');
                    this.viewModel.yAxis.tickLabels = this.resolveMasterAxisTickLabel(this.viewModel.yAxis, this.settings.yAxis, this.viewModel.measureMetadata[0].metadata);

                /** X-Axis setup */
                    Debugger.log('Master X-axis title...');
                    this.viewModel.xAxis.masterTitle = this.resolveMasterAxisTitle(this.viewModel.xAxis, this.settings.xAxis);

                    Debugger.log('X-axis scale & domain...');
                    switch (true) {
                        case this.categoryColumn.type.numeric: {
                            Debugger.log('Creating linear scale...');
                            this.viewModel.xAxis.scaleType = EAxisScaleType.Linear;
                            this.viewModel.xAxis.scale = d3.scaleLinear()
                                .domain(d3.extent(this.viewModel.categoryMetadata.values, (c) => <number>c));
                            break;
                        }
                        case this.categoryColumn.type.dateTime: {
                            Debugger.log('Creating linear scale...');
                            this.viewModel.xAxis.scaleType = EAxisScaleType.Time;
                            this.viewModel.xAxis.scale = d3.scaleTime()
                                .domain(d3.extent(this.viewModel.categoryMetadata.values, (c) => new Date(<string>c)));
                            break;
                        } default: {
                            Debugger.log('Creating categorical scale...');
                            this.viewModel.xAxis.scaleType = EAxisScaleType.Point;
                            this.viewModel.xAxis.scale = d3.scaleBand()
                                .domain(<string[]>this.viewModel.categoryMetadata.values);
                        }
                    }

                    if (this.viewModel.xAxis.scaleType !== EAxisScaleType.Point) {
                        Debugger.log('Master X-axis is linear. Applying number formatting...');
                        this.viewModel.xAxis.numberFormat = valueFormatter.create({
                            format: this.categoryColumn.format,
                            value: this.viewModel.categoryMetadata[0],
                            cultureSelector: this.viewModel.locale
                        });
                    }

                    Debugger.log('X-axis ticks...');
                    this.viewModel.xAxis.tickLabels = this.resolveMasterAxisTickLabel(this.viewModel.xAxis, this.settings.xAxis, this.categoryColumn);

            }

        /** Resolves the initial viewport size, and what the minimum accepted viewport would be, based on minimum sizes and grid */
            calculateInitialViewport() {
                Debugger.log('Calculating initial viewport...');
                this.viewModel.layout.minimumViewport = {
                    height: VisualConstants.visual.minPx,
                    width: VisualConstants.visual.minPx
                };
                this.viewModel.layout.visualViewport = {
                    height: this.viewModel.viewport.height,
                    width: this.viewModel.viewport.width
                };
            }

        /** Calculate all visual dimensions required to render */
            resolveAxisTitles() {

                Debugger.footer();
                Debugger.log('Resolving axis dimensions and doing responsiveness checks...');

                /** Get text dimensions for each title */
                    this.resolveXAxisTitleHeight();
                    this.resolveYAxisTitleWidth();

                /** Find x/y coords */
                    this.resolveAxisTitleCoordinates();

                /** Tailor axis text based on available space */
                    this.tailorXAxisTitle();
                    this.tailorYAxisTitle();

            }

        /** Sets the visual viewport based on remaining height/width from master titles */
            resolveVisualViewport() {
                this.viewModel.layout.visualViewport = {
                    width: this.viewModel.viewport.width - this.viewModel.yAxis.masterTitle.textHeight - VisualConstants.defaults.layout.scrollbarPadding,
                    height: this.viewModel.viewport.height - this.viewModel.xAxis.masterTitle.textHeight - VisualConstants.defaults.layout.scrollbarPadding
                };
            }

        /**
         * Sets the chart viewport to the size appropriate for the visual viewport, or considering any minimum allowable sizes for small multiples
         * @param useMinimums   - Specifies whether to calculate for minimum-allowable dimensions once the grid size is known
         */
            private resetChartViewport(useMinimums = false) {
                Debugger.log('Setting chart viewport...');
                if (useMinimums) {
                    Debugger.log('Adjusting for minimum dimensions...');
                    this.viewModel.layout.chartViewport = {
                        height: (this.viewModel.layout.rowDimensions.height * this.viewModel.layout.grid.rows)
                            +   this.viewModel.xAxis.tickLabels.textHeight
                            +   (this.viewModel.layout.smallMultipleBorderOffset * 2),
                        width:  this.viewModel.layout.rowDimensions.width
                            +   this.viewModel.layout.x
                            +   this.viewModel.layout.smallMultipleBorderOffset
                    };
                } else {
                    Debugger.log('Setting to standard viewport size...');
                    this.viewModel.layout.chartViewport = this.viewModel.layout.visualViewport;
                }
            }

        /** Works out X/Y coordinates of axis titles, based on viewport */
            private resolveAxisTitleCoordinates() {
                Debugger.log('Resolving axis title coordinates...');
                this.viewModel.xAxis.masterTitle.x = this.viewModel.layout.visualViewport.width - (this.viewModel.layout.visualViewport.width / 2);
                this.viewModel.xAxis.masterTitle.y = this.viewModel.xAxis.masterTitle.textHeight / 2;
                this.viewModel.yAxis.masterTitle.x = -this.viewModel.layout.visualViewport.height / 2;
                this.viewModel.yAxis.masterTitle.y = this.viewModel.yAxis.masterTitle.textHeight / 2;
            }

            private resolveChartContainerPosition() {
                Debugger.log('Resolving chart container position...');
                this.viewModel.layout.smallMultipleBorderOffset = this.settings.smallMultiple.border && this.settings.smallMultiple.borderStrokeWidth || 0;
                this.viewModel.layout.x = this.viewModel.yAxis.tickLabels.textWidth + this.viewModel.layout.smallMultipleBorderOffset;
                this.viewModel.layout.y = this.viewModel.layout.smallMultipleBorderOffset;
                this.viewModel.layout.chartViewport.height -= this.viewModel.layout.y;
            }

        /** based on grid configuration and minimum dimensions, calculate space required */
            private resolveSmallMultipleRowColDimensions() {
                Debugger.log('Resolving small multiple row and column dimensions...');
                let vph = this.viewModel.layout.chartViewport.height,
                    vpw = this.viewModel.layout.chartViewport.width,
                    r = this.viewModel.layout.grid.rows,
                    c = this.viewModel.layout.grid.columns,
                    rh = 0,
                    cw = 0,
                    smh = 0,
                    smw = 0;

                switch (this.settings.layout.mode) {
                    case 'flow': {
                        rh = this.settings.layout.multipleHeight + (this.viewModel.layout.grid.rows > 1 ? this.settings.layout.spacingBetweenRows : 0);
                        smh = this.settings.layout.multipleHeight;
                        cw = this.settings.layout.multipleWidth + (this.viewModel.layout.grid.columns > 1 ? this.settings.layout.spacingBetweenColumns : 0);
                        smw = this.settings.layout.multipleWidth;
                        break;
                    }
                    case 'column': {
                        let reduce = (this.settings.smallMultiple.border ? this.settings.smallMultiple.borderStrokeWidth : 0);
                        rh = Math.max(
                            VisualConstants.ranges.multipleSize.min,
                            (vph / r) - reduce
                        );
                        smh = rh
                            - (this.viewModel.layout.grid.rows > 1 ? this.settings.layout.spacingBetweenRows : 0);
                        cw = Math.max(
                            VisualConstants.ranges.multipleSize.min,
                            (vpw - reduce) / c
                        );
                        smw = cw - (this.settings.layout.spacingBetweenColumns || 0);
                        break;
                    }
                }
                this.viewModel.layout.rowDimensions.height = rh;
                this.viewModel.layout.smallMultipleDimensions.height = smh;
                this.viewModel.layout.rowDimensions.width = cw * c;
                this.viewModel.layout.smallMultipleDimensions.width = smw;
            }

        /** We might need a couple of passes if we need to make adjustments, post axis-processing, so this is an abstraction of core calculations
         *  for the small multiple chart we will need to do each time
         */
            private resolveChartDimensionsCore() {
                    this.resolveYAxisTickLabelWidth();
                    this.resolveXAxisTickLabelHeight();
                    this.resolveChartContainerPosition();

                    this.smallMultiplesHelper.layoutOptions = {
                        ...this.smallMultiplesHelper.layoutOptions,
                        ...{
                            chartWidth: this.viewModel.layout.chartViewport.width,
                        }
                    };
                    this.smallMultiplesHelper.calculateGridDimensions();
                    this.viewModel.layout.grid = this.smallMultiplesHelper.layout.grid;
                    this.resolveSmallMultipleGridSpecifics();
                    this.resolveSmallMultipleRowColDimensions();

                /** Adjust viewport based on the calculated small multiple size (as we may need to overflow if we hit minimums) */
                    this.resetChartViewport(true);

                /** Calculate axes and plot areas within small multiples */
                    this.resolveSmallMultipleVerticalMarginsForTicks();
                    this.resolveSmallMultipleVerticalMarginsForLabel();
                    this.calculateSmallMultipleChartHeight();
            }

        /** These are the steps required after the core chart dimensions have been calculated and the Y-axis may have been resolved, but before the
         *  X-axis might need to be be managed in a similar way.
         */
            private resolveChartDimensionsPostYAxis() {
                this.resolveXAxisTickHeights();
                this.calculateHorizontalDimensions();
                this.resolveYAxisTickWidths();
            }

        /** Work out how the chart area needs to be laid out, including any additional responsiveness */
            resolveChartArea() {

                Debugger.footer();
                Debugger.log('Resolving small multiple chart area...');

                /** Start with an initial viewport */
                    this.resetChartViewport();

                /** Try to get it right first time! */
                    this.resolveChartDimensionsCore();

                /** We need to do some responsiveness checks on the Y-axis, just in case it's too small to render ticks. We'll re-resolve if so. */
                    this.resolveYAxisScaleAndPlacement();
                    if (this.viewModel.yAxis.ticks === 0) {
                        this.resolveChartDimensionsCore();
                    }
                    this.resolveChartDimensionsPostYAxis();

                /** Similar to above, but for the X-axis */
                    this.resolveXAxisScaleAndPlacement();
                    this.resolveXAxisTickValidity();
                    if (this.viewModel.xAxis.tickLabels.textHeight === 0) {
                        this.resolveChartDimensionsCore();
                        this.resolveChartDimensionsPostYAxis();
                    }

                /** Set label alignment */
                    this.resolveSmallMultipleLabelHorizontalAlignment();

            }

        /** Resolves the required X-axis title height requirements based on font/display settings, and current viewport size.
         *  Will adjust remaining viewport based on calculated values if it can/should be displayed.
         */
            private resolveXAxisTitleHeight() {
                Debugger.log('Resolving X-axis title for viewport height and settings...');
                if (    this.willViewportFit(this.viewModel.xAxis.masterTitle.textHeight, 0)
                    &&  this.settings.xAxis.showTitle
                    &&  this.viewModel.xAxis.masterTitle.textHeight > 0
                    ) {
                        Debugger.log('[RESPONSIVENESS] Viewport can support X-axis title.');
                        this.viewModel.layout.visualViewport.height -= this.viewModel.xAxis.masterTitle.textHeight;
                        this.viewModel.xAxis.titleIsCollapsed = false;
                } else {
                    Debugger.log('[RESPONSIVENESS] X-axis title not required for viewport, or won\'t fit. Will not be included in chart.');
                    this.viewModel.xAxis.masterTitle.textHeight = 0;
                    this.viewModel.xAxis.titleIsCollapsed = true;
                }
            }

        /** Do a check of all X-axis min and max values to see if they are all tailored down to nothing, and reduce the tect heigh if so */
            private resolveXAxisTickValidity() {
                Debugger.log('Checking validity of X-axis ticks...');
                let totalValues = this.viewModel.xAxis.tickValues.length,
                    emptyValues = 0;
                if (this.viewModel.xAxis.tickLabels.properties) {
                    this.viewModel.xAxis.tickValues.forEach((tv) => {
                        let properties = this.viewModel.xAxis.tickLabels.properties;
                        properties.text = valueFormatter.format(tv, this.viewModel.categoryMetadata.metadata.format, false, this.viewModel.locale);
                        if (getTailoredTextOrDefault(properties, this.viewModel.layout.smallMultipleChartDimensions.width * 0.5) === '...') {
                            emptyValues ++;
                        }
                    });
                    if (totalValues === emptyValues) {
                        this.viewModel.xAxis.tickLabels.textHeight = 0;
                    }
                }
            }

        /** Resolves the required Y-axis title width requirements based on font/display settings, and current viewport size.
         *  Will adjust remaining viewport based on calculated values if it can/should be displayed.
         */
            private resolveYAxisTitleWidth() {
                if (    this.willViewportFit(0, this.viewModel.yAxis.masterTitle.textWidth)
                    &&  this.settings.yAxis.showTitle
                    &&  this.viewModel.yAxis.masterTitle.textHeight
                ) {
                    Debugger.log('[RESPONSIVENESS] Viewport can support Y-axis title.');
                    this.viewModel.layout.visualViewport.width -= this.viewModel.yAxis.masterTitle.textHeight;
                    this.viewModel.yAxis.titleIsCollapsed = false;
                } else {
                    Debugger.log('[RESPONSIVENESS] Y-axis title not required for viewport, or won\'t fit. Will not be included in chart.');
                    this.viewModel.yAxis.masterTitle.textHeight = 0;
                    this.viewModel.yAxis.titleIsCollapsed = true;
                }
            }

        /** Determines if the Y-axis title can fit within its viewport and truncates with ellipses if not */
            private tailorYAxisTitle() {
                if (this.settings.yAxis.show && this.settings.yAxis.showTitle && this.viewModel.yAxis.masterTitle.textHeight > 0) {
                    this.viewModel.yAxis.masterTitle.tailoredValue = getTailoredTextOrDefault(
                            this.viewModel.yAxis.masterTitle.properties,
                            this.viewModel.layout.visualViewport.height
                        );
                }
            }

        /** Resolves the required Y-axis tick width requirements based on font/display settings, and current viewport size.
         *  Will adjust remaining viewport based on calculated values if they can/should be displayed.
         */
            private resolveYAxisTickLabelWidth() {
                if (    this.willViewportFit(0, this.viewModel.yAxis.tickLabels.textWidth)
                    &&  this.settings.yAxis.show
                    &&  this.viewModel.yAxis.tickLabels.textWidth > 0
                    &&  this.settings.yAxis.labelPlacement === 'row'
                    &&  this.viewModel.yAxis.ticks !== 0
                ) {
                    Debugger.log('[RESPONSIVENESS] Viewport can support Y-axis tick labels.');
                    this.viewModel.layout.chartViewport.width -= this.viewModel.yAxis.tickLabels.textWidth;
                    this.viewModel.yAxis.ticksAreCollapsed = false;
                } else {
                    Debugger.log('[RESPONSIVENESS] Y-axis tick labels not required for viewport, or won\'t fit. Will not be included in chart.');
                    this.viewModel.yAxis.tickLabels.textWidth = 0;
                    this.viewModel.yAxis.ticksAreCollapsed = true;
                }
            }

        /** Determines if the X-axis title can fit within its viewport and truncates with ellipses if not */
            private tailorXAxisTitle() {
                if (this.settings.xAxis.show && this.settings.xAxis.showTitle && this.viewModel.xAxis.masterTitle.textHeight > 0) {
                    this.viewModel.xAxis.masterTitle.tailoredValue = getTailoredTextOrDefault(
                        this.viewModel.xAxis.masterTitle.properties,
                        this.viewModel.layout.visualViewport.width
                    );
                }
            }

        /** Resolves the required X-axis tick height requirements based on font/display settings, and current viewport size.
         *  Will adjust remaining viewport based on calculated values if they can/should be displayed.
         */
            private resolveXAxisTickLabelHeight() {
                Debugger.log('Resolving X-axis ticks for viewport height and settings...');
                    +   (
                            this.settings.xAxis.showAxisLine
                            ?   VisualConstants.ranges.axisLineStrokeWidth.max
                            :   0
                        );
                if (    this.willViewportFit(this.viewModel.xAxis.tickLabels.textHeight, 0)
                        &&  this.settings.xAxis.show
                        &&  this.viewModel.xAxis.tickLabels.textHeight > 0
                        &&  this.settings.xAxis.labelPlacement === 'column'
                ) {
                    Debugger.log('[RESPONSIVENESS] Viewport can support X-axis tick labels.');
                    this.viewModel.layout.chartViewport.height -= this.viewModel.xAxis.tickLabels.textHeight;
                    this.viewModel.xAxis.ticksAreCollapsed = false;
                } else {
                    Debugger.log('[RESPONSIVENESS] X-axis tick labels not required for viewport, or won\'t fit. Will not be included in chart.');
                    this.viewModel.xAxis.tickLabels.textHeight = 0;
                    this.viewModel.xAxis.ticksAreCollapsed = true;
                }
            }

        /** Calculates small multiple grid coordinates and applies specific formatting properties */
            private resolveSmallMultipleGridSpecifics() {
                Debugger.log('Resolving small multiple grid dependencies...');
                let cols = this.viewModel.layout.grid.columns,
                    rows = this.viewModel.layout.grid.rows,
                    total = this.viewModel.multiples.length;
                Debugger.log('Columns', cols, 'Rows', rows, '# Multiples', total);
                this.viewModel.multiples.map((sm, smi) => {
                    let row = sm.row = Math.floor(smi / ((cols * rows) / rows)),
                        col = sm.column = Math.floor(smi % ((cols * rows) / rows));
                    /** Apply background colour based on zebra-stripe settings */
                        if (this.settings.smallMultiple.zebraStripe) {
                            switch (this.settings.smallMultiple.zebraStripeApply) {
                                case 'multiple': {
                                    sm.backgroundColour = smi % 2
                                        ?   this.settings.smallMultiple.backgroundColorAlternate || 'transparent'
                                        :   this.settings.smallMultiple.backgroundColor || 'transparent';
                                    sm.titleColour = smi % 2
                                        ?   this.settings.heading.fontColourAlternate
                                        :   this.settings.heading.fontColour;
                                    break;
                                }
                                case 'row': {
                                    sm.backgroundColour = row % 2
                                        ?   this.settings.smallMultiple.backgroundColorAlternate || 'transparent'
                                        :   this.settings.smallMultiple.backgroundColor || 'transparent';
                                    sm.titleColour = row % 2
                                        ?   this.settings.heading.fontColourAlternate
                                        :   this.settings.heading.fontColour;
                                    break;
                                }
                                /** Column (legacy) */
                                default: {
                                    sm.backgroundColour = col % 2
                                        ?   this.settings.smallMultiple.backgroundColorAlternate || 'transparent'
                                        :   this.settings.smallMultiple.backgroundColor || 'transparent';
                                    sm.titleColour = col % 2
                                        ?   this.settings.heading.fontColourAlternate
                                        :   this.settings.heading.fontColour;
                                    break;
                                }
                            }
                        } else {
                                sm.backgroundColour = this.settings.smallMultiple.backgroundColor || 'transparent';
                                sm.titleColour = this.settings.heading.fontColour;
                        }
                });
            }

        /** Adjusts the top and bottom margins based on axis tick label settings */
            private resolveSmallMultipleVerticalMarginsForTicks() {
                Debugger.log('Resolving small multiple vertical margins for axis tick labels...');
                this.viewModel.layout.smallMultipleMargin.top = VisualConstants.defaults.smallMultiple.margin.top
                    +   (       this.settings.smallMultiple.border
                                ?   this.settings.smallMultiple.borderStrokeWidth
                                :   0
                        );
                this.viewModel.layout.smallMultipleMargin.bottom = VisualConstants.defaults.smallMultiple.margin.bottom
                    +   (       this.settings.smallMultiple.border
                            ?   this.settings.smallMultiple.borderStrokeWidth
                            :   0
                        );
            }

        /** Adjusts the top and bottom margins based on category label settings */
            private resolveSmallMultipleVerticalMarginsForLabel() {
                Debugger.log('Resolving small multiple vertical margins for displayed category label...');
                this.viewModel.label.text = this.resolveMultipleTitle();
                this.viewModel.label.dominantBaseline = 'hanging';
                switch (true) {
                    case this.settings.heading.labelPosition === 'top' && this.settings.heading.show: {
                        Debugger.log('Adjusting for top...');
                        this.viewModel.label.text.y = this.viewModel.layout.smallMultipleMargin.top;
                        this.viewModel.layout.smallMultipleMargin.top += this.viewModel.label.text.textHeight;
                        break;
                    }
                    case this.settings.heading.labelPosition === 'bottom' && this.settings.heading.show: {
                        Debugger.log('Adjusting for bottom...');
                        this.viewModel.layout.smallMultipleMargin.bottom += this.viewModel.label.text.textHeight;
                        this.viewModel.label.text.y = this.viewModel.layout.smallMultipleDimensions.height - this.viewModel.layout.smallMultipleMargin.bottom;
                        break;
                    }
                }
            }

        /** Calculates available height for chart based on multiples and margins */
            private calculateSmallMultipleChartHeight() {
                Debugger.log('Calculating chart dimensions: height...');
                this.viewModel.layout.smallMultipleChartDimensions.height = this.viewModel.layout.smallMultipleDimensions.height
                    - this.viewModel.layout.smallMultipleMargin.top
                    - this.viewModel.layout.smallMultipleMargin.bottom;
            }

        /** Resolves the Y-axis master title position, and range */
            private resolveYAxisScaleAndPlacement() {
                this.viewModel.yAxis.scale
                    .range([this.viewModel.layout.smallMultipleChartDimensions.height, 0]);
                /** Try to work with the recommended number of ticks, but adjust if we're likely to be too squashed */
                    let yTicks = axis.getRecommendedNumberOfTicksForYAxis(this.viewModel.layout.smallMultipleChartDimensions.height);
                    while (yTicks * this.viewModel.yAxis.tickLabels.textHeight >= this.viewModel.layout.smallMultipleChartDimensions.height) {
                        yTicks -= 1;
                        if (yTicks === 0) {
                            break;
                        }
                    }
                    this.viewModel.yAxis.ticks = yTicks;
            }

        /** Resolves the total height of the X-axis ticks */
            private resolveXAxisTickHeights() {
                this.viewModel.xAxis.tickHeight = -this.viewModel.layout.smallMultipleChartDimensions.height;
            }

        /** Resolves all horizontal dimensions based on the remaining space after Y-axis resolution */
            private calculateHorizontalDimensions() {
                Debugger.log('Calculating horizontal dimensions...');
                this.viewModel.layout.smallMultipleChartDimensions.width = this.viewModel.layout.smallMultipleDimensions.width
                    - this.viewModel.layout.smallMultipleMargin.right
                    - this.viewModel.layout.smallMultipleMargin.left;
                this.viewModel.layout.smallMultipleXConstant = this.viewModel.layout.smallMultipleDimensions.width
                    + this.settings.layout.spacingBetweenColumns || 0;
            }

        /** Resolves the total width of the Y-axis ticks and the vertical placement of the master title */
            private resolveYAxisTickWidths() {
                this.viewModel.yAxis.tickWidth = -this.viewModel.layout.smallMultipleChartDimensions.width
                    - this.viewModel.layout.smallMultipleMargin.right
                    - this.viewModel.layout.smallMultipleMargin.left;
            }

        /** Resolves the X-axis master title position, and range */
            private resolveXAxisScaleAndPlacement() {
                this.viewModel.xAxis.scale.range([
                        this.viewModel.layout.smallMultipleMargin.left,
                        this.viewModel.layout.smallMultipleChartDimensions.width
                    ]);

                if (this.viewModel.xAxis.scaleType === EAxisScaleType.Point) {
                    (<d3.ScalePoint<String>>this.viewModel.xAxis.scale)
                        .round(true);
                }
                this.viewModel.xAxis.tickValues = this.viewModel.categoryMetadata.extents;
                /** We cap this to ensure that we always get the extremes. It's not great... */
                this.viewModel.xAxis.ticks = VisualConstants.defaults.categoryAxis.fixedTicks;
            }

        /** Assigns the correct SVG styling based on small multiple label alignment preferences */
            private resolveSmallMultipleLabelHorizontalAlignment() {
                switch (this.settings.heading.labelAlignment) {
                    case 'left': {
                        this.viewModel.label.text.x = this.viewModel.layout.smallMultipleMargin.left;
                        this.viewModel.label.textAnchor = 'start';
                        break;
                    }
                    case 'center': {
                        this.viewModel.label.text.x = this.viewModel.layout.smallMultipleChartDimensions.width / 2;
                        this.viewModel.label.textAnchor = 'middle';
                        break;
                    }
                    case 'right': {
                        this.viewModel.label.text.x = this.viewModel.layout.smallMultipleChartDimensions.width;
                        this.viewModel.label.textAnchor = 'end';
                        break;
                    }
                }
            }

            private getCategoryExtents(): [any, any] {
                Debugger.log('Getting X-axis extents and formatting...');
                return [
                    this.viewModel.categoryMetadata.values[0],
                    this.viewModel.categoryMetadata.values[this.viewModel.categoryMetadata.values.length - 1],
                ];
            }

            private willViewportFit(dh: number, dw: number): boolean {
                Debugger.log(`Testing new viewport for dh ${dh}px and dw ${dw}px...`);
                return this.viewModel.layout.visualViewport.width - dw >= this.viewModel.layout.minimumViewport.width
                    && this.viewModel.layout.visualViewport.height - dh >= this.viewModel.layout.minimumViewport.height;
            }

        /** Resolve the small multiple label properties */
            private resolveMultipleTitle(): IText {
                let textProperties: TextProperties = {
                    fontFamily: this.settings.heading.fontFamily,
                    fontSize: `${this.settings.heading.fontSize}pt`,
                    text: ''
                };
                return {
                    properties: textProperties,
                    textHeight: this.settings.heading.show
                        ?   measureSvgTextHeight(textProperties, 'A')
                        :   0,
                    textWidth: 0,
                    tailoredValue: ''
                };
            }

        /** Works out axis label object for the specified axis and settings */
            private resolveMasterAxisTickLabel(axis: IAxis, axisSettings: ValueAxisSettings | CategoryAxisSettings, metadata: DataViewMetadataColumn): IText {
                Debugger.log('Resolving axis label settings...');
                if (axisSettings.show && axisSettings.showLabels) {
                    let length = axis.scale && axis.scale.domain && axis.scale.domain().length || -1,
                        lowest = axis.scale.domain()[0],
                        highest = axis.scale.domain()[length - 1];

                    let lowestFormatted = axis.numberFormat
                            ?   axis.numberFormat.format(lowest)
                            :   lowest.toString(),
                        highestFormatted = axis.numberFormat
                            ?   axis.numberFormat.format(highest)
                            :   highest.toString(),
                        textProperties: TextProperties = {
                            fontFamily: axisSettings.fontFamily,
                            fontSize: `${axisSettings.fontSize}pt`
                        };
                    return {
                        properties: textProperties,
                        tailoredValue: '',
                        textHeight: measureSvgTextHeight(textProperties),
                        textWidth: Math.max(
                                measureSvgTextWidth(textProperties, lowestFormatted),
                                measureSvgTextWidth(textProperties, highestFormatted)
                            )
                    };
                } else {
                    return {
                        properties: null,
                        tailoredValue: '',
                        textWidth: 0,
                        textHeight: 0
                    };
                }
            }

        /** Works out master title object for the specified axis and settings */
            private resolveMasterAxisTitle(axis: IAxis, axisSettings: ValueAxisSettings | CategoryAxisSettings): IText {
                Debugger.log('Resolving master axis settings...');
                if (axisSettings.show && axisSettings.showTitle) {
                    let text = () => {
                            /** Resolve title text to use concatenated measures if not supplied */
                                let titleText = axis.axisType === EAxisType.Value
                                    ?   !this.settings.yAxis.titleText
                                            ?   this.viewModel.measureMetadata
                                                    .map((m) => m.metadata.displayName)
                                                    .join(', ')
                                                    .replace(/, ([^,]*)$/, ' and $1')
                                            :   this.settings.yAxis.titleText
                                    :   this.settings.xAxis.titleText || this.categoryColumn.displayName;

                            /** Resolve the correct text based on title text and display units */
                                switch (true) {
                                    case (axis.numberFormat && axis.numberFormat.displayUnit && axisSettings.titleStyle === 'unit'): {
                                        Debugger.log('Using number format for axis.');
                                        return (axis.numberFormat.displayUnit.title) || '';
                                    }
                                    case (axis.numberFormat && axis.numberFormat.displayUnit && axisSettings.titleStyle === 'both'): {
                                        Debugger.log('Using measure and number format for axis.');
                                        return `${titleText} (${axis.numberFormat.displayUnit.title})`;
                                    }
                                    default: {
                                        Debugger.log('Using specified title for axis.');
                                        return titleText;
                                    }
                                }
                        },
                        textProperties: TextProperties = {
                            text: text(),
                            fontFamily: axisSettings.titleFontFamily,
                            fontSize: `${axisSettings.titleFontSize}pt`
                        };
                    return {
                        properties: textProperties,
                        tailoredValue: text(),
                        textHeight: measureSvgTextHeight(textProperties),
                        textWidth: measureSvgTextWidth(textProperties)
                    };
                } else {
                    return {
                        properties: null,
                        tailoredValue: '',
                        textHeight: 0,
                        textWidth: 0
                    };
                }
            }

    }