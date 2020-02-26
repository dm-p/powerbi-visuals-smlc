/** Power BI API Dependencies */
import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;

/** Internal dependencies */
import { ISmallMultiplesLayout } from "../smallMultiple/interfaces";

/**
 * Holds information about the visual layout for rendering.
 */
export default interface ILayoutConfiguration {
  smallMultiples: ISmallMultiplesLayout;
  visualViewport: IViewport;
  chartViewport: IViewport;
  minimumViewport: IViewport;
  x: number;
  y: number;
}
