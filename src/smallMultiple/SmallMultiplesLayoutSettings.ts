// Power BI API Dependencies
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
    import SettingsBase from '../settings/SettingsBase';
    import Debugger from '../debug/Debugger';
    import { visualConstants } from '../visualConstants';
    let defaults = visualConstants.defaults;

/**
 * Handles all aspects of small multiples layout configuration, as prescribed by the visual capabilities.
 */
    export default class SmallMultiplesLayoutSettings extends SettingsBase {
        // Column layout mode
            public horizontalGrid: string = defaults.layout.horizontalGrid;
        // Number of columns (formerly Multiples per row)
            public numberOfColumns: number = defaults.layout.numberOfColumns;
        // Width of small multiple
            public multipleWidth: number = defaults.layout.multipleWidth;
        // Column Spacing (formerly under Small Multiple menu)
            public spacingBetweenColumns: number = defaults.layout.columnSpacing;
        // Row layout mode
            public verticalGrid: string = defaults.layout.verticalGrid;
        // Height of small multiple
            public multipleHeight: number = defaults.layout.multipleHeight;
        // Row spacing
            public spacingBetweenRows: number = defaults.layout.rowSpacing;

            constructor() {
                super();
                // Valid values for object enumeration
                    this.validValues = {
                        spacingBetweenColumns: {
                            numberRange: {
                                min: visualConstants.ranges.spacing.min,
                                max: visualConstants.ranges.spacing.max
                            }
                        },
                        spacingBetweenRows: {
                            numberRange: {
                                min: visualConstants.ranges.spacing.min,
                                max: visualConstants.ranges.spacing.max
                            }
                        },
                        numberOfColumns: {
                            numberRange: {
                                min: visualConstants.ranges.numberOfColumns.min,
                                max: visualConstants.ranges.numberOfColumns.max
                            }
                        },
                        multipleHeight: {
                            numberRange: {
                                min: visualConstants.ranges.multipleSize.min,
                                max: visualConstants.ranges.multipleSize.max
                            }
                        },
                        multipleWidth: {
                            numberRange: {
                                min: visualConstants.ranges.multipleSize.min,
                                max: visualConstants.ranges.multipleSize.max
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
                // Manage flow options
                    Debugger.LOG('Horizontal grid management...');
                    switch (this.horizontalGrid) {
                        case 'column': {
                            // Row spacing
                                if (!this.numberOfColumns) {
                                    delete i.properties['spacingBetweenRows'];
                                }
                            // No setting of width
                                delete i.properties['multipleWidth'];
                            break;
                        }
                        case 'width': {
                            delete i.properties['numberOfColumns'];
                            break;
                        }
                    }
                    Debugger.LOG('Vertical grid management...');
                    switch (this.verticalGrid) {
                        case 'fit': {
                            // No setting of height
                                delete i.properties['multipleHeight'];
                            break;
                        }
                    }
            });
            return enumerationObject;
        }
    }