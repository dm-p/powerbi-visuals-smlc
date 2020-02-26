/** Internal dependencies */
import { VisualConstants } from "../constants";
let defaults = VisualConstants.defaults;

/**
 * Handles properties for measure lines within the visual.
 */
export default class LineSettings {
  /** Specify measure-specific configuration */
  public stroke: string = null;
  /** Thickness of measure lines */
  public strokeWidth: number = defaults.lines.strokeWidth;
  /** Show as area chart rather than just as a line */
  public showArea: boolean = defaults.lines.showArea;
  /** Transparency for area, if showing */
  public transparency: number = defaults.lines.backgroundTransparency;
  /** Curve type to use when drawing */
  public lineShape: string = defaults.lines.lineShape;
  /** Measure line style */
  public lineStyle: string = defaults.lines.lineStyle;
}
