/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

/** External dependencies */
    import * as d3 from 'd3';

/** Internal dependencies */
    import Debugger from '../debug/Debugger';
    import { LandingPage } from './LandingPage';
    import { VisualConstants } from '../constants';

/**
 * Manages the handling and placement of the visual landing page if no data is present.
 */
    export default class LandingPageHandler {
        /** Specifies that the landing page is currently on */
            landingPageEnabled: boolean = false;
        /** Specifies that the landing page has been removed since being displayed. */
            landingPageRemoved: boolean = false;
        /** Element to bind the landing page to */
            private element: d3.Selection<any, any, any, any>;
        /** Handle localisation of visual text */
            private localisationManager: ILocalizationManager;
        /** The generated landing page */
            private landingPage: LandingPage;

        /**
         * @param element                                   - main visual element
         */
            constructor(element: d3.Selection<any, any, any, any>, localisationManager: ILocalizationManager) {
                this.element = element;
                this.localisationManager = localisationManager;
                Debugger.log('LandingPageHandler instantiated :)');
            }

        /**
         * Handles the display or removal of the landing page elements
         * @param options                                   - visual update options
         */
            handleLandingPage(options: VisualUpdateOptions, host: IVisualHost) {

                /** Set up debugging */
                    Debugger.log('Starting handleLandingPage');
                    Debugger.log('Determining landing page requirements...');

                /** Conditions for showing landing page */
                    if (!options.dataViews
                        || !options.dataViews.length
                        || !options.dataViews[0]
                        || !options.dataViews[0].metadata
                        || !options.dataViews[0].metadata.columns
                        || !options.dataViews[0].metadata.columns.filter(c => c.roles['category'])[0]
                        || !options.dataViews[0].metadata.columns.filter(c => c.roles['smallMultiple'])[0]
                        || !options.dataViews[0].metadata.columns.filter(c => c.roles['values'])[0]
                        || !options.dataViews[0].categorical.values
                    ) {
                        if (!this.landingPageEnabled) {
                            Debugger.log('Showing landing page....');
                            this.landingPageEnabled = true;
                            if (!this.landingPage) {
                                this.landingPage = new LandingPage(
                                    host,
                                    VisualConstants.about.usageUrl,
                                    VisualConstants.about.version,
                                    this.localisationManager
                                );
                            }
                            this.landingPage.render(this.element);
                        }
                    } else {
                        Debugger.log('No need to show landing page.');
                        this.element.selectAll('*').remove();
                        if (this.landingPageEnabled && !this.landingPageRemoved) {
                            this.landingPageRemoved = true;
                        }
                        this.landingPageEnabled = false;
                    }

                /** We're done! */
                    Debugger.log('Finished handleLandingPage');
                    Debugger.footer();
            }

    }