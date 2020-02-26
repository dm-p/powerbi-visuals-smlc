/** Internal dependencies */
import ISmallMultipleMeasureValue from "./ISmallMutlipleMeasureValue";
import IStatistics from "./IStatistics";

/**
 * Groups a measure within an `ISmallMultiple`.
 */
export default interface ISmallMultipleMeasure {
  values: ISmallMultipleMeasureValue[];
  statistics: IStatistics;
}
