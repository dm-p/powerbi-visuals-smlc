/** Power BI API dependencies */
    import { textMeasurementService } from 'powerbi-visuals-utils-formattingutils';
    import TextProperties = textMeasurementService.TextProperties;

/**
 *
 */
    export default interface IText {
        properties: TextProperties;
        tailoredValue: string;
        textHeight: number;
        textWidth: number;
        x?: number;
        y?: number;
    }