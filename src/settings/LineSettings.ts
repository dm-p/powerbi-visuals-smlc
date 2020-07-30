// Power BI API Dependencies
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
    import SettingsBase from './SettingsBase';
    import Debugger from '../debug/Debugger';
    import IMeasure from '../viewModel/IMeasure';
    import { visualConstants } from '../visualConstants';
    let defaults = visualConstants.defaults;

/**
 * Manages properties relating to a measure line in the visual.
 */
    export default class LineSettings extends SettingsBase {
        // Specify measure-specific configuration
            public stroke: string = null;
        // Thickness of measure lines
            public strokeWidth: number = defaults.lines.strokeWidth;
        // Show as area chart rather than just as a line
            public showArea: boolean = defaults.lines.showArea;
        // Transparency for area, if showing
            public transparency: number = defaults.lines.backgroundTransparency;
        // Curve type to use when drawing
            public lineShape: string = defaults.lines.lineShape;
        // Measure line style
            public lineStyle: string = defaults.lines.lineStyle;
        // Used for object enumeration
            private objectName: string = 'lines';

            constructor() {
                super();
                // Valid values for object enumeration
                    this.validValues = {
                        strokeWidth: {
                            numberRange: {
                                min: visualConstants.ranges.shapeStrokeWidth.min,
                                max: visualConstants.ranges.shapeStrokeWidth.max
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
                options: {[propertyName: string]: any} = {}
            ): VisualObjectInstanceEnumerationObject {
                Debugger.LOG('Processing enumeration...');
                if (
                    options &&
                    (<IMeasure[]>options.measures)
                ) {
                    Debugger.LOG('Processing individual measures...');
                    // Remove default instance, and replace with measure-based properties
                        enumerationObject.instances = [];
                        for (let measure of (<IMeasure[]>options.measures).filter((m) => m.role === 'dataPoint')) {
                            let displayName = measure.metadata.displayName,
                                containerIdx = enumerationObject.containers.push({displayName: displayName}) - 1;
                            /** containerIdx doesn't work properly in the SDK yet, and there's no ETA on when it will. Until then,
                             *  we'll use a hack by pushing an integer field without validation to create a 'heading' */
                                if (containerIdx > 0) {
                                    enumerationObject.instances.push({
                                        objectName: this.objectName,
                                        displayName: '－－－－－－－－－－',
                                        properties: {
                                            measureName: null
                                        },
                                        selector: {
                                            metadata: measure.metadata.queryName
                                        }
                                    });
                                }
                                enumerationObject.instances.push({
                                    objectName: this.objectName,
                                    displayName: measure.metadata.displayName,
                                    properties: {
                                        measureName: null
                                    },
                                    selector: {
                                        metadata: measure.metadata.queryName
                                    }
                                });
                            // The main body of our measure configuration
                                let inst: VisualObjectInstance = {
                                    objectName: this.objectName,
                                    properties: {
                                        stroke: {
                                            solid: {
                                                color: measure.stroke
                                            }
                                        },
                                        strokeWidth: measure.strokeWidth,
                                        showArea: measure.showArea,
                                        backgroundTransparency: measure.backgroundTransparency,
                                        lineShape: measure.lineShape,
                                        lineStyle: measure.lineStyle
                                    },
                                    selector: {
                                        metadata: measure.metadata.queryName
                                    },
                                    // containerIdx: containerIdx,
                                    validValues: this.validValues
                                };
                                if (!measure.showArea) {
                                    delete inst.properties.backgroundTransparency;
                                }
                                enumerationObject.instances.push(inst);
                        }
                }
                return enumerationObject;
            }
    }