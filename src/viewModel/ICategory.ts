// Power BI API references
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

/**
 * Manages handling of a category column from the data view, in our view model.
 */
    export default interface ICategory {
        metadata: DataViewMetadataColumn;
        extents: [any, any];
        values: any[];
    }