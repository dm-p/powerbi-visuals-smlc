/** Power BI API references */
import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionId = powerbi.visuals.ISelectionId;

/**
 * Represents an individual value within an `ISmallMultipleMeasure`.
 */
export default interface ISmallMultipleMeasureValue {
  index: number;
  category: string | number | Date;
  value: number;
  tooltip?: VisualTooltipDataItem;
  selectionId?: ISelectionId;
}
