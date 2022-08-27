// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import VisualObjectInstance = powerbi.VisualObjectInstance;

// Internal dependencies
import SettingsBase from '../settings/SettingsBase';
import Debugger from '../debug/Debugger';
import { visualConstants } from '../visualConstants';
let defaults = visualConstants.defaults;

/**
 * Manages properties generic to all axis types in the visual.
 */
export default class AxisSettings extends SettingsBase {
    // Show whole axis
    public show: boolean = defaults.axis.show;
    // Labels
    public showLabels: boolean = defaults.axis.showLabels;
    // Label placement
    public labelPlacement: string = null;
    // Font colour
    public fontColor: string = defaults.font.colour;
    // Text size
    public fontSize: number = defaults.font.size;
    // Font family
    public fontFamily: string = defaults.font.family;
    // Display units
    public labelDisplayUnits: number = defaults.axis.labelDisplayUnits;
    // Precision
    public precision: number = defaults.axis.precision;
    // Show title
    public showTitle: boolean = defaults.axis.showTitle;
    // Title style
    public titleStyle: string = 'title';
    // Title colour
    public titleColor: string = defaults.font.colour;
    // Title text
    public titleText: string = defaults.axis.titleText;
    // Title text size
    public titleFontSize: number = defaults.font.size;
    // Title font family
    public titleFontFamily: string = defaults.font.family;
    // Gridlines toggle
    public gridlines: boolean = defaults.axis.gridlines;
    // Gridline colour
    public gridlineColor: string = defaults.axis.gridlineColour;
    // Gridline stroke width
    public gridlineStrokeWidth: number = defaults.axis.gridlineStrokeWidth;
    // Line styling to apply to gridlines
    public gridlineStrokeLineStyle: string = defaults.axis.gridlineStrokeStyle;

    protected handleGridlineToggle(instance: VisualObjectInstance) {
        Debugger.LOG('Managing gridline toggle...');
        if (!this.gridlines) {
            delete instance.properties['gridlineColor'];
            delete instance.properties['gridlineStrokeWidth'];
            delete instance.properties['gridlineStrokeLineStyle'];
        }
        return instance;
    }

    protected handleLabelToggle(instance: VisualObjectInstance) {
        Debugger.LOG('Managing label toggle...');
        if (!this.showLabels) {
            delete instance.properties['labelPlacement'];
            delete instance.properties['fontColor'];
            delete instance.properties['fontSize'];
            delete instance.properties['fontFamily'];
            delete instance.properties['labelDisplayUnits'];
            delete instance.properties['precision'];
        }
        return instance;
    }

    protected handleTitleToggle(instance: VisualObjectInstance) {
        Debugger.LOG('Managing title toggle...');
        if (!this.showTitle) {
            delete instance.properties['titleStyle'];
            delete instance.properties['titleColor'];
            delete instance.properties['titleText'];
            delete instance.properties['titleFontSize'];
            delete instance.properties['titleFontFamily'];
        }
        return instance;
    }

    protected handleAxisLabelPlacement(instance: VisualObjectInstance, options: { [propertyName: string]: any } = {}) {
        Debugger.LOG('Managing axis placement...');
        if (options && !options.axisLabelPlacement) {
            delete instance.properties['labelPlacement'];
        }
        return instance;
    }
}
