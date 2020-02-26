/** Internal dependencies */
import ISmallMultipleMeasureValue from "./ISmallMutlipleMeasureValue";

/**
 * Holds `ISmallMultipleMeasureValue` objects pertaining to an `ISmallMultipleMeasure`'s statistics.
 */
export default interface IStatistics {
  min: ISmallMultipleMeasureValue;
  max: ISmallMultipleMeasureValue;
  first?: ISmallMultipleMeasureValue;
  last?: ISmallMultipleMeasureValue;
}
