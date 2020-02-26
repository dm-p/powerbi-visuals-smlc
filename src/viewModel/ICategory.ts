/** Power BI API references */
import powerbi from "powerbi-visuals-api";
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

/**
 * Used to hold details of categorical columns and their associated metadata.
 */
export default interface ICategory {
  metadata: DataViewMetadataColumn;
  extents: [any, any];
  values: any[];
}
