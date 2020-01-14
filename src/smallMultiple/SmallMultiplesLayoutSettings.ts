/** Internal dependencies */
    import { VisualConstants } from '../constants';
    let defaults = VisualConstants.defaults;

/**
 * Handles all aspects of small multiples layout configuration, as prescribed by the visual capabilities.
 */
    export default class SmallMultiplesLayoutSettings {
        /** Column layout mode */
            public horizontalGrid: string = defaults.layout.horizontalGrid;
        /** Number of columns (formerly Multiples per row) */
            public numberOfColumns: number = defaults.layout.numberOfColumns;
        /** Width of small multiple */
            public multipleWidth: number = defaults.layout.multipleWidth;
        /** Column Spacing (formerly under Small Multiple menu) */
            public spacingBetweenColumns: number = defaults.layout.columnSpacing;
        /** Row layout mode */
            public verticalGrid: string = defaults.layout.verticalGrid;
        /** Height of small multiple */
            public multipleHeight: number = defaults.layout.multipleHeight;
        /** Row spacing */
            public spacingBetweenRows: number = defaults.layout.rowSpacing;
    }