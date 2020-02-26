/** Power BI API dependencies */
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import TextProperties = textMeasurementService.TextProperties;

/**
 * Represents what's needed to display a textual value within the visual.
 */
export default interface IText {
  properties: TextProperties;
  tailoredValue: string;
  textHeight: number;
  textWidth: number;
  x?: number;
  y?: number;
}
