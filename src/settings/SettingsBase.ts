// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import ValidationOptions = powerbi.ValidationOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
import Debugger from '../debug/Debugger';

/**
 * Provides a standard template to build visual settings from
 */
export default class SettingsBase {
    // Valid values for object enumeration
    protected validValues: {
        [propertyName: string]: string[] | ValidationOptions;
    };

    constructor() {
        this.validValues = {};
    }

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
        enumerationObject.instances.map(i => {
            // Range validation
            Debugger.LOG('Range validation...');
            i.validValues = this.validValues;
        });
        return enumerationObject;
    }
}
