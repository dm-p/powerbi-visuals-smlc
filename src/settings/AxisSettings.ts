/** Internal dependencies */
import { VisualConstants } from "../constants";
let defaults = VisualConstants.defaults;

/**
 * Handles generic axis properties within the visual.
 */
export default class AxisSettings {
  /** Show whole axis */
  public show: boolean = defaults.axis.show;
  /** Labels */
  public showLabels: boolean = defaults.axis.showLabels;
  /** Label placement */
  public labelPlacement: string = null;
  /** Font colour */
  public fontColor: string = defaults.font.colour;
  /** Text size */
  public fontSize: number = defaults.font.size;
  /** Font family */
  public fontFamily: string = defaults.font.family;
  /** Display units */
  public labelDisplayUnits: number = defaults.axis.labelDisplayUnits;
  /** Precision */
  public precision: number = defaults.axis.precision;
  /** Show title */
  public showTitle: boolean = defaults.axis.showTitle;
  /** Title style */
  public titleStyle: string = "title";
  /** Title colour */
  public titleColor: string = defaults.font.colour;
  /** Title text */
  public titleText: string = defaults.axis.titleText;
  /** Title text size */
  public titleFontSize: number = defaults.font.size;
  /** Title font family */
  public titleFontFamily: string = defaults.font.family;
  /** gridlines toggle */
  public gridlines: boolean = defaults.axis.gridlines;
  /** Gridline colour */
  public gridlineColor: string = defaults.axis.gridlineColour;
  /** Gridline stroke width */
  public gridlineStrokeWidth: number = defaults.axis.gridlineStrokeWidth;
  /** Gridline stroke style */
  public gridlineStrokeLineStyle: string = defaults.axis.gridlineStrokeStyle;
}
