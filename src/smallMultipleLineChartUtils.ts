module powerbi.extensibility.visual {
    "use strict";

    export module smallMultipleLineChartUtils {

        export declare var xScale: d3.scale.Linear<number, number>;
        export declare var tooltipService: ITooltipService;
        export declare var visualContainerElement: HTMLElement;

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

        export function getTooltipData(dataPoints: LineChartSeriesSmallMultipleCategoryDataPoint[]): VisualTooltipDataItem[] {
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
        export function getHighlightedDataPoints(overlay: any): LineChartSeriesSmallMultipleCategoryDataPoint[] {

            let focus = d3.select(overlay.parentNode).select('.tooltipFocus'),
                xData = xScale.invert(d3.mouse(overlay)[0]),
                bisectValue = d3.bisector(function(d: LineChartSeriesSmallMultipleCategoryDataPoint) { 
                    return d.name; 
                }).left;
    
            let dataPoints: LineChartSeriesSmallMultipleCategoryDataPoint[] = [];
    
            focus.selectAll('circle')
                .each(function(d, j) {
                    let data = d.measures[j].categories,
                        idx = bisectValue(data, xData, 1),
                        d0 = data[idx - 1],
                        d1 = data[idx],
                        e = xData - d0.name > d1.name - xData ? d1 : d0;
                    dataPoints.push(e);
                });
    
            return dataPoints;
        }

    }

}