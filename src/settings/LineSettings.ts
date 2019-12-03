/** Internal dependencies */
    import { VisualConstants } from '../constants';
    let defaults = VisualConstants.defaults;

/**
*
*/
    export default class LineSettings {
        /** Specify measure-specific configuration */
            public stroke: string = null;
        /** Thickness of measure lines */
            public strokeWidth: number = defaults.lines.strokeWidth;
        /** Curve type to use when drawing */
            public lineShape: string = defaults.lines.lineShape;
        /** Measure line style */
            public lineStyle: string = defaults.lines.lineStyle;
    }