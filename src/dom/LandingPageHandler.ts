/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

/** External dependencies */
    import * as d3 from 'd3';

/** Internal dependencies */
    import Debugger from '../debug/Debugger';
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
                            this.render(host);
                        }
                    } else {
                        Debugger.log('No need to show landing page.');
                        this.clear();
                    }

                /** We're done! */
                    Debugger.log('Finished handleLandingPage');
                    Debugger.footer();
            }

            clear() {
                Debugger.log('Clearing landing page...');
                this.element.selectAll('*').remove();
                if (this.landingPageEnabled && !this.landingPageRemoved) {
                    this.landingPageRemoved = true;
                }
                this.landingPageEnabled = false;
            }

            render(host: IVisualHost) {

                Debugger.footer();
                Debugger.log('Rendering landing page...');
                Debugger.log(this.element);

                /** Top-level elements */
                    Debugger.log('Adding container...');
                    let container = this.element
                            .append('div')
                                .classed('small-multiple-landing-page', true)
                                .classed('w3-card-4', true);

                    Debugger.log('Adding heading...');
                    let heading = container
                            .append('div')
                                .classed('w3-container', true)
                                .classed('w3-theme', true);

                    Debugger.log('Adding version...');
                    let version = container
                            .append('div')
                                .classed('w3-container', true)
                                .classed('w3-theme-l3', true)
                                .classed('w3-small', true);

                    Debugger.log('Adding help box...');
                    let helpBox = container
                            .append('div')
                                .classed('w3-container', true)
                                .classed('w3-theme-l5', true)
                                .classed('small-multiple-watermark', true)
                                .classed('small-multiple-help', true);

                /** Add title */
                    Debugger.log('Adding title...');
                    heading
                        .append('h5')
                            .text(this.localisationManager.getDisplayName('Visual_Name'));

                /** Add version number */
                    Debugger.log('Adding version number...');
                    version
                        .text(VisualConstants.about.version);

                /** Help box content */

                    /** Button / remote link*/
                        helpBox
                            .append('button')
                                .classed('w3-button', true)
                                .classed('w3-theme-action', true)
                                .classed('w3-circle', true)
                                .style('position', 'fixed')
                                .style('top', '24px')
                                .style('right', '12px')
                                .on('click', () => host.launchUrl(VisualConstants.about.usageUrl))
                                .text('?');

                    /** Intro paragraph */
                        helpBox
                            .append('p')
                            .classed('w3-small', true)
                            .text(this.localisationManager.getDisplayName('Landing_Page_Overview'));

                    /** Bullet list */
                        let bulletList = helpBox
                                .append('ul')
                                    .classed('w3-ul', true)
                                    .classed('w3-border-0', true);
                        bulletList
                            .append('li')
                                .text(this.localisationManager.getDisplayName('Landing_Page_Overview_Field_1'));
                        bulletList
                            .append('li')
                                .text(this.localisationManager.getDisplayName('Landing_Page_Overview_Field_2'));
                        bulletList
                            .append('li')
                                .text(this.localisationManager.getDisplayName('Landing_Page_Overview_Field_3'));
            }

    }