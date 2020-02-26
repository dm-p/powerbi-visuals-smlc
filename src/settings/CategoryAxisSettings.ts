/** Internal dependencies */
import { VisualConstants } from "../constants";
import AxisSettings from "./AxisSettings";
let defaults = VisualConstants.defaults;

/**
 * Handles properties for the category (X) axis.
 */
export default class CategoryAxisSettings extends AxisSettings {
  /** Label placement */
  public labelPlacement: string = defaults.categoryAxis.labelPlacement;
  /** Axis lines */
  public showAxisLine: boolean = defaults.categoryAxis.showAxisLine;
  /** Axis line colour */
  public axisLineColor: string = defaults.axis.gridlineColour;
  /** Axis line stroke width */
  public axisLineStrokeWidth: number =
    defaults.categoryAxis.axisLineStrokeWidth;
  /** Overload show */
  public show: boolean = defaults.categoryAxis.show;
  /** Overload gridlines */
  public gridlines: boolean = defaults.categoryAxis.gridlines;
  /** Overload title show */
  public showTitle: boolean = defaults.categoryAxis.showTitle;
  /** Overload title style */
  public titleStyle: string = defaults.categoryAxis.titleStyle;
}
