// Internal dependencies
    import { visualConstants } from '../visualConstants';
    import AxisSettings from './AxisSettings';
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
    }