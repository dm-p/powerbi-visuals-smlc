/** Internal dependencies */
    import { VisualConstants } from '../constants';
    let defaults = VisualConstants.defaults;

/**
 *
 */
    export default class LayoutSettings {
        /** Layout mode */
            public mode: string = defaults.layout.mode;
        /** Height of small multiple */
            public multipleHeight: number = defaults.layout.multipleHeight;
        /** Width of small multiple */
            public multipleWidth: number = defaults.layout.multipleWidth;
        /** Number of columns (formerly Multiples per row) */
            public numberOfColumns: number = defaults.layout.numberOfColumns;
        /** Column Spacing (formerly under Small Multiple menu) */
            public spacingBetweenColumns: number = defaults.layout.columnSpacing;
        /** Row spacing */
            public spacingBetweenRows: number = defaults.layout.rowSpacing;
    }