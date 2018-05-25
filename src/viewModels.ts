module powerbi.extensibility.visual {
    "use strict";

    /**
     * Master view model for data set
     * 
     * @interface
     * @property {LineChartSeriesSmallMultiple[]} multiples             - Set of small multiples and data points to render
     * @property {number} yMax                                          - Highest y-value in our data
     * @property {number} yMin                                          - Lowest y-value in our data
     * @property {number} xMax                                          - Highest x-value in our data
     * @property {number} xMin                                          - Lowest x-value in our data
     */
    export interface LineChartSmallMultipleViewModel {
        multiples: LineChartSeriesSmallMultiple[];
        yMax: number;
        yMin: number;
        xMax: number;
        xMin: number;
    }

    /**
     * Interface for a line chart small multiple (containing many data points)
     * 
     * @interface
     * @property {string} facet                                         - Corresponding facet to small multiple by
     * @property {LineChartSeriesSmallMultipleMeasure[]} measures       - Set of LineChartSeriesSmallMultipleMeasure values to plot within
     *                                                                      the small multiple
     */
    export interface LineChartSeriesSmallMultiple {
        facet: string,
        measures: LineChartSeriesSmallMultipleMeasure[]
        // TODO: Series min/max
    }

    /**
     * Interface for a measure within a multiple series (containing many data points)
     * 
     * @interface
     * @property {string} name                                          - Name of measure
     * @property {string} queryName
     * @property {LineChartSeriesSmallMultipleCategory[]} categories
     * @property {string} color                                         - Colour assigned to the measure
     */
    export interface LineChartSeriesSmallMultipleMeasure {
        name: string;
        queryName: string;
        categories: LineChartSeriesSmallMultipleCategoryDataPoint[];
        color: string;
        selectionId: ISelectionId
    }

    /**
     * Interface for a measure within a multiple series (containing many data points)
     * 
     * @interface
     * @property {string} name                              - Name of category
     * @property {number} value                             - Data value for point
     * @property {VisualTooltipDataItem[]} tooltips
     */
    export interface LineChartSeriesSmallMultipleCategoryDataPoint {
        name: any;
        value: number;
        tooltips: VisualTooltipDataItem[];
    }
}