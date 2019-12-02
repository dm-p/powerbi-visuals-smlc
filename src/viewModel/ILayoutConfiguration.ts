/** Power BI API Dependencies */
    import powerbi from 'powerbi-visuals-api';
    import IViewport = powerbi.IViewport;

/** Internal dependencies */
    import IDimensions from './IDimensions';
    import IElementSideDimension from './IElementSideDimension';

/**
 *
 */
    export default interface ILayoutConfiguration {
        visualViewport: IViewport;
        chartViewport: IViewport;
        minimumViewport: IViewport;
        columns: number;
        rows: number;
        x: number;
        y: number;
        smallMultipleDimensions: IDimensions;
        smallMultipleXConstant: number;
        smallMultipleBorderOffset: number;
        rowDimensions: IDimensions;
        smallMultipleMargin: IElementSideDimension;
        smallMultipleChartDimensions: IDimensions;
    }