/** Power BI API Dependencies */
    import powerbi from 'powerbi-visuals-api';
    import IViewport = powerbi.IViewport;

/** Internal dependencies */
    import IDimensions from './IDimensions';
    import IElementSideDimension from './IElementSideDimension';
    import { ISmallMultipleGrid } from '../smallMultiple/interfaces';

/**
 *
 */
    export default interface ILayoutConfiguration {
        grid: ISmallMultipleGrid;

        
        visualViewport: IViewport;
        chartViewport: IViewport;
        minimumViewport: IViewport;
        x: number;
        y: number;
        smallMultipleDimensions: IDimensions;
        smallMultipleXConstant: number;
        smallMultipleBorderOffset: number;
        rowDimensions: IDimensions;
        smallMultipleMargin: IElementSideDimension;
        smallMultipleChartDimensions: IDimensions;
    }