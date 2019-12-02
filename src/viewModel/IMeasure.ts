/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import ISelectionId = powerbi.visuals.ISelectionId;

/**
 *
 */
    export default interface IMeasure {
        metadata: DataViewMetadataColumn;
        colour: string;
        selectionId: ISelectionId;
        strokeWidth: number;
        lineShape: string;
        lineStyle: string;
    }