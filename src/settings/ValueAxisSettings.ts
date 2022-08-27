// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
import IValueFormatter = valueFormatter.IValueFormatter;

// Internal dependencies
import { visualConstants } from '../visualConstants';
import AxisSettings from './AxisSettings';
import Debugger from '../debug/Debugger';
let defaults = visualConstants.defaults;

/**
 * Used to manage properties specific to the value (Y) axis.
 */
export default class ValueAxisSettings extends AxisSettings {
    // Label placement
    public labelPlacement: string = defaults.valueAxis.labelPlacement;
    // Axis range start
    public start: number = defaults.valueAxis.range.start;
    // Axis range end
    public end: number = defaults.valueAxis.range.end;

    constructor() {
        super();
        // Valid values for object enumeration
        this.validValues = {
            precision: {
                numberRange: {
                    min: visualConstants.ranges.precision.min,
                    max: visualConstants.ranges.precision.max
                }
            },
            gridlineStrokeWidth: {
                numberRange: {
                    min: visualConstants.ranges.gridlineStrokeWidth.min,
                    max: visualConstants.ranges.gridlineStrokeWidth.max
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
            [propertyName: string]: any;
        } = {}
    ): VisualObjectInstanceEnumerationObject {
        Debugger.LOG('Processing enumeration...');
        enumerationObject.instances.map((i) => {
            // Range validation
            Debugger.LOG('Range validation...');
            i.validValues = this.validValues;
            // Conditional formatting for start/end
            i.propertyInstanceKind = {
                start: VisualEnumerationInstanceKinds.ConstantOrRule,
                end: VisualEnumerationInstanceKinds.ConstantOrRule
            };
            // Label toggle
            i = this.handleLabelToggle(i);
            // Gridline toggle
            i = this.handleGridlineToggle(i);
            // Title toggle
            i = this.handleTitleToggle(i);
            // Axis label placement
            i = this.handleAxisLabelPlacement(i, options);
            // Title style toggle if units are none
            Debugger.LOG('Managing title style enum...');
            if (
                this.labelDisplayUnits === 1 ||
                (options &&
                    !(<IValueFormatter>options.numberFormat).displayUnit)
            ) {
                i.properties['titleStyle'] = 'title';
                i.validValues.titleStyle = ['title'];
            }
        });
        return enumerationObject;
    }
}
