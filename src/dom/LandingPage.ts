/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

/** Internal dependencies */
    import Debugger from '../debug/Debugger';

    export class LandingPage {

        private host: IVisualHost;
        private helpUrl: string;
        private version: string;
        private localisationManager: ILocalizationManager;

        constructor(host: IVisualHost, helpUrl: string, version: string, localisationManager: ILocalizationManager) {
            this.host = host;
            this.helpUrl = helpUrl;
            this.version = version;
            this.localisationManager = localisationManager;
            Debugger.log('LandingPage instantiated :)');
        }

        render(element: d3.Selection<any, any, any, any>) {
            
            Debugger.footer();
            Debugger.log('Rendering landing page...');
            Debugger.log(element);

            /** Top-level elements */
                Debugger.log('Adding container...');
                let container = element
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
                    .text(this.version);
            
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
                            .on('click', () => this.host.launchUrl(this.helpUrl))
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