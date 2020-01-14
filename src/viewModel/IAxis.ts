/** Power BI API dependencies */
    import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
    import  IValueFormatter = valueFormatter.IValueFormatter;

/** Internal dependencies */
    import IText from './IText';
    import EAxisType from './EAxisType';
    import EAxisScaleType from './EAxisScaleType';

/**
 *
 */
    export default interface IAxis {
        axisType: EAxisType;
        numberFormat: IValueFormatter;
        masterTitle: IText;
        tickLabels: IText;
        tickWidth: number;
        tickHeight: number;
        ticks: number;
        tickValues: string[] | Date[] | number[];
        scale: d3.ScaleLinear<number, number> | d3.ScalePoint<string> | d3.ScaleTime<number, number>;
        scaleType: EAxisScaleType;
        titleIsCollapsed: boolean;
        ticksAreCollapsed: boolean;
    }