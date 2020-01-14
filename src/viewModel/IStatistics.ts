/** Internal dependencies */
    import ISmallMultipleMeasureValue from "./ISmallMutlipleMeasureValue";

/**
 *
 */
    export default interface IStatistics {
        min: ISmallMultipleMeasureValue;
        max: ISmallMultipleMeasureValue;
        first?: ISmallMultipleMeasureValue;
        last?: ISmallMultipleMeasureValue;
    }