// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
import SettingsBase from './SettingsBase';
import Debugger from '../debug/Debugger';
import { visualConstants } from '../visualConstants';
let defaults = visualConstants.defaults;

/**
 * Used to enable/disable features for debugging purposes, or ones that might not yet be ready.
 */
export default class FeatureSettings extends SettingsBase {
    // Object schema version (for handling migration)
    public objectVersion: number = 2.0;
    // Enable axis placement (not yet coded)
    public axisLabelPlacement: boolean = defaults.features.axisLabelPlacement;
    // Enable context menu
    public contextMenu: boolean = defaults.features.contextMenu;
    // Enable filter other visuals
    public filterOtherVisuals: boolean = defaults.features.filterOtherVisuals;

    /**
     * Business logic for the properties within this menu.
     * @param enumerationObject - `VisualObjectInstanceEnumerationObject` to process.
     * @param options           - any specific options we wish to pass from elsewhere in the visual that our settings may depend upon.
     */
    public processEnumerationObject(
        enumerationObject: VisualObjectInstanceEnumerationObject,
        options: {
            [propertyName: string]: any;
        } = {}
    ): VisualObjectInstanceEnumerationObject {
        Debugger.LOG('Processing enumeration...');
        if (!visualConstants.debug) {
            enumerationObject.instances = [];
        }
        return enumerationObject;
    }
}
