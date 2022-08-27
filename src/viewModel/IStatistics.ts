// Internal dependencies
import ISmallMultipleMeasureValue from './ISmallMultipleMeasureValue';

/**
 * Used to hold the `ISmallMultipleMeasureValue` for statistics of interest for an `IMeasure`.
 */
export default interface IStatistics {
    min: ISmallMultipleMeasureValue;
    max: ISmallMultipleMeasureValue;
    first?: ISmallMultipleMeasureValue;
    last?: ISmallMultipleMeasureValue;
}
