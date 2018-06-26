module powerbi.extensibility.visual {

    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import axisHelper = powerbi.extensibility.utils.chart.axis;

    /**
     * Everything specific to our small multiple line chart
     */
    export namespace SmallMultipleLineChartViewModel {

        /**
         * Dimensions of chart viewport
         * 
         * @property {number} width                                     -   Width of viewport, in percent
         * @property {number} height                                    -   Height of viewport, in percent
         */
        export interface IViewport {
            width: number;
            height: number;
        }

        /**
         * Dimensions of chart within viewport. This is currently the same as the viewport but we will likely need it to be different if we have to scroll etc.
         * 
         * @property {number} width                                     -   Width of chart area, in percent
         * @property {number} height                                    -   Height of chart area, in percent
         */
        export interface IChart {
            width: number;
            height: number;
        }

        /**
         * Master view model for the small multiple line chart
         * 
         * @property {ILayout} layout                                   -   Computed chart layout properties
         * @property {ISmallMultipleData[]} multiples                   -   Small multiple data contained in the chart, and associated metadata
         */
        export interface IViewModel {
            layout: ILayout;
            multiples: ISmallMultipleData[];
        }

        /**
         * Contains layout and formatting properties for display of the chart, with respect to the small multiple data
         * 
         * @property {IViewport} viewport                               -   Overarching viewport containing the chart
         * @property {IChart} chart                                     -   Data specific to the chart within the viewport (if different)
         * @property {IMultiple} multiples                              -   Properties needed to render our small multiples
         * @property {IAxis} yAxis                                      -   Data specific to the rendering of the Y-axis in our chart
         * @property {IAxis} xAxis                                      -   Data specific to the rendering of the X-axis in our small multiples
         * @property {IPaddingConfiguration} padding                    -   All padding measurements used in calculating other layout data
         */
        export interface ILayout {
            viewport: IViewport;
            chart: IChart;
            multiples: IMultiple;
            yAxis: IAxis;
            xAxis: IAxis;
            padding: IPaddingConfiguration
        }

        /**
         * Used to hold all padding measurements used in calculating other layout data in the chart
         * 
         * @property {IPaddingValues} chartArea                         -   Dimensions for padding the entire chart area
         * @property {IPaddingValues} chartSeries                       -   Dimensions for padding a small multiple
         * @property {IPaddingValues} chartAxisTitle                    -   Dimensions for padding an axis title
         */
        export interface IPaddingConfiguration {
            chartArea: IPaddingValues;
            chartSeries: IPaddingValues;
            chartAxisTitle: IPaddingValues;
        }

        /**
         * Individual dimensions for padding within our SVG elements
         * 
         * @property {number} top                                       -   Top padding amount
         * @property {number} right                                     -   Right padding amount
         * @property {number} bottom                                    -   Bottom padding amount
         * @property {number} left                                      -   Left padding amount
         */
        export interface IPaddingValues {
            top: number;
            right: number;
            bottom: number;
            left: number;
        }

        /**
         * All details required to display a chart axis, or any axis-related properties that other elements need
         * 
         * @property {number} width                                     -   Width of the axis (including all related objects such as title), in pixels
         * @property {number} height                                    -   Height of the axis (including all related objects such as title), in pixels
         * @property {IAxisValue} minValue                              -   Axis minimum value and associated value properties
         * @property {IAxisValue} maxValue                              -   Axis maximum value and associated value properties
         * @property {IValueFormatter} numberFormat                     -   Number format of axis values, based on visual properties
         * @property {IAxisMasterTitle} masterTitle                     -   All properties for axis, based on visual properties
         * @property {number[]} range                                   -   2-value array of min/max axis values, used for setting d3 axis range
         * @property {number[]} domain                                  -   2-value array of min/max axis values, used for setting d3 axis domain
         * @property {number} ticks                                     -   Number of ticks to use for the axis
         * @property {any} scale                                        -   D3 scale used for the axis
         * @property {number} labelWidth                                -   Calculated width of labels, in pixels
         * @property {number} labelHeight                               -   Calculated height of labels, in pixels
         * @property {IAxisPolyLine} line                               -   Poly line properties for custom axis generation
         * @property {IAxisConfiguration} inner                         -   Inner (multiple-level) axis-specific configuration
         * @property {IAxisConfiguration} outer                         -   Outer (row or column-level) axis-specific configuration
         */
        export interface IAxis {
            width: number;
            height: number;
            minValue: IAxisValue;
            maxValue: IAxisValue;
            numberFormat: IValueFormatter;
            masterTitle: IAxisMasterTitle;
            range: number[];
            domain: number[];
            ticks: number;
            scale: any;
            labelWidth: number;
            labelHeight: number;
            line: IAxisPolyLine;            
            inner: IAxisConfiguration;
            outer: IAxisConfiguration;
        }

        export interface IAxisMasterTitle extends IAxisTitle {}

        /**
         * Used to hold any axis-specific configuration that doesn't sensibly fit inside the main axis but might be used for inidividual "sub-axes"
         * 
         * @property {d3.svg.Axis} generator                            -   D3 axis generation for axis
         */
        export interface IAxisConfiguration {
            generator: d3.svg.Axis;
        }

        /**
         * Raw value and text properties for a chart axis
         * 
         * @property {number} value                                     -   Raw axis value
         * @property {TextProperties} textProperties                    -   Properties for value, including formatted value for supplied font configuration
         */
        export interface IAxisValue {
            value: number;
            textProperties: TextProperties;
        }

        /**
         * All details required to render an axis title, or for other elements to consider when sizing
         * 
         * @property {string} style                                     -   As per visual properties (typically, value, unit or both)
         * @property {string[]} measureNames                            -   Array of all distinct measure names contained in the multiples
         * @property {TextProperties} textProperties                    -   Properties for title, including formatted value for supplied font configuration
         * @property {number} width                                     -   Calculated width of title, based on text properties (for Y-axis this is actually the height due to 90 degree rotation)
         * @property {number} height                                    -   Calculated height of title, based on text properties
         * @property {number} x                                         -   Calculated x-position of title
         * @property {number} y                                         -   Calculated y-position of title
         * @property {boolean} show                                     -   Whether to actually display title or not
         */
        export interface IAxisTitle {
            style: string;
            measureNames: string[];
            textProperties: TextProperties;
            width: number;
            height: number;
            x: number;
            y: number;
            show: boolean;
        }

        /**
         * Used to specify dimensions of a chart axis line
         * 
         * @property {number} top                                       -   Top position of axis line
         * @property {number} tickMarkLength                            -   Length of tick marks
         */
        export interface IAxisPolyLine {
            top: number;
            tickMarkLength: number;
        }

        /** 
         * Everything needed to render our small multiples within our chart
         * 
         * @property {number} availableHeight                           -   The height available for all multiples relative to our viewport and chart configuration
         * @property {number} count                                     -   The total number of small multiples to render in our chart
         * @property {number} maxPerRow                                 -   The maximum number of multiples to render in each row
         * @property {IMultipleRow} rows                                -   Configuration for each row of multiples rendered inside the chart
         * @property {IMultipleColumn} columns                          -   Configuration for each column of multiples rendered inside each row
         * @property {IMultipleLabel} label                             -   Configuration for display of label in each small multiple
         * @property {string} translate                                 -   X/Y coordinates to translate clipping areas and overlays to match dimensions based on configuration
         * @property {number} borderStrokeWidth                         -   Resolved stroke width of border, based on properties
         * @property {IMultipleContainer} clipContainer                 -   Configuration for the multiple container inner
         */
        export interface IMultiple {
            availableHeight: number;
            count: number;
            maxPerRow: number;
            rows: IMultipleRow;
            columns: IMultipleColumn;
            label: IMultipleLabel;
            translate: string;
            borderStrokeWidth: number;
            clipContainer: IMultipleClipContainer;
        }

        /** 
         * Everything needed to render a row of small multiples and calculate any dependencies on it
         * 
         * @property {number} count                                     -   The number of multiple rows in our chart
         * @property {number} height                                    -   The calculated height of the multiple row, with respect to the available height for all multiples and the number of rows
         * @property {number} width                                     -   The calculated width of the multiple row, with respect to the Y-axis width (if applicable)
         * @property {number} spacing                                   -   Spacing between rows (in px)
         * @property {number} x                                         -   Calculated x-coordinate for placement of row container when rendering
         */
        export interface IMultipleRow {
            count: number;
            height: number;
            width: number;
            spacing: number;
            x: number;
        }

        /**
         * Everything needed to render a small multiple column within a small multiple row and calculate any dependencies on it
         * 
         * @property {number} count                                     -   Number of columns to render inside a small multiple row
         * @property {number} width                                     -   The calcluated width of the multiple column, with respect to its parent row
         * @property {number} spacing                                   -   Spacing between columns (in px)
         */
        export interface IMultipleColumn {
            count: number;
            width: number;
            spacing: number;
        }

        /**
         * Configuration to manage placement of the clipping container within the small multiple (for plot lines)
         * 
         * @property {number} width                                     -   Width of the container, in pixels
         * @property {number} height                                    -   Height of the container, in pixels
         * @property {number} x                                         -   Calculated x-position of clip container
         * @property {number} y                                         -   Calculated y-position of clip container
         * 
         */
        export interface IMultipleClipContainer {
            width: number;
            height: number;
            x: number;
            y: number;
        }

        /**
         * Everything needed to render a small multiple label and calculate any dependencies on it
         * 
         * @property {number} height                                    -   Height that multiple takes up, based on its text properties
         * @property {TextProperties} textProperties                    -   Text properties, including multiple text and font configuration
         * @property {number} x                                         -   Calculated x-position of label
         * @property {number} y                                         -   Calculated y-position of label
         * @property {string} textAnchor                                -   Derived text-anchor based on visual properties
         */
        export interface IMultipleLabel {
            height: number;
            textProperties: TextProperties;
            x: number;
            y: number;
            textAnchor: string;
        }

        /**
         * Interface for a line chart small multiple (containing many data points)
         * 
         * @interface
         * @property {string} name                                      -   The name of the small multiple facet
         * @property {ISmallMultipleMeasure[]} measures                 -   Set of LineChartSeriesSmallMultipleMeasure values to plot within the small multiple
         */
        export interface ISmallMultipleData {
            name: string,
            measures: ISmallMultipleMeasure[]
        }

        /**
         * Interface for a measure within a multiple series (containing many data points)
         * 
         * @interface
         * @property {string} name                                      -   Name of measure
         * @property {string} queryName                                 -   The query name used to find the measure metadata in the data view
         * @property {string} formatString                              -   The format string used to format the measure for display
         * @property {ISmallMultipleCategoryDataPoint[]} categoryData   -   All category/value data for this measure
         * @property {string} color                                     -   Colour assigned to the measure
         */
        export interface ISmallMultipleMeasure {
            name: string;
            queryName: string;
            formatString: string;
            categoryData: ISmallMultipleCategoryDataPoint[];
            color: string;
            selectionId: ISelectionId
        }

        /**
         * Interface for a category/data point within a measure
         * 
         * @interface
         * @property {string} name                                      -   Name of category
         * @property {number} value                                     -   Data value for point
         * @property {VisualTooltipDataItem[]} tooltips                 -   All VisualToolTipDataItem entries to add to any tooltips that need to be displayed for this data point
         */
        export interface ISmallMultipleCategoryDataPoint {
            name: any;
            value: number;
            tooltips: VisualTooltipDataItem[];
        }

        /**
         * Map the data views into the view model and set up the other layout bare minimums. 
         * We will need to do the remainder of the layout after calculating the legend, but we can get some things done here.
         * 
         * @param {VisualUpdateOptions} options                         -   options from visual instantiation
         * @param {IVisualHost} host                                    -   host from visual instantiation
         * @param {VisualSettings} settings                             -   parsed and processed settings from properties pane
         */
        export function visualTransform(options: VisualUpdateOptions, host: IVisualHost, settings: VisualSettings): IViewModel {
            let dataViews = options.dataViews;

            /** Create a bare-minimum view model */
                let multiplesData = [] as ISmallMultipleData[],
                    layout = {
                        viewport: {} as IViewport,
                        chart: {} as IViewport,
                        padding: {
                            chartArea: {
                                top: 10,
                                right: 10,
                                bottom: 10,
                                left: 10
                            },
                            chartSeries: {
                                top: 4,
                                right: 4,
                                bottom: 4,
                                left: 4
                            },
                            chartAxisTitle: {
                                top: 5,
                                right: 5,
                                bottom: 5,
                                left: 5
                            }
                        },
                        multiples: {} as IMultiple,
                        yAxis: {
                            masterTitle: {} as IAxisMasterTitle
                        } as IAxis,
                        xAxis: {
                            masterTitle: {} as IAxisMasterTitle,
                            line: {
                                top: 4,
                                tickMarkLength: 4
                            } as IAxisPolyLine
                        } as IAxis,
                    }

            /** Return this bare-minimum model if the conditions for our data view are not satisfied (basically don't draw the chart) */
                if (!dataViews
                    || !dataViews[0]
                    || !dataViews[0].matrix
                    || !dataViews[0].matrix.columns
                    || !dataViews[0].matrix.rows
                    || !dataViews[0].matrix.valueSources
                    || !dataViews[0].metadata
                ) {
                    return {
                        multiples: multiplesData,
                        layout: layout
                    }
                }

            /** Assuming we're good after that, let's traverse the data view and metadata to populate our view model */

                let columns = dataViews[0].matrix.columns,
                    rows = dataViews[0].matrix.rows,
                    valueSources = dataViews[0].matrix.valueSources,
                    metadata = dataViews[0].metadata,
                    categoryMetadata = metadata.columns.filter(c => c.roles['category'])[0],
                    colorPalette: IColorPalette = host.colorPalette,
                    yMax: number = 0,
                    yMin: number = 0,
                    xMax: number,
                    xMaxFormatted: string,
                    xMin: number,
                    xMinFormatted: string,
                    measureNames = [];

                /** Populate the small multiple data from our data columns */
                    multiplesData = columns.root.children.map(function(multiple, multipleIndex){
                        return {
                            name: multiple.value.toString(),
                            measures: valueSources.map(function(measure, measureIndex) {
                                    /** Obtain the default colour based on the measure */
                                        let defaultColor: Fill = {
                                            solid: {
                                                color: colorPalette.getColor(measure.displayName + '').value
                                            }
                                        };
                                    /** Get measure metadata from datview, so we can do formatting etc. later on */
                                        let measureMetadata = valueSources[measureIndex];
                                    /** Add our measure name to our list for the view model layout */
                                        if (measureNames.indexOf(measure.displayName) == -1) {
                                            measureNames.push(measure.displayName)
                                        }
                                    return {                        
                                        name: measure.displayName,
                                        formatString: measure.format,
                                        queryName: measureMetadata.queryName,
                                        selectionId: host.createSelectionIdBuilder()
                                            .withMeasure(measureMetadata.queryName)
                                            .createSelectionId(),
                                        categoryData: rows.root.children.map(function(category) {
                                            let targetKey = multipleIndex * valueSources.length + measureIndex
                                            let categoryValue = <number>category.value;
                                            let value = <number>category.values[targetKey].value;
                                            /** Get highest/lowest x/y values; easier to do here rather than re-processing later on */
                                                yMax = Math.max(isNaN(yMax) ? value : yMax, value);
                                                yMin = Math.min(isNaN(yMin) ? value : yMin, value);
                                                xMax = Math.max(isNaN(xMax) ? categoryValue: xMax, categoryValue);
                                                xMin = Math.min(isNaN(xMin) ? categoryValue: xMin, categoryValue);
                                                xMaxFormatted = categoryValue >= xMax ? valueFormatter.format(categoryValue, categoryMetadata.format) : xMaxFormatted;
                                                xMinFormatted = categoryValue <= xMin ? valueFormatter.format(categoryValue, categoryMetadata.format) : xMinFormatted;
                                            return {
                                                name: categoryValue,
                                                value: value,
                                                tooltips: [
                                                    {
                                                        header: `${multiple.value} - ${valueFormatter.format(category.value, categoryMetadata.format)}`,
                                                        displayName: measureMetadata.displayName,
                                                        value: `${valueFormatter.format(value, measureMetadata.format)}`,
                                                        color: smallMultipleLineChartUtils
                                                                .getValue<Fill>(valueSources[measureIndex].objects, 'colorSelector', 'fill', defaultColor)
                                                                .solid.color
                                                    }
                                                ]
                                            }   
                                        }),
                                        color: smallMultipleLineChartUtils.getValue<Fill>(valueSources[measureIndex].objects, 'colorSelector', 'fill', defaultColor).solid.color
                                    }
                                })
                        };
                    });

            /** Set up as much of the remainder of the view model as we can (we'll need to do the rest after working out the legend) */

                /** Multiples */
                    let multipleCount = multiplesData.length,
                        multipleMaxPerRow = settings.smallMultiple.maximumMultiplesPerRow,
                        multipleColumnsPerRow = (!multipleMaxPerRow ||  multipleMaxPerRow > multipleCount) ? multipleCount : multipleMaxPerRow,
                        multipleRowCount = Math.ceil(multipleCount / multipleColumnsPerRow),
                        multipleTextProperties = {
                            text: multiplesData[0].name,
                            fontFamily: settings.smallMultiple.fontFamily,
                            fontSize: PixelConverter.toString(settings.smallMultiple.fontSize)
                        };

                    layout.multiples = {
                        count: multipleCount,
                        maxPerRow: multipleMaxPerRow,
                        columns: {
                            count: multipleColumnsPerRow,
                            spacing: settings.smallMultiple.spacingBetweenColumns
                        },
                        rows: {
                            count: multipleRowCount,
                            spacing: multipleRowCount > 1 && settings.smallMultiple.spacingBetweenRows
                                ? settings.smallMultiple.spacingBetweenRows
                                : 0
                        },
                        clipContainer: {} as IMultipleClipContainer,
                        label: {
                            textProperties: multipleTextProperties,
                            height: (settings.smallMultiple.showMultipleLabel) 
                                ? textMeasurementService.measureSvgTextHeight(multipleTextProperties)
                                : 0
                        },
                        borderStrokeWidth: settings.smallMultiple.border
                            ? settings.smallMultiple.borderStrokeWidth
                            : 0
                    } as IMultiple

                /** X-axis */
                    layout.xAxis.domain = [
                        xMin,
                        xMax
                    ];
                    layout.xAxis.minValue = {
                        value: xMin,
                        textProperties: {
                            text: xMinFormatted,
                            fontFamily: settings.xAxis.fontFamily,
                            fontSize: PixelConverter.toString(settings.xAxis.fontSize)
                        }
                    } as IAxisValue;
                    layout.xAxis.maxValue = {
                        value: xMax,
                        textProperties: {
                            text: xMaxFormatted,
                            fontFamily: settings.xAxis.fontFamily,
                            fontSize: PixelConverter.toString(settings.xAxis.fontSize)
                        }
                    } as IAxisValue;
                    layout.xAxis.masterTitle = {
                        show: settings.xAxis.showTitle,
                        measureNames: [],
                        textProperties: {
                            text: (!settings.xAxis.titleText)
                                ? categoryMetadata.displayName
                                : settings.xAxis.titleText,
                            fontFamily: settings.xAxis.titleFontFamily,
                            fontSize: PixelConverter.toString(settings.xAxis.titleFontSize)
                        }
                    } as IAxisMasterTitle

                /** Y-axis */

                    /** We format the Y-axis ticks based on the default formatting of the first measure, or the axis properties,
                     *  if they are different.
                     */
                        layout.yAxis.numberFormat = valueFormatter.create({
                            format: multiplesData[0].measures[0].formatString,
                            value : (settings.yAxis.labelDisplayUnits == 0 
                                ? yMax
                                : settings.yAxis.labelDisplayUnits
                            ),
                            precision: (settings.yAxis.precision != null
                                ? settings.yAxis.precision
                                : null
                            )
                        });

                    layout.yAxis.domain = function() {
                        return [
                            settings.yAxis.start || settings.yAxis.start == 0
                                ? settings.yAxis.start
                                : yMin,
                            settings.yAxis.end || settings.yAxis.end == 0
                                ? settings.yAxis.end
                                : yMax
                        ]
                    }();
                    layout.yAxis.minValue = {
                        value: yMin,
                        textProperties: {
                            text: layout.yAxis.numberFormat.format(yMin),
                            fontFamily: settings.yAxis.fontFamily,
                            fontSize: PixelConverter.toString(settings.yAxis.fontSize)
                        }
                    } as IAxisValue;
                    layout.yAxis.maxValue = {
                        value: yMax,
                        textProperties: {
                            text: layout.yAxis.numberFormat.format(yMax),
                            fontFamily: settings.yAxis.fontFamily,
                            fontSize: PixelConverter.toString(settings.yAxis.fontSize)
                        }
                    } as IAxisValue;
                    layout.yAxis.masterTitle = {
                        show: settings.yAxis.showTitle,
                        measureNames: measureNames,
                        textProperties: {
                            text: function() {            
                                /** If we supplied a title, use that, otherwise format our measure names */
                                    let title = (!settings.yAxis.titleText) 
                                        ? measureNames.join(', ').replace(/, ([^,]*)$/, ' and $1')
                                        : settings.yAxis.titleText;
            
                                /** Return the correct title based on our supplied settings */
                                    if (settings.yAxis.labelDisplayUnits == 1) {
                                        return title;
                                    }
                                    switch (settings.yAxis.titleStyle) {
                                        case 'title': {
                                            return title;
                                        }
                                        case 'unit': {
                                            return layout.yAxis.numberFormat.displayUnit.title;
                                        }
                                        case 'both': {
                                            return `${title} (${layout.yAxis.numberFormat.displayUnit.title})`;
                                        }
                                    }
                            }(),
                            fontFamily: settings.yAxis.titleFontFamily,
                            fontSize: PixelConverter.toString(settings.yAxis.titleFontSize)
                        } as TextProperties
                    } as IAxisMasterTitle;

            return {
                multiples: multiplesData,
                layout: layout
            }

        }

        /**
         * Calculate the remainder of all other view model properties, post-population of our small multiple data, and working 
         * out the space required for the chart legend, returning an updated view model for use in the update routine
         * 
         * @param {VisualupdateOptions} options                         - Options from visual instantiation
         * @param {VisualSettings} settings                             - Parsed and processed settings from properties pane
         * @param {IViewModel} viewModel                                - Our viewmodel in its current state
         */
        export function mapLayout(options: VisualUpdateOptions, settings: VisualSettings, viewModel: IViewModel): IViewModel {
            let multiples = viewModel.multiples,
                layout = viewModel.layout;

            /** Now we have revised viewport size after creating legend, we can calculate the remainder */
                layout.viewport.width = options.viewport.width;
                layout.viewport.height = options.viewport.height;
                
                layout.chart.width = options.viewport.width;
                layout.chart.height = options.viewport.height;
    
            /** Calculate overlay and clip X/Y coordinates */
                layout.multiples.translate = function() {
                    let x = 0,
                        y: number;
                    switch(settings.smallMultiple.labelPosition) {
                        case 'top': {
                            y = layout.multiples.label.height;
                            break;
                        }
                        case 'bottom': {
                            y = 0;
                            break;
                        }
                    }
                    return `translate(${x}, ${y})`;
                }();

            /** We now need to calculate our axes and the space they'll take before we assign anything else */

                /** Theoretical Height of X-Axis */

                    /** Master title height */
                        layout.xAxis.masterTitle.height = (settings.xAxis.showTitle) 
                            ?   layout.padding.chartAxisTitle.bottom
                                + textMeasurementService.measureSvgTextHeight(
                                        layout.xAxis.masterTitle.textProperties,
                                        layout.xAxis.masterTitle.textProperties.text
                                    )
                                + layout.padding.chartAxisTitle.top
                            : 0;

                    /** Label height */
                        layout.xAxis.labelHeight = settings.xAxis.show && settings.xAxis.showLabels
                            ?   Math.max(
                                    textMeasurementService.measureSvgTextHeight(layout.xAxis.minValue.textProperties),
                                    textMeasurementService.measureSvgTextHeight(layout.xAxis.maxValue.textProperties)
                                )
                            :   0;

                    /** Calculate total height, including labels TODO: Split out into components for rendering; will proably need extra interface */
                        layout.xAxis.height = settings.xAxis.show
                            ?   layout.xAxis.labelHeight
                                +   layout.xAxis.line.top
                                +   (settings.xAxis.showAxisLine 
                                        ? layout.xAxis.line.top + layout.xAxis.line.tickMarkLength
                                        : 0
                                    )
                                +   layout.xAxis.masterTitle.height
                            :   0;

                /** Resolve our multiple available height and row height now we know about the X-axis */
                    layout.multiples.availableHeight = layout.chart.height - layout.xAxis.height;

                /** Adjust multiple height for spacing between rows */
                    layout.multiples.rows.height =  (layout.multiples.availableHeight / layout.multiples.rows.count) - layout.multiples.rows.spacing;

                /** Height and x/y of clip container */
                    layout.multiples.clipContainer.height = layout.multiples.rows.height
                                                            - layout.multiples.label.height
                                                            - layout.padding.chartArea.top;
                    layout.multiples.clipContainer.x = 0;
                    layout.multiples.clipContainer.y = function() {
                        switch(settings.smallMultiple.labelPosition) {
                            case 'top': {
                                return layout.multiples.label.height;
                            }
                            case 'bottom': {
                                return 0;
                            }
                        }
                    }();

                /** Theoretical width and height of Y-Axis */
                    layout.yAxis.masterTitle.height = layout.multiples.availableHeight;
                    layout.yAxis.height = layout.multiples.rows.height - layout.multiples.label.height - layout.padding.chartArea.bottom;
                    layout.yAxis.ticks = axisHelper.getRecommendedNumberOfTicksForYAxis(layout.yAxis.height);

                    /** Calculate title width now that we have the text */
                        layout.yAxis.masterTitle.width = (settings.yAxis.show && settings.yAxis.showTitle) 
                            ?   layout.padding.chartAxisTitle.left
                                    + textMeasurementService.measureSvgTextHeight(
                                            layout.yAxis.masterTitle.textProperties,
                                            layout.yAxis.masterTitle.textProperties.text
                                        )
                                    + layout.padding.chartAxisTitle.right
                            :   0;

                    /** Width of labels */
                        layout.yAxis.labelWidth = settings.yAxis.show && settings.yAxis.showLabels
                            ?   Math.round(
                                    Math.max(
                                        textMeasurementService.measureSvgTextWidth(layout.yAxis.minValue.textProperties),
                                        textMeasurementService.measureSvgTextWidth(layout.yAxis.maxValue.textProperties)
                                    )
                                )
                                + 10
                            :   0;

                    /** And x/y coordinates for title position */
                        layout.yAxis.masterTitle.x = -layout.yAxis.masterTitle.height / 2;
                        layout.yAxis.masterTitle.y = layout.padding.chartAxisTitle.left;

                    /** We now have everything we need for our whole Y-axis */
                        layout.yAxis.width = layout.yAxis.labelWidth + layout.yAxis.masterTitle.width;

                /** Now we have our Y-axis width we can calcluate the widths of everything else */
                    layout.multiples.rows.width = layout.chart.width - layout.yAxis.masterTitle.width;
                    layout.multiples.columns.width = ((layout.multiples.rows.width - layout.yAxis.labelWidth) / layout.multiples.columns.count) - layout.multiples.columns.spacing;

                    layout.multiples.clipContainer.width = layout.multiples.columns.width
                                                            - layout.padding.chartArea.left
                                                            - layout.padding.chartArea.right;

                    /** Text properties to allow us to calculate height */
                        layout.xAxis.width = layout.multiples.columns.width - layout.padding.chartSeries.right;
                        layout.xAxis.ticks = Math.min(
                            axisHelper.getRecommendedNumberOfTicksForXAxis(layout.xAxis.width),
                            layout.xAxis.maxValue.value - layout.xAxis.minValue.value
                        );
    
                /** Calculate small multiple label positioning */
                    layout.multiples.label.x = function() {
                        switch(settings.smallMultiple.labelAlignment) {
                            case 'left': {
                                return 0;
                            }
                            case 'center': {
                                return layout.multiples.columns.width / 2;
                            }
                            case 'right': {
                                return layout.multiples.columns.width;
                            }
                        }
                    }();
                    layout.multiples.label.y = function(){
                        switch(settings.smallMultiple.labelPosition) {
                            case 'top': {
                                return 0 + layout.multiples.label.height;
                            }
                            case  'bottom': {
                                return layout.multiples.rows.height;
                            }
                        }                                        
                    }();
                    layout.multiples.label.textAnchor = function() {
                        switch(settings.smallMultiple.labelAlignment) {
                            case 'left': {
                                return 'start';
                            }
                            case 'center': {
                                return 'middle';
                            }
                            case 'right': {
                                return 'end';
                            }
                        }
                    }();

                /** And calculate the ranges for our d3 axes */
                    layout.xAxis.range = [layout.padding.chartSeries.left, layout.xAxis.width];
                    layout.yAxis.range = function() {
                        switch (settings.smallMultiple.labelPosition) {
                            case 'top': {
                                return [
                                    layout.multiples.rows.height
                                        - layout.padding.chartArea.bottom,
                                    layout.padding.chartArea.top
                                        + layout.multiples.label.height
                                ]
                            }
                            case 'bottom': {
                                console.log('bottom');
                                return [
                                    layout.yAxis.height,
                                    layout.padding.chartArea.top
                                ]
                            }
                        }
                    }();

                /** Y-axis generation */

                    /** Scale */
                        layout.yAxis.scale = layout.yAxis.scale = d3.scale.linear()
                            .domain(layout.yAxis.domain)
                            .range(layout.yAxis.range)
                            .nice(layout.yAxis.ticks);

                    /** Outer - tick labels at start of multiple row */
                        layout.yAxis.outer = {
                            generator: d3.svg.axis()
                                .scale(layout.yAxis.scale)
                                .orient('left')
                                .ticks(layout.yAxis.ticks)
                                .tickFormat( d => settings.yAxis.showLabels 
                                    ?   layout.yAxis.numberFormat.format(d)
                                    :   ''
                                )
                                .tickSize(0, 0)
                        }

                    /** Inner - individual multiples */
                        layout.yAxis.inner = {
                            generator: d3.svg.axis()
                                .scale(layout.yAxis.scale)
                                .orient('left')
                                .ticks(layout.yAxis.ticks)
                                .tickFormat('')
                                .tickSize(-layout.multiples.columns.width, 0)
                        }

                /** X-axis generation */
                    
                    /** Scale */
                        layout.xAxis.scale = layout.xAxis.scale = d3.scale.linear()
                            .domain(layout.xAxis.domain)
                            .rangeRound(layout.xAxis.range);

                    /** Minor - individual multiple */
                        layout.xAxis.inner = {
                            generator: d3.svg.axis()
                                .scale(layout.xAxis.scale)
                                .orient('bottom')
                                .ticks(layout.xAxis.ticks)
                                .tickFormat('')
                                .tickSize(-layout.yAxis.range[0] + layout.yAxis.range[1], 0)
                        }

            return {
                multiples: multiples,
                layout: layout
            };
    
        }        
    
    }

}