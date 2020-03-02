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
 * Manages properties to display the legend in the visual.
 */
    export default class LegendSettings extends SettingsBase{
        // Show legend.
            public show: boolean = true;
        // Position of the legend within the visual container.
            public position: string = defaults.legend.position;
        // Show the legend title before the series.
            public showTitle: boolean = defaults.legend.showTitle;
        // Manual title text to overload, if required.
            public titleText: string = defaults.legend.titleText;
        // Include X-ranges.
            public includeRanges: boolean = defaults.legend.includeRanges;
        // Font colour.
            public fontColor: string = defaults.font.colour;
        // Text size.
            public fontSize: number = defaults.legend.fontSize;

        /**
         * Business logic for the properties within this menu.
         * @param enumerationObject - `VisualObjectInstanceEnumerationObject` to process.
         * @param options           - any specific options we wish to pass from elsewhere in the visual that our settings may depend upon.
         */
            public processEnumerationObject(
                enumerationObject: VisualObjectInstanceEnumerationObject,
                options: {
                    [propertyName: string]: any
                } = {}
            ): VisualObjectInstanceEnumerationObject {
                Debugger.LOG('Processing enumeration...');
                // Title toggle
                    Debugger.LOG('Title toggle check...');
                    if (!this.showTitle) {
                        enumerationObject.instances.map((i) => {
                            delete i.properties['titleText'];
                            delete i.properties['includeRanges'];
                        });
                    }
                Debugger.LOG('End of enum');
                return enumerationObject;
            }

    }