// Power BI API dependencies
import { interfaces } from 'powerbi-visuals-utils-formattingutils';
import TextProperties = interfaces.TextProperties;

/**
 * Handles the display of a textual value within the visual.
 */
export default interface IText {
    properties: TextProperties;
    tailoredValue: string;
    textHeight: number;
    textWidth: number;
    x?: number;
    y?: number;
}
