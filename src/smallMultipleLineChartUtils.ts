module powerbi.extensibility.visual {
    "use strict";

    export module smallMultipleLineChartUtils {

        export declare var xScale: d3.scale.Linear<number, number>;
        export declare var tooltipService: ITooltipService;
        export declare var visualContainerElement: HTMLElement;
        import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
        import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

        /**
         * Gets property value for a particular object.
         *
         * @function
         * @param {DataViewObjects} objects - Map of defined objects.
         * @param {string} objectName       - Name of desired object.
         * @param {string} propertyName     - Name of desired property.
         * @param {T} defaultValue          - Default value of desired property.
         */
        export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T ): T {
            if (objects) {
                let object = objects[objectName];
                if (object) {
                    let property: T = <T>object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
            return defaultValue;
        }

        /**
         * Gets the multiple, category and measure data from the data model
         * 
         * @param {SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint[]} dataPoints - Data points to extract values from
         * @returns {VisualTooltipDataItem[]}                 - Array of tooltip data items
         */
        export function getTooltipData(dataPoints: SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint[]): VisualTooltipDataItem[] {
            let tooltipData: VisualTooltipDataItem[] = [];
            dataPoints.map(function(dataPoint, dataPointIndex){
                dataPoint.tooltips.map(function(tooltip, tooltipIndex){
                    tooltipData.push(tooltip);
                });                
            });
            return tooltipData;
        }

        /** 
         * For a supplied overlay (SVG rect) element, calculate the mouse position and return an array of data points for the nearest category on the x-axis
         * 
         * @function
         * @property {any} overlay                                      - The specified overlay element to retrieve the data points from
         * @returns {LineChartSeriesSmallMultipleCategoryDataPoint[]}   - Array of data points across measures for category
         */
        export function getHighlightedDataPoints(overlay: any): SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint[] {
            let focus = d3.select(overlay.parentNode).select('.tooltipFocus'),
                xData = xScale.invert(d3.mouse(overlay)[0]),
                bisectValue = d3.bisector(function(d: SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint) { 
                    return d.name; 
                }).left,                   
                dataPoints: SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint[] = [];
            
            focus.selectAll('circle')
                .each(function(d, j) {
                    let data = d.measures[j].categoryData,
                        idx = bisectValue(data, xData, 1),
                        d0 = data[idx - 1],
                        d1 = data[idx],
                        e = xData - d0.name > d1.name - xData ? d1 : d0;
                    dataPoints.push(e);
                });
    
            return dataPoints;
        }

        /**
         * For supplied selection, textProperties and width, try to concatenate the text with ellipses if it overflows the specified width
         * 
         * @param selection             - D3 selection to apply formatting to
         * @param textProperties        - Properties of the text to assess
         * @param width                 - Width to fit the text
         */
        export function wrapText(selection: d3.Selection<any>, textProperties: TextProperties, width?: number): void {
            var width = width || 0,
                textLength = textMeasurementService.measureSvgTextWidth(
                    textProperties,
                    selection.text()
                ),
                text = selection.text();
            while (textLength > (width) && text.length > 0) {
                text = text.slice(0, -1);
                selection.text(text + '\u2026');
                textLength = textLength = textMeasurementService.measureSvgTextWidth(
                    textProperties,
                    selection.text()
                );
            }
            if (textLength > width) {
                selection.text('');
            }
        }

        export function renderYAxis(
            container: d3.Selection<any>,
            settings: VisualSettings,
            viewModel: SmallMultipleLineChartViewModel.IViewModel,
            axisKey: string
        ): void{

            let axisContainer = container
                .append('g')
                    .classed({
                        yAxisContainer: true
                    })
                    .style({
                        'font-size': viewModel.layout[axisKey].maxValue.textProperties.fontSize,
                        'font-family': settings.yAxis.fontFamily,
                        'fill': settings.yAxis.fontColor,
                        'stroke-width' : 1 /** TODO: Config */
                    });

            let axisTicks = axisContainer
                .append('g')
                    .classed({
                        'grid': true
                    })
                    .call(viewModel.layout[axisKey].d3Axis)
                    .attr({
                        transform: function(d) {
                            return `translate(${viewModel.layout[axisKey].width}, 0)`;
                        }
                    });

            /** This prevents fuzzing of the text if we have gridlines */
                axisTicks.selectAll('text')
                    .style({
                        'stroke': 'none'
                    });
        
            /** Apply gridline styling; there's probably a better way to do it, particularly with the stroke line styles ... */
                axisTicks.selectAll('line')
                    .attr({
                        stroke: settings.yAxis.gridlineColor,
                        'stroke-width': settings.yAxis.gridlines
                            ? settings.yAxis.gridlineStrokeWidth
                            : 0
                    })
                    .classed(settings.yAxis.gridlineStrokeLineStyle, true);

            /** Add axis title */
                if (viewModel.layout[axisKey].title && viewModel.layout[axisKey].title.show) {
                    axisContainer
                        .append('text')
                            .attr({
                                transform: 'rotate(-90)',
                                y: viewModel.layout[axisKey].title.y,
                                x: viewModel.layout[axisKey].title.x,
                                dy: '1em'
                            })
                            .style({
                                'text-anchor': 'middle',
                                'font-size': viewModel.layout[axisKey].title.textProperties.fontSize,
                                'font-family': settings.yAxis.titleFontFamily,
                                'fill': settings.yAxis.titleColor,
                            })
                            .text(viewModel.layout[axisKey].title.textProperties.text);
                }
            }

    }

}