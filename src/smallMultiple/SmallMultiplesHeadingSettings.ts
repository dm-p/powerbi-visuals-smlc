// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
import SettingsBase from '../settings/SettingsBase';
import Debugger from '../debug/Debugger';
import { visualConstants } from '../visualConstants';
let defaults = visualConstants.defaults;

/**
 * Handles all aspects of small multiples heading configuration, as prescribed by the visual capabilities.
 */
export default class SmallMultiplesHeadingSettings extends SettingsBase {
    // Show header (formerly under Small Multiple menu)
    public show: boolean = defaults.heading.show;
    // Font colour (formerly under Small Multiple menu)
    public fontColour: string = defaults.font.colour;
    // Alternate font colour (formerly under Small Multiple menu)
    public fontColourAlternate: string = defaults.font.colour;
    // Position (formerly under Small Multiple menu)
    public labelPosition: string = defaults.heading.verticalPosition;
    // Alignment (formerly under Small Multiple menu)
    public labelAlignment: string = defaults.heading.horizontalAlignment;
    // Text size (formerly under Small Multiple menu)
    public fontSize: number = defaults.font.size;
    // Font Family (formerly under Small Multiple menu)
    public fontFamily: string = defaults.font.family;

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
            // Alternate background: allows alternate heading colour
            Debugger.LOG('Alternate font colour...');
            if (options && !options.zebraStripe) {
                Debugger.LOG('No need for alternate background colour. Removing...');
                delete i.properties['fontColourAlternate'];
            }
        });
        return enumerationObject;
    }
}
