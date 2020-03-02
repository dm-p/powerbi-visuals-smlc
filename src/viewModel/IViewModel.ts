// Power BI API Dependencies
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import IViewport = powerbi.IViewport;
    import { legendInterfaces } from 'powerbi-visuals-utils-chartutils';
    import LegendData = legendInterfaces.LegendData;

// Internal dependencies
    import ISmallMultiple from './ISmallMultiple';
    import IStatistics from './IStatistics';
    import IMeasure from './IMeasure';
    import ICategory from './ICategory';
    import ILayoutConfiguration from './ILayoutConfiguration';
    import IAxis from './IAxis';

/**
 * Used to manage how our visual is rendered.
 */
    export default interface IViewModel {
        locale: string;
        dataViewIsValid: boolean;
        initialViewport: IViewport;
        viewport: IViewport;
        categoryMetadata: ICategory;
        measureMetadata: IMeasure[];
        multiples: ISmallMultiple[];
        statistics: IStatistics;
        layout: ILayoutConfiguration;
        legend: LegendData;
        yAxis: IAxis;
        xAxis: IAxis;
    }