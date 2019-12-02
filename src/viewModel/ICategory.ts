/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

/**
*
*/
    export default interface ICategory {
        metadata: DataViewMetadataColumn;
        extents: [any, any];
        values: any[];
    }