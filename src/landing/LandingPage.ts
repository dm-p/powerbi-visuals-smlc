/** Power BI API references */
    import powerbi from 'powerbi-visuals-api';
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

import * as d3Selection from 'd3-selection';

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
    }

    render(element: Element) {

        /** Top-level elements */
            let container = d3Selection.select(element)
                    .append('div')
                        .classed('violinPlotLandingPage', true)
                        .classed(' w3-card-4', true),
                heading = container
                    .append('div')
                        .classed('w3-container', true)
                        .classed('w3-theme', true),
                version = container
                    .append('div')
                        .classed('w3-container', true)
                        .classed('w3-text-theme', true)
                        .classed('w3-small', true),
                helpBox = container
                    .append('div')
                        .classed('w3-container', true)
                        .classed('w3-theme-l5', true)
                        .classed('violinPlotHelp', true);

        /** Add title */
            heading
                .append('h5')
                    .text(this.localisationManager.getDisplayName('Visual_Name'));

        /** Add version number */
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