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
         * @property {IAxis} yAxisRow                                   -   Data specific to the rendering of the Y-axis in each small multiple row
         * @property {IAxis} xAxis                                      -   Data specific to the rendering of the X-axis in our small multiples
         * @property {IAxis} xAxisColumns                               -   Data specific to the rendering of the X-axis in each small multiple column
         * @property {IPaddingConfiguration} padding                    -   All padding measurements used in calculating other layout data
         */
        export interface ILayout {
            viewport: IViewport;
            chart: IChart;
            multiples: IMultiple;
            yAxis: IAxis;
            yAxisRow: IAxis;
            xAxis: IAxis;
            xAxisColumn: IAxis;
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
         * Dimensions of chart viewport
         * 
         * @property {number} width                                     -   Width of viewport, in pixels
         * @property {number} height                                    -   Height of viewport, in pixels
         */
        export interface IViewport {
            width: number;
            height: number;
        }

        /**
         * Dimensions of chart within viewport. This is currently the same as the viewport but we will likely need it to be different if we have to scroll etc.
         * 
         * @property {number} width                                     -   Width of chart area, in pixels
         * @property {number} height                                    -   Height of chart area, in pixels
         */
        export interface IChart {
            width: number;
            height: number;
        }

        /**
         * All details required to display a chart axis, or any axis-related properties that other elements need
         * 
         * @property {number} width                                     -   Width of the axis (including all related objects such as title), in pixels
         * @property {number} height                                    -   Height of the axis (including all related objects such as title), in pixels
         * @property {IAxisValue} minValue                              -   Axis minimum value and associated value properties
         * @property {IAxisValue} maxValue                              -   Axis maximum value and associated value properties
         * @property {IValueFormatter} numberFormat                     -   Number format of axis values, based on visual properties
         * @property {IAxisTitle} title                                 -   All properties for axis, based on visual properties
         * @property {number[]} range                                   -   2-value array of min/max axis values, used for setting d3 axis range
         * @property {number[]} domain                                  -   2-value array of min/max axis values, used for setting d3 axis domain
         * @property {number} ticks                                     -   Number of ticks to use for the axis
         * @property {any} scale                                        -   D3 scale used for the axis
         * @property {d3.svg.Axis} generator                            -   D3 axis generation for axis
         */
        export interface IAxis {
            width: number;
            height: number;
            minValue: IAxisValue;
            maxValue: IAxisValue;
            numberFormat: IValueFormatter;
            title: IAxisTitle;
            range: number[];
            domain: number[];
            ticks: number;
            scale: any;
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
         * @property {number} x                                         -   Calculated x-position of title
         * @property {number} y                                         -   Calculated y-position of title
         * @property {boolean} show                                     -   Whether to actually display title or not
         */
        export interface IAxisTitle {
            style: string;
            measureNames: string[];
            textProperties: TextProperties;
            width: number;
            x: number;
            y: number;
            show: boolean;
        }

        /** 
         * Everything needed to render our small multiples within our chart
         * 
         * @property {number} availableHeight                           - The height available for all multiples relative to our viewport and chart configuration
         * @property {number} count                                     - The total number of small multiples to render in our chart
         * @property {number} maxPerRow                                 - The maximum number of multiples to render in each row
         * @property {IMultipleRow} rows                                - Configuration for each row of multiples rendered inside the chart
         * @property {IMultipleColumn} columns                          - Configuration for each column of multiples rendered inside each row
         * @property {IMultipleLabel} label                             - Configuration for display of label in each small multiple
         * @property {string} translate                                 - X/Y coordinates to translate clipping areas and overlays to match dimensions based on configuration
         * @property {number} borderStrokeWidth                         - Resolved stroke width of border, based on properties
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
        }

        /** 
         * Everything needed to render a row of small multiples and calculate any dependencies on it
         * 
         * @property {number} count                                     - The number of multiple rows in our chart
         * @property {number} height                                    - The calculated height of the multiple row, with respect to the available height for all multiples and the number of rows
         * @property {number} width                                     - The calculated width of the multiple row, with respect to the Y-axis width (if applicable)
         * @property {number} spacing                                   - Spacing between rows (in px)
         */
        export interface IMultipleRow {
            count: number;
            height: number;
            width: number;
            spacing: number;
        }

        /**
         * Everything needed to render a small multiple column within a small multiple row and calculate any dependencies on it
         * 
         * @property {number} count                                     - Number of columns to render inside a small multiple row
         * @property {number} width                                     - The calcluated width of the multiple column, with respect to its parent row
         * @property {number} spacing                                   - Spacing between columns (in px)
         */
        export interface IMultipleColumn {
            count: number;
            width: number;
            spacing: number;
        }

        /**
         * Everything needed to render a small multiple label and calculate any dependencies on it
         * 
         * @property {number} height                                    - Height that multiple takes up, based on its text properties
         * @property {TextProperties} textProperties                    - Text properties, including multiple text and font configuration
         * @property {number} x                                         - Calculated x-position of label
         * @property {number} y                                         - Calculated y-position of label
         * @property {string} textAnchor                                - Derived text-anchor based on visual properties
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
         * @property {string} name                                      - The name of the small multiple facet
         * @property {ISmallMultipleMeasure[]} measures                 - Set of LineChartSeriesSmallMultipleMeasure values to plot within the small multiple
         */
        export interface ISmallMultipleData {
            name: string,
            measures: ISmallMultipleMeasure[]
        }

        /**
         * Interface for a measure within a multiple series (containing many data points)
         * 
         * @interface
         * @property {string} name                                      - Name of measure
         * @property {string} queryName                                 - The query name used to find the measure metadata in the data view
         * @property {string} formatString                              - The format string used to format the measure for display
         * @property {ISmallMultipleCategoryDataPoint[]} categoryData   - All category/value data for this measure
         * @property {string} color                                     - Colour assigned to the measure
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
         * @property {string} name                                      - Name of category
         * @property {number} value                                     - Data value for point
         * @property {VisualTooltipDataItem[]} tooltips                 - All VisualToolTipDataItem entries to add to any tooltips that need to be displayed for this data point
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
         * @param {VisualupdateOptions} options                         - options from visual instantiation
         * @param {IVisualHost} host                                    - host from visual instantiation
         * @param {VisualSettings} settings                             - parsed and processed settings from properties pane
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
                                top: 0,
                                right: 4,
                                bottom: 0,
                                left: 4
                            },
                            chartAxisTitle: {
                                top: 0,
                                right: 5,
                                bottom: 0,
                                left: 5
                            }
                        },
                        multiples: {} as IMultiple,
                        yAxis: {} as IAxis,
                        yAxisRow: {} as IAxis,
                        xAxis: {} as IAxis,
                        xAxisColumn: {} as IAxis
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
                    xMinFormatted: string;

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
                                    return {                        
                                        name: measure.displayName,
                                        formatString: measure.format,
                                        queryName: measureMetadata.queryName,
                                        selectionId: host.createSelectionIdBuilder()
                                            .withMeasure(measureMetadata.queryName)
                                            .createSelectionId(),
                                        categoryData: rows.root.children.map(function(category, categoryIndex) {
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

                /** X-axis min/max (we're not displaying this yeat so we'll just add the values rather than font config etc.*/
                    layout.xAxis.minValue = layout.xAxisColumn.minValue = {
                        value: xMin,
                        textProperties: {
                            text: xMinFormatted
                        }
                    } as IAxisValue;
                    layout.xAxis.maxValue = layout.xAxisColumn.maxValue = {
                        value: xMax,
                        textProperties: {
                            text: xMaxFormatted
                        }
                    } as IAxisValue;

                /** Y-axis min/max */
                    layout.yAxisRow.minValue = layout.yAxis.minValue = {
                        value: yMin
                    } as IAxisValue;
                    layout.yAxisRow.maxValue = layout.yAxis.maxValue = {
                        value: yMax
                    } as IAxisValue;

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
            let viewport = options.viewport,
                multiples = viewModel.multiples,
                layout = viewModel.layout;
    
            /** It's been observed that if we use 100% of the height with overflow set on the viewport (which we might need to use
             *  when applying the minimum dimensions on a multiple later on), that we will always get a scrollbar, so this is used
             *  to scale the chart height to a value that has bene observed to work for default multiple dimensions.
            */
                const heightScale: number = 0.99; 
    
            /** Now we have revised viewport size after creating legend, we can calculate the remainder */
                layout.viewport = {
                    width: options.viewport.width,
                    height: options.viewport.height
                };
                layout.chart = {
                    width: options.viewport.width,
                    height: options.viewport.height * heightScale
                };
    
            /** Core multiples configuration */
                let multipleCount = multiples.length,
                    multipleMaxPerRow = settings.smallMultiple.maximumMultiplesPerRow,
                    multipleColumnsPerRow = (!multipleMaxPerRow ||  multipleMaxPerRow > multipleCount) ? multipleCount : multipleMaxPerRow,
                    multipleRowCount = Math.ceil(multipleCount / multipleColumnsPerRow),
                    multipleTextProperties = {
                        text: multiples[0].name,
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
    
            /** Calculate overlay and clip X/Y coordinates */
                layout.multiples.translate = function() {
                    let x = layout.padding.chartSeries.left,
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

                /** X-axis */

                    /** Text properties to allow us to calculate height */
                        layout.xAxisColumn.minValue.textProperties.fontFamily = layout.xAxisColumn.maxValue.textProperties.fontFamily = settings.xAxis.fontFamily;
                        layout.xAxisColumn.minValue.textProperties.fontSize = layout.xAxisColumn.maxValue.textProperties.fontSize = PixelConverter.toString(settings.xAxis.fontSize);

                    layout.xAxisColumn.height = settings.xAxis.show
                        ?   Math.max(
                                textMeasurementService.measureSvgTextHeight(layout.xAxisColumn.minValue.textProperties),
                                textMeasurementService.measureSvgTextHeight(layout.xAxisColumn.maxValue.textProperties)
                            ) 
                            +   (settings.xAxis.showAxisLine 
                                    ? 7
                                    : 4
                                )
                        :   0;

                /** Resolve our multiple available height and row height now we know about the X-axis */
                    layout.multiples.availableHeight = layout.chart.height - layout.xAxisColumn.height;

                /** Adjust multiple height for spacing between rows */
                    layout.multiples.rows.height = (layout.multiples.availableHeight / multipleRowCount) - layout.multiples.rows.spacing;
                
                /** Y-axis */
                    layout.yAxisRow.height = layout.yAxis.height = layout.multiples.rows.height - layout.multiples.label.height - layout.padding.chartArea.bottom;
                    layout.yAxisRow.ticks = layout.yAxis.ticks = axisHelper.getRecommendedNumberOfTicksForYAxis(layout.yAxisRow.height);
                    layout.yAxisRow.title = {
                        show: settings.yAxis.showTitle,
                        measureNames: multiples[0].measures.map(function(measure) {
                            return measure.name;
                        }),
                        textProperties: {
                            text: settings.yAxis.titleText,
                            fontFamily: settings.yAxis.titleFontFamily,
                            fontSize: PixelConverter.toString(settings.yAxis.titleFontSize)
                        }
                    } as SmallMultipleLineChartViewModel.IAxisTitle;

                    layout.yAxis.title = {
                        show: false,
                        width: 0
                    } as SmallMultipleLineChartViewModel.IAxisTitle;
      
                /** We format the Y-axis ticks based on the default formatting of the first measure, or the axis properties,
                 *  if they are different.
                 */
                    layout.yAxisRow.numberFormat = valueFormatter.create({
                        format: multiples[0].measures[0].formatString,
                        value : (settings.yAxis.labelDisplayUnits == 0 
                            ? layout.yAxisRow.maxValue.value
                            : settings.yAxis.labelDisplayUnits
                        ),
                        precision: (settings.yAxis.precision != null
                            ? settings.yAxis.precision
                            : null
                        )
                    });
    
                /** Add our formatted min/max values */

                    /** Y-axis */
                        layout.yAxisRow.minValue.textProperties = {
                            text: layout.yAxisRow.numberFormat.format(layout.yAxisRow.minValue.value),
                            fontFamily: settings.yAxis.fontFamily,
                            fontSize: PixelConverter.toString(settings.yAxis.fontSize)
                        };
                        layout.yAxisRow.maxValue.textProperties = {
                            text: layout.yAxisRow.numberFormat.format(layout.yAxisRow.maxValue.value),
                            fontFamily: settings.yAxis.fontFamily,
                            fontSize: PixelConverter.toString(settings.yAxis.fontSize)
                        };
    
                /** Resolve actual axis text based on the additional Y-axis properties */
                    layout.yAxisRow.title.textProperties.text = function() {
                        let axis = layout.yAxisRow;
    
                        /** If we supplied a title, use that, otherwise format our measure names */
                            let title = (!settings.yAxis.titleText) 
                                ? axis.title.measureNames.join(', ').replace(/, ([^,]*)$/, ' and $1')
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
                                    return axis.numberFormat.displayUnit.title;
                                }
                                case 'both': {
                                    return `${title} (${axis.numberFormat.displayUnit.title})`;
                                }
                            }
                    }();
    
                /** Calculate title width now that we have the text */
                    layout.yAxisRow.title.width = (settings.yAxis.showTitle) 
                        ?   layout.padding.chartAxisTitle.left
                            + textMeasurementService.measureSvgTextHeight(
                                    layout.yAxisRow.title.textProperties,
                                    layout.yAxisRow.title.textProperties.text
                                )
                            + layout.padding.chartAxisTitle.right 
                        : 0;

                /** And x/y coordinates for title position */
                    layout.yAxisRow.title.x = 0 - (layout.multiples.rows.height / 2);
                    layout.yAxisRow.title.y = 0 + (layout.yAxisRow.title.width / 2);
    
                /** We now have everything we need for our whole Y-axis */
                    layout.yAxisRow.width = function(){
                        if (settings.yAxis.show) {
                            return layout.yAxisRow.title.width
                                    + Math.round(
                                            Math.max(
                                                textMeasurementService.measureSvgTextWidth(layout.yAxisRow.minValue.textProperties),
                                                textMeasurementService.measureSvgTextWidth(layout.yAxisRow.maxValue.textProperties)
                                            )
                                        ) 
                                    + 10;
                        } else {
                            return 0;
                        }
                    }();

                    layout.yAxis.width = 0;
    
                /** Now we have our Y-axis width we can calcluate the widths of everything else */
                    layout.multiples.rows.width = layout.chart.width - layout.yAxisRow.width;
                    layout.multiples.columns.width = (layout.multiples.rows.width / layout.multiples.columns.count) - layout.multiples.columns.spacing;
                    layout.xAxis.width = layout.multiples.columns.width - layout.padding.chartSeries.right;
    
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
                    layout.xAxis.range = layout.xAxisColumn.range = [layout.padding.chartSeries.left, layout.xAxis.width];
                    layout.yAxisRow.range = layout.yAxis.range = function() {
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
                                    layout.yAxisRow.height,
                                    layout.padding.chartArea.top
                                ]
                            }
                        }
                    }();

                /** ...and the domains */
                    layout.xAxis.domain = layout.xAxisColumn.domain = [
                        viewModel.layout.xAxis.minValue.value,
                        viewModel.layout.xAxis.maxValue.value
                    ];
                    layout.yAxisRow.domain = layout.yAxis.domain = function() {
                        return [
                            settings.yAxis.start
                                ? settings.yAxis.start
                                : layout.yAxisRow.minValue.value,
                            settings.yAxis.end
                                ? settings.yAxis.end
                                : layout.yAxisRow.maxValue.value
                        ]
                    }();

                /** Y-axis generation */

                    /** Scale */
                        layout.yAxisRow.scale = layout.yAxis.scale = d3.scale.linear()
                            .domain(layout.yAxisRow.domain)
                            .range(layout.yAxisRow.range)
                            .nice(layout.yAxisRow.ticks);

                    /** Major - multiple row */
                        layout.yAxisRow.generator = d3.svg.axis()
                            .scale(layout.yAxisRow.scale)
                            .orient('left')
                            .ticks(layout.yAxisRow.ticks)
                            .tickFormat(d => (layout.yAxisRow.numberFormat.format(d)))
                            .tickSize(0, 0);

                    /** Minor - individual multiple tick lines */
                        layout.yAxis.generator = d3.svg.axis()
                            .scale(layout.yAxisRow.scale)
                            .orient('left')
                            .ticks(layout.yAxisRow.ticks)
                            .tickFormat('')
                            .tickSize(-layout.multiples.columns.width, 0);

                /** X-axis generation */
                    
                    /** Scale */
                        layout.xAxis.scale = layout.xAxisColumn.scale = d3.scale.linear()
                            .domain(layout.xAxis.domain)
                            .rangeRound(layout.xAxis.range);

            return {
                multiples: multiples,
                layout: layout
            };
    
        }        
    
    }

}