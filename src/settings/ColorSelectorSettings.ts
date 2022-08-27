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
 * Placeholder to support the legacy way of colouring measures in the visual.
 */
export default class ColorSelectorSettings extends SettingsBase {
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
        Debugger.LOG('Removing legacy object...');
        enumerationObject.instances = [];
        return enumerationObject;
    }
}
