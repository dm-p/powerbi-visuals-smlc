/** Power BI API Dependencies */
import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;
import { legendInterfaces } from "powerbi-visuals-utils-chartutils";
import ILegendData = legendInterfaces.LegendData;

/** Internal dependencies */
import ISmallMultiple from "./ISmallMultiple";
import IStatistics from "./IStatistics";
import IMeasure from "./IMeasure";
import ICategory from "./ICategory";
import ILayoutConfiguration from "./ILayoutConfiguration";
import IAxis from "./IAxis";

/**
 * Manages necessary details for rendering the visual.
 */
export default interface IViewModel {
  locale: string;
  dataViewIsValid: boolean;
  initialViewport: IViewport;
  viewport: IViewport;
  categoryMetadata: ICategory;
  measureMetadata: IMeasure[];
  multiples: ISmallMultiple[];
  statistics: IStatistics;
  layout: ILayoutConfiguration;
  legend: ILegendData;
  yAxis: IAxis;
  xAxis: IAxis;
}
