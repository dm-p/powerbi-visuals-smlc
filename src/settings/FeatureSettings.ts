// Internal dependencies
    import { visualConstants } from '../visualConstants';
    let defaults = visualConstants.defaults;

/**
 * Used to enable/disable features for debugging purposes, or ones that might not yet be ready.
 */
    export default class FeatureSettings {
        // Object schema version (for handling migration)
            public objectVersion: number = 2.0;
        // Enable axis placement (not yet coded)
            public axisLabelPlacement: boolean = defaults.features.axisLabelPlacement;
        // Enable context menu
            public contextMenu: boolean = defaults.features.contextMenu;
    }