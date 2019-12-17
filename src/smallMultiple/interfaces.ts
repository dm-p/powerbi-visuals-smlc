/** Internal dependencies */
    import { LayoutMode } from "./enums";

/**
 * Options used to specify how small multiples should be resolved within the visual.
 */
    export interface ISmallMultipleLayoutOptions {
        /** Layout calculation. */
            mode: LayoutMode;
        /** Entire width of chart container. */
            chartWidth?: number;
        /** Specified width of small multiples, to be taken into consideration when calculating the grid. */
            smallMultipleWidth?: number;
        /** Specifies the maximum number of columns per row. */
            columnCap?: number;
        /** Specifies the horizontal distance between small multiples, in pixels. */
            columnSpacing?: number;
    }

/**
 * Manages and handles small multiple layout.
 */
    export interface ISmallMultipleLayout {
        /** Total number of small multiples in our visual. */
            count: number;
        /** Row/column configuration for the small multiple grid. */
            grid: ISmallMultipleGrid;
    }

/**
 * Manages the grid of small multiples.
 */
    export interface ISmallMultipleGrid {
        /** Amount of rows that the grid will span. */
            rows: number;
        /** Amount of columns that the grid will span. */
            columns: number;
    }