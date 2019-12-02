/** Internal dependencies */
    import { VisualConstants } from '../constants';
    let defaults = VisualConstants.defaults;

/**
 *
 */
    export default class FeatureSettings {
        /** Object schema version (for handling migration) */
            public objectVersion: number = 2.0;
        /** Enable context menu */
            public contextMenu: boolean = defaults.features.contextMenu;
    }