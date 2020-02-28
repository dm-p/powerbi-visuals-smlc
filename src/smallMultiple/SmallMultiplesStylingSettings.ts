// Power BI API Dependencies
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
    import SettingsBase from '../settings/SettingsBase';
    import Debugger from '../debug/Debugger';
    import { visualConstants } from '../visualConstants';
    let defaults = visualConstants.defaults;

/**
 * Handles all aspects of small multiples styling configuration, as prescribed by the visual capabilities.
 */
    export default class SmallMultiplesStylingSettings extends SettingsBase {
        // Background colour
            public backgroundColor: string = defaults.smallMultiple.backgroundColour;
        // Background transparency
            public backgroundTransparency: number = defaults.smallMultiple.backgroundTransparency;
        // Zebra-stripe toggle
            public zebraStripe: boolean = defaults.smallMultiple.zebraStripe;
        // Zebra-stripe background application-type
            public zebraStripeApply: string = defaults.smallMultiple.zebraStripeApply;
        // Alternate background colour
            public backgroundColorAlternate: string = defaults.smallMultiple.backgroundColourAlternate;
        // Border toggle
            public border: boolean = defaults.smallMultiple.border;
        // Border colour
            public borderColor: string = defaults.smallMultiple.borderColour;
        // With of the border, if supplied
            public borderStrokeWidth: number = defaults.smallMultiple.borderStrokeWidth;
        // Border line style
            public borderStyle: string = defaults.smallMultiple.borderStyle;
        // [DEPRECATED: now in HeadingSettings] Show label
            public showMultipleLabel: boolean = defaults.heading.show;
        // [DEPRECATED: now in HeadingSettings] Font colour
            public fontColor: string = defaults.font.colour;
        // [DEPRECATED: now in HeadingSettings] Position
            public labelPosition: string = defaults.heading.verticalPosition;
        // [DEPRECATED: now in HeadingSettings] Alignment
            public labelAlignment: string = defaults.heading.horizontalAlignment;
        // [DEPRECATED: now in HeadingSettings] Text size
            public fontSize: number = defaults.font.size;
        // [DEPRECATED: now in HeadingSettings] Font Family
            public fontFamily: string = defaults.font.family;
        // [DEPRECATED: now in LayoutSettings] Column Spacing
            public spacingBetweenColumns: number = defaults.layout.columnSpacing;
        // [DEPRECATED: now in LayoutSettings] Multiples per row
            public maximumMultiplesPerRow: number = defaults.layout.numberOfColumns;
        // [DEPRECATED: now in LayoutSettings] Row spacing
            public spacingBetweenRows: number = defaults.layout.rowSpacing;
        // [DEPRECATED: now in LayoutSettings] Alternate font colour
            public fontColorAlternate: string = defaults.font.colour;

            constructor() {
                super();
                // Valid values for object enumeration
                    this.validValues = {
                        borderStrokeWidth: {
                            numberRange: {
                                min: visualConstants.ranges.borderStrokeWidth.min,
                                max: visualConstants.ranges.borderStrokeWidth.max
                            }
                        }
                    };
            }

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
                enumerationObject.instances.map((i) => {
                    // Range validation
                        Debugger.LOG('Range validation...');
                        i.validValues = this.validValues;
                    // Conceal previously shown properties that have since been moved
                        Debugger.LOG('Hiding legacy properties...');
                        delete i.properties['showMultipleLabel'];
                        delete i.properties['spacingBetweenColumns'];
                        delete i.properties['maximumMultiplesPerRow'];
                        delete i.properties['spacingBetweenRows'];
                        delete i.properties['labelPosition'];
                        delete i.properties['labelAlignment'];
                        delete i.properties['fontSize'];
                        delete i.properties['fontFamily'];
                        delete i.properties['fontColor'];
                        delete i.properties['fontColorAlternate'];
                    // Banded multiples toggle
                        if (!this.zebraStripe) {
                            delete i.properties['zebraStripeApply'];
                            delete i.properties['backgroundColorAlternate'];
                        }
                    // Border toggle
                        if (!this.border) {
                            delete i.properties['borderColor'];
                            delete i.properties['borderStrokeWidth'];
                            delete i.properties['borderStyle'];
                        }
                });
                return enumerationObject;
            }
    }