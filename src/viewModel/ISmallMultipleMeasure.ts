/** Internal dependencies */
    import ISmallMultipleMeasureValue from "./ISmallMutlipleMeasureValue";
    import IStatistics from "./IStatistics";
    import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/textMeasurementService";
    import { IValueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";

/**
 *
 */
    export default interface ISmallMultipleMeasure {
        values: ISmallMultipleMeasureValue[];
        statistics: IStatistics;
    }