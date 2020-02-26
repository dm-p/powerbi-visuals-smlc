/** Internal dependencies */
import { VisualConstants } from "../constants";
let defaults = VisualConstants.defaults;

/**
 * Handles enable/disable of features within the visual.
 */
export default class FeatureSettings {
  /** Object schema version (for handling migration) */
  public objectVersion: number = 2.0;
  /** Enable axis placement (not yet coded) */
  public axisLabelPlacement: boolean = defaults.features.axisLabelPlacement;
  /** Enable context menu */
  public contextMenu: boolean = defaults.features.contextMenu;
}
