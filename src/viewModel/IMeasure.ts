/** Power BI API references */
import powerbi from "powerbi-visuals-api";
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = valueFormatter.IValueFormatter;

/**
 * Used to hold details and properties of a measure used with the visual.
 */
export default interface IMeasure {
  metadata: DataViewMetadataColumn;
  formatter: IValueFormatter;
  stroke: string;
  selectionId: ISelectionId;
  strokeWidth: number;
  lineShape: string;
  lineStyle: string;
  showArea: boolean;
  backgroundTransparency: number;
}
