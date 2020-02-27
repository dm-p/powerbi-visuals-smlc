// Internal dependencies
    import ISmallMultipleMeasureValue from './ISmallMultipleMeasureValue';
    import IStatistics from './IStatistics';

/**
 * Used to manage the display of a measure within our visual.
 */
    export default interface ISmallMultipleMeasure {
        values: ISmallMultipleMeasureValue[];
        statistics: IStatistics;
    }