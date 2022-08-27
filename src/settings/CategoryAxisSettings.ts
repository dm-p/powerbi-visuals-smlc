// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Internal dependencies
import { visualConstants } from '../visualConstants';
import AxisSettings from './AxisSettings';
import Debugger from '../debug/Debugger';
let defaults = visualConstants.defaults;

/**
 * Used to manage properties specific to the category (X) axis.
 */
export default class CategoryAxisSettings extends AxisSettings {
    // Label placement
    public labelPlacement: string = defaults.categoryAxis.labelPlacement;
    // Axis lines
    public showAxisLine: boolean = defaults.categoryAxis.showAxisLine;
    // Axis line colour
    public axisLineColor: string = defaults.axis.gridlineColour;
    // Axis line stroke width
    public axisLineStrokeWidth: number = defaults.categoryAxis.axisLineStrokeWidth;
    // Overload show
    public show: boolean = defaults.categoryAxis.show;
    // Overload gridlines
    public gridlines: boolean = defaults.categoryAxis.gridlines;
    // Overload title show
    public showTitle: boolean = defaults.categoryAxis.showTitle;
    // Overload title style
    public titleStyle: string = defaults.categoryAxis.titleStyle;

    constructor() {
        super();
        // Valid values for object enumeration
        this.validValues = {
            axisLineStrokeWidth: {
                numberRange: {
                    min: visualConstants.ranges.axisLineStrokeWidth.min,
                    max: visualConstants.ranges.axisLineStrokeWidth.max
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
        enumerationObject.instances.map(i => {
            // Range validation
            Debugger.LOG('Range validation...');
            i.validValues = this.validValues;
            // Label toggle
            i = this.handleLabelToggle(i);
            // Gridline toggle
            i = this.handleGridlineToggle(i);
            // Title toggle
            i = this.handleTitleToggle(i);
            // Axis label placement
            i = this.handleAxisLabelPlacement(i, options);
            // Axis line toggle
            Debugger.LOG('Managing axis line...');
            if (!this.showAxisLine) {
                delete i.properties['axisLineColor'];
                delete i.properties['axisLineStrokeWidth'];
            }
        });
        return enumerationObject;
    }
}
