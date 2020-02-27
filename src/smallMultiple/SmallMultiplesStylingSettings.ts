// Internal dependencies
    import { visualConstants } from '../visualConstants';
    let defaults = visualConstants.defaults;

/**
 * Handles all aspects of small multiples styling configuration, as prescribed by the visual capabilities.
 */
    export default class SmallMultiplesStylingSettings {
        // Background colour
            public backgroundColor: string = defaults.smallMultiple.backgroundColour;
        // Background transparency
            public backgroundTransparency: number = defaults.smallMultiple.backgroundTransparency;
        // Zebra-stripe toggle
            public zebraStripe: boolean = defaults.smallMultiple.zebraStripe;
        // Zebra-stripe background application-type
            public zebraStripeApply: string = defaults.smallMultiple.zebraStripeApply;
        // Alternate background colour
            public backgroundColorAlternate: string = defaults.smallMultiple.backgroundColourAlternate;
        // Border toggle
            public border: boolean = defaults.smallMultiple.border;
        // Border colour
            public borderColor: string = defaults.smallMultiple.borderColour;
        // With of the border, if supplied
            public borderStrokeWidth: number = defaults.smallMultiple.borderStrokeWidth;
        // Border line style
            public borderStyle: string = defaults.smallMultiple.borderStyle;
        // [DEPRECATED: now in HeadingSettings] Show label
            public showMultipleLabel: boolean = defaults.heading.show;
        // [DEPRECATED: now in HeadingSettings] Font colour
            public fontColor: string = defaults.font.colour;
        // [DEPRECATED: now in HeadingSettings] Position
            public labelPosition: string = defaults.heading.verticalPosition;
        // [DEPRECATED: now in HeadingSettings] Alignment
            public labelAlignment: string = defaults.heading.horizontalAlignment;
        // [DEPRECATED: now in HeadingSettings] Text size
            public fontSize: number = defaults.font.size;
        // [DEPRECATED: now in HeadingSettings] Font Family
            public fontFamily: string = defaults.font.family;
        // [DEPRECATED: now in LayoutSettings] Column Spacing
            public spacingBetweenColumns: number = defaults.layout.columnSpacing;
        // [DEPRECATED: now in LayoutSettings] Multiples per row
            public maximumMultiplesPerRow: number = defaults.layout.numberOfColumns;
        // [DEPRECATED: now in LayoutSettings] Row spacing
            public spacingBetweenRows: number = defaults.layout.rowSpacing;
        // [DEPRECATED: now in LayoutSettings] Alternate font colour
            public fontColorAlternate: string = defaults.font.colour;
    }