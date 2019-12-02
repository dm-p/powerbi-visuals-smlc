/** Internal dependencies */
    import { VisualConstants } from '../constants';
    let defaults = VisualConstants.defaults;

/**
*
*/
    export default class HeadingSettings {
        /** Show header (formerly under Small Multple menu) */
            public show: boolean = defaults.heading.show;
        /** Font colour (formerly under Small Multple menu) */
            public fontColour: string = defaults.font.colour;
        /**Alternate font colour (formerly under Small Multple menu) */
            public fontColourAlternate: string = defaults.font.colour;
        /** Position (formerly under Small Multple menu) */
            public labelPosition: string = defaults.heading.verticalPosition;
        /** Alignment (formerly under Small Multple menu) */
            public labelAlignment: string = defaults.heading.horizontalAlignment;
        /** Text size (formerly under Small Multple menu) */
            public fontSize: number = defaults.font.size;
        /** Font Family (formerly under Small Multple menu) */
            public fontFamily: string = defaults.font.family;
    }