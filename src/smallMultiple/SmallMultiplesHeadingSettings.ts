// Internal dependencies
    import { visualConstants } from '../visualConstants';
    let defaults = visualConstants.defaults;

/**
 * Handles all aspects of small multiples heading configuration, as prescribed by the visual capabilities.
 */
    export default class SmallMultiplesHeadingSettings {
        // Show header (formerly under Small Multiple menu)
            public show: boolean = defaults.heading.show;
        // Font colour (formerly under Small Multiple menu)
            public fontColour: string = defaults.font.colour;
        // Alternate font colour (formerly under Small Multiple menu)
            public fontColourAlternate: string = defaults.font.colour;
        // Position (formerly under Small Multiple menu)
            public labelPosition: string = defaults.heading.verticalPosition;
        // Alignment (formerly under Small Multiple menu)
            public labelAlignment: string = defaults.heading.horizontalAlignment;
        // Text size (formerly under Small Multiple menu)
            public fontSize: number = defaults.font.size;
        // Font Family (formerly under Small Multiple menu)
            public fontFamily: string = defaults.font.family;
    }