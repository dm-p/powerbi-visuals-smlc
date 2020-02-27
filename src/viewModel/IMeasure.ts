// Power BI API references
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
    import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
    import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
    import  IValueFormatter = valueFormatter.IValueFormatter;

/**
 * Manages the display and properties of a measure line within the visual.
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