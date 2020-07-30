// Power BI API references
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import ISelectionId = powerbi.visuals.ISelectionId;
    import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
    import  IValueFormatter = valueFormatter.IValueFormatter;

// Internal dependencies
    import MeasureRole from './MeasureRole';

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
        role: MeasureRole;
    }