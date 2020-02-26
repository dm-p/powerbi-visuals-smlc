/** Internal dependencies */
import { VisualConstants } from "../constants";
let defaults = VisualConstants.defaults;

/**
 * Handles properties for legend display.
 */
export default class LegendSettings {
  /** Show legend */
  public show: boolean = true;
  /** Position */
  public position: string = defaults.legend.position;
  /** Show title */
  public showTitle: boolean = defaults.legend.showTitle;
  /** Title text */
  public titleText: string = defaults.legend.titleText;
  /** Include X-ranges */
  public includeRanges: boolean = defaults.legend.includeRanges;
  /** Font colour */
  public fontColor: string = defaults.font.colour;
  /** Text size */
  public fontSize: number = defaults.legend.fontSize;
}
