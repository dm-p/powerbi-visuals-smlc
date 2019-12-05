/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

/** Internal references */
    import VisualDebugger from '../debug/VisualDebugger';
    import { LandingPage } from './LandingPage';
    import VisualSettings from '../settings/VisualSettings';
    import { VisualConstants } from '../constants';

/**
 * Manages the handling and placement of the visual landing page if no data is present.
 */
    export default class LandingPageHandler {
        /** Specifies that the landing page is currently on */
            landingPageEnabled: boolean = false;
        /** Specifies that the landing page has been removed since being displayed. */
            landingPageRemoved: boolean = false;
        /** Debugger state */
            debugEnabled: boolean;
        /** Element to bind the landing page to */
            private element: Element;
        /** Handle localisation of visual text */
            private localisationManager: ILocalizationManager;
        /** The generated landing page */
            private landingPage: LandingPage;

        /**
         * @param element                                   - main visual element
         */
            constructor(element: Element, localisationManager: ILocalizationManager) {
                this.element = element;
                this.localisationManager = localisationManager;
            }

        /**
         * Handles the display or removal of the landing page elements
         * @param options                                   - visual update options
         */
            handleLandingPage(options: VisualUpdateOptions, host: IVisualHost, settings: VisualSettings) {

                /** Set up debugging */
                    let debug = new VisualDebugger(this.debugEnabled);
                    debug.log('Starting handleLandingPage');
                    debug.log('Determining landing page requirements...');

                /** Conditions for showing landing page */
                    if (!options.dataViews
                        || !options.dataViews.length
                        || !options.dataViews[0]
                        || !options.dataViews[0].metadata
                        || !options.dataViews[0].metadata.columns.filter(c => c.roles['category'])[0]
                        || !options.dataViews[0].metadata.columns.filter(c => c.roles['smallMultiple'])[0]
                        || !options.dataViews[0].metadata.columns.filter(c => c.roles['values'])[0]
                        || !options.dataViews[0].categorical.values
                    ) {
                        if (!this.landingPageEnabled) {
                            debug.log('Showing landing page....');
                            this.landingPageEnabled = true;
                            this.landingPage = new LandingPage(
                                host,
                                VisualConstants.about.usageUrl,
                                VisualConstants.about.version,
                                this.localisationManager
                            );
                            this.landingPage.render(this.element);
                        }
                    } else {
                            debug.log('No need to show landing page.');
                            if (this.landingPageEnabled && !this.landingPageRemoved) {
                                this.landingPageRemoved = true;
                                /** TODO: Clear element */
                            }
                    }

                /** We're done! */
                    debug.log('Finished handleLandingPage');
                    debug.footer();
            }

    }