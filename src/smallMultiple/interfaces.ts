// Power BI API dependencies
    import { interfaces } from 'powerbi-visuals-utils-formattingutils';
    import TextProperties = interfaces.TextProperties;

/**
 * Describes the properties of a small multiple heading.
 */
    export interface ISmallMultiplesHeading {
        // Font family and size properties.
            textProperties: TextProperties;
        // Computed height of text, based on `textProperties`.
            textHeight: number;
        // SVG `dominant-baseline` attribute to apply to text.
            dominantBaseline: string;
        // SVG `text-anchor` attribute to apply to text.
            textAnchor: string;
        // Derived x-position of heading, based on alignment properties and small multiple width.
            x: number;
        // Derived y-position of heading, based on position properties and small multiple height.
            y: number;
    }

/**
 * Manages and handles small multiple layout.
 */
    export interface ISmallMultiplesLayout {
        // Total number of small multiples in our visual.
            count: number;
        // Row/column configuration for the small multiple grid.
            grid: ISmallMultiplesGrid;
        // Specific properties for each small multiple.
            multiple: ISmallMultiplesCoreProperties;
    }

/**
 * Manages the grid of small multiples.
 */
    export interface ISmallMultiplesGrid {
        // Amount of rows that the grid will span.
            rows: ISmallMultiplesGridDimensionDescriptor;
        // Amount of columns that the grid will span.
            columns: ISmallMultiplesGridDimensionDescriptor;
    }

/**
 * Specifies the dimensions for each small multiple.
 */
    export interface ISmallMultiplesCoreProperties {
        // Heading text properties.
            heading: ISmallMultiplesHeading;
        // Outer small multiple dimensions (for grid).
            outer: IDimension;
        // Margin for chart canvas from outer edges.
            margin: IMargin;
        // Inner small multiple dimensions (for chart canvas).
            inner: IDimension;
        // Amount to offset placement along the X-axis, accomodating for width and column spacing.
            xOffset: number;
        // Amount to offset chart positioning by, to ensure borders are not cut-off when rendering.
            borderOffset: number;
    }

/**
 * Basic width and height properties for an element.
 */
    interface IDimension {
        // Height of an individual element.
            height: number;
        // Width of an individual element.
            width: number;
    }

/**
 * Describes attributes of a column or row in the grid of small multiples.
 */
    interface ISmallMultiplesGridDimensionDescriptor extends IDimension {
        // Cardinality of the dimension.
            count: number;
    }

/**
 * Used to configure margin or padding for an element.
 */
    interface IMargin {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }