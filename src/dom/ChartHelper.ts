// Power BI API Dependencies
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import { legend, legendInterfaces } from 'powerbi-visuals-utils-chartutils';
    import ILegend = legendInterfaces.ILegend;
    import LegendPosition = legendInterfaces.LegendPosition;
    import positionChartArea = legend.positionChartArea;
    import createLegend = legend.createLegend;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import { textMeasurementService, valueFormatter } from 'powerbi-visuals-utils-formattingutils';
    import getTailoredTextOrDefault = textMeasurementService.getTailoredTextOrDefault;
    import measureSvgTextWidth = textMeasurementService.measureSvgTextWidth;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import {
        TooltipEventArgs,
        ITooltipServiceWrapper
    } from 'powerbi-visuals-utils-tooltiputils';
    import ISelectionId = powerbi.visuals.ISelectionId;

// External dependencies
    import * as d3 from 'd3';
    import * as OverlayScrollbars from 'overlayscrollbars';

// Internal dependencies
    import IViewModel from '../viewModel/IViewModel';
    import VisualSettings from '../settings/VisualSettings';
    import Debugger from '../debug/Debugger';
    import { visualConstants } from '../visualConstants';
    import ISmallMultipleMeasureValue from '../viewModel/ISmallMultipleMeasureValue';
    import EAxisScaleType from '../viewModel/EAxisScaleType';
    import ISmallMultiple from '../viewModel/ISmallMultiple';
    import IAxis from '../viewModel/IAxis';
    import AxisSettings from '../settings/AxisSettings';
    import EAxisType from '../viewModel/EAxisType';
    import LandingPageHandler from './LandingPageHandler';
    import { syncSelectionState } from './selectionManager';

/**
 * Manages the rendering/display of the visual
 */
    export default class ChartHelper {

        // The root element for the entire visual
            private visualContainer: HTMLElement;
        // The chart container
            private chartContainer: d3.Selection<any, any, any, any>;
        // The chart container
            public landingContainer: d3.Selection<any, any, any, any>;
        // Y-axis title container
            private yTitleContainer: d3.Selection<any, any, any, any>;
        // X-axis title container
            private xTitleContainer: d3.Selection<any, any, any, any>;
        // Chart canvas container
            private canvasContainer: d3.Selection<SVGSVGElement, any, any, any>;
        // Visual legend
            private legend: ILegend;
        // View model
            public viewModel: IViewModel;
        // Visual settings
            public settings: VisualSettings;
        // Host services
            public host: IVisualHost;
        // Selection manager
            public selectionManager: ISelectionManager;
        // Tooltip service
            public tooltipServiceWrapper: ITooltipServiceWrapper;
        // Selected small multiples
            private smSelection: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>;

        constructor(
            visualContainer: HTMLElement,
            visualHost: IVisualHost
        ) {
            Debugger.LOG('Chart helper constructor');
            this.visualContainer = visualContainer;
            this.host = visualHost;
            this.selectionManager = this.host.createSelectionManager();
            this.selectionManager.registerOnSelectCallback(() => {
                syncSelectionState(this.smSelection, <ISelectionId[]>this.selectionManager.getSelectionIds());
            });
            this.createLegendContainer();
            this.createChartContainer();
            this.createLandingPageContainer();
            Debugger.LOG('Chart helper instantiated!');
        }

    /**
     * Clear down our existing plot data as we need to re-draw the whole thing
     */
        clearChart() {
            Debugger.LOG('Clearing chart canvas...');
            this.chartContainer.selectAll('*').remove();
            this.chartContainer.attr('style', null);
        }

    /**
     * Creates the element used to hold the landing page
     */
        private createLandingPageContainer() {
            Debugger.LOG('Creating landing page container...');
            this.landingContainer = d3.select(this.visualContainer)
                .append('div')
                    .classed('landing-container', true);
        }

    /**
     * Creates the element used to manage the legend
     */
        private createLegendContainer() {
            Debugger.LOG('Creating legend container...');
            this.legend = createLegend(
                this.visualContainer,
                false,
                null,
                true,
                LegendPosition.Top
            );
        }

    /**
     * Handles the issue where the visual is too small to display
     */
        displayMinimised(
            landingPageHandler: LandingPageHandler
        ) {
            Debugger.LOG('Chart too small to render...');
            landingPageHandler.clear();
            this.chartContainer
                .append('div')
                    .classed('w3-container', true)
                    .classed('w3-theme-l5', true)
                    .classed('small-multiple-minimised', true)
                    .classed('small-multiple-watermark', true);
        }

    /**
     * Creates the container for the small multiple chart
     */
        private createChartContainer() {
            this.chartContainer = d3.select(this.visualContainer)
                .append('div')
                    .classed('visual-container', true);
        }

    /**
     * If the legend won't fit, then this will remove it and clean up any styling remnants
     */
        private removeLegend() {
            this.legend.changeOrientation(LegendPosition.None);
            this.viewModel.viewport = this.viewModel.initialViewport;
            this.chartContainer.style('margin-left', null);
            this.chartContainer.style('margin-top', null);
            this.legend.drawLegend(this.viewModel.legend, this.viewModel.viewport);
        }

    /**
     * Renders the legend, based on the properties supplied in the update method
     */
        renderLegend() {

            Debugger.FOOTER();
            Debugger.LOG('Rendering legend...');
            if (!this.viewModel || !this.viewModel.measureMetadata || !this.settings) {
                Debugger.LOG('No measure metadata. Skipping render!');
                return;
            }

            // We need to draw the legend first to figure out how big it might be
                Debugger.LOG('Setting position...');
                const position: LegendPosition = (this.settings.legend.show && this.viewModel.dataViewIsValid && this.viewModel.measureMetadata.length > 0)
                    ? LegendPosition[this.settings.legend.position]
                    : LegendPosition.None;
                Debugger.LOG(`Position: ${LegendPosition[position]}`);

                Debugger.LOG('Setting orientation...');
                this.legend.changeOrientation(position);
                this.legend.drawLegend(this.viewModel.legend, this.viewModel.viewport);
                positionChartArea(this.chartContainer, this.legend);

            // We need to test the viewport. If there's not enough room, we remove the legend
                Debugger.LOG('Testing and adjusting viewport to fit legend...');
                Debugger.LOG('Previous dimensions', JSON.stringify(this.viewModel.viewport));
                let width = this.legend.getMargins().width,
                    height = this.legend.getMargins().height;
                switch (this.legend.getOrientation()) {
                    case LegendPosition.Left:
                    case LegendPosition.LeftCenter:
                    case LegendPosition.Right:
                    case LegendPosition.RightCenter:
                        if (this.viewModel.viewport.width - width < visualConstants.visual.minPx) {
                            Debugger.LOG('Viewport cannot support legend in this orientation. Will be hidden.');
                            this.removeLegend();
                        } else {
                            Debugger.LOG('Legend will fit.');
                            this.viewModel.viewport.width -= width;
                        }
                        break;
                    case LegendPosition.Top:
                    case LegendPosition.TopCenter:
                    case LegendPosition.Bottom:
                    case LegendPosition.BottomCenter:
                        if (this.viewModel.viewport.height - height < visualConstants.visual.minPx) {
                            Debugger.LOG('Viewport cannot support legend in this orientation. Will be hidden.');
                            this.removeLegend();
                        } else {
                            Debugger.LOG('Legend will fit.');
                            this.viewModel.viewport.height -= height;
                        }
                        break;
                }
                Debugger.LOG('Adjusted dimensions', JSON.stringify(this.viewModel.viewport));
        }

    /**
     * Resizes the main SVG container based on where the legend is
     */
        sizeContainer() {
            Debugger.LOG('Sizing chart container for viewport...');
            this.chartContainer
                .attr('height', this.viewModel.layout.visualViewport.height)
                .attr('width', this.viewModel.layout.visualViewport.width);
        }

    /**
     * We add containers to hold the individual axis titles, so that we can have scrolling within the main chart viewport
     */
        addMasterAxisContainers() {
            Debugger.LOG('Adding container for Y-axis title...');
            this.yTitleContainer = this.chartContainer
                .append('div')
                    .classed('y-title', true)
                .append('svg')
                    .attr('height', this.viewModel.viewport.height - this.viewModel.xAxis.masterTitle.textHeight)
                    .attr('width', this.viewModel.yAxis.masterTitle.textHeight)
                    .append('g');
            this.renderAxisTitle(this.yTitleContainer, this.viewModel.yAxis, this.settings.yAxis);
            this.chartContainer
                .style('grid-template-columns', `${this.viewModel.yAxis.masterTitle.textHeight}px ${this.viewModel.viewport.width - this.viewModel.yAxis.masterTitle.textHeight}px`);

            Debugger.LOG('Adding container for X-axis title...');
            this.xTitleContainer = this.chartContainer
                .append('div')
                    .classed('x-title', true)
                .append('svg')
                    .attr('height', this.viewModel.xAxis.masterTitle.textHeight)
                    .attr('width', this.viewModel.viewport.width - this.viewModel.yAxis.masterTitle.textHeight)
                    .append('g');
            this.renderAxisTitle(this.xTitleContainer, this.viewModel.xAxis, this.settings.xAxis);
            this.chartContainer
                .style('grid-template-rows', `${this.viewModel.viewport.height - this.viewModel.xAxis.masterTitle.textHeight}px ${this.viewModel.xAxis.masterTitle.textHeight}px`);
        }

    /**
     * Set up the main chart canvas
     */
        addCanvas() {
            this.canvasContainer = this.chartContainer
                .append('div')
                    .classed('visual-canvas', true)
                .append('svg')
                    .attr('width', this.viewModel.layout.chartViewport.width)
                    .attr('height', this.viewModel.layout.chartViewport.height);
        }

    /**
     * Adds master X and Y axis elements to the DOM
     */
        renderMasterAxes() {
            Debugger.LOG('Adding master axes group...');
            let group = this.canvasContainer
                .append('g')
                    .classed('small-multiple-master-axis-container', true);

            // Y-axis
                if (this.settings.yAxis.show) {
                    Debugger.LOG('Rendering Y-axis...');
                    for (let r = 0; r < this.viewModel.layout.smallMultiples.grid.rows.count; r++) {
                        Debugger.LOG('Rendering Y-axis ticks...');
                        this.renderAxis(
                            group,
                            this.viewModel.yAxis.tickLabels.textWidth,
                            (r * this.viewModel.layout.smallMultiples.grid.rows.height)
                                + this.viewModel.layout.smallMultiples.multiple.margin.top
                                + this.viewModel.layout.smallMultiples.multiple.borderOffset,
                            this.viewModel.yAxis,
                            this.settings.yAxis,
                            true
                        );
                    }
                }

            // X-axis
                if (this.settings.xAxis.show) {
                    Debugger.LOG('Rendering X-axis...');
                    for (let c = 0; c < this.viewModel.layout.smallMultiples.grid.columns.count; c++) {
                        Debugger.LOG('Rendering X-axis ticks...');
                        this.renderAxis(
                            group,
                            this.viewModel.yAxis.tickLabels.textWidth
                                + (c * this.viewModel.layout.smallMultiples.multiple.xOffset)
                                + this.viewModel.layout.smallMultiples.multiple.margin.left
                                + this.viewModel.layout.smallMultiples.multiple.borderOffset,
                            this.viewModel.layout.chartViewport.height
                                - this.viewModel.xAxis.tickLabels.textHeight
                                + this.viewModel.layout.smallMultiples.multiple.borderOffset,
                            this.viewModel.xAxis,
                            this.settings.xAxis,
                            true
                        );
                    }
                }
        }

    /**
     * Adds the containing SVG element for all small multiples to the DOM
     */
        renderSmallMultiples() {

            // Main viewport
                let viewport = this.renderSmallMultipleChartViewport();

            // Add rows to group
                for (let r = 0; r < this.viewModel.layout.smallMultiples.grid.rows.count; r++) {
                    Debugger.LOG(`Rendering row #${r}...`);

                    // Row (of multiples) element
                        let row = this.renderSmallMultipleRow(viewport, r);

                    // Clip path for line chart
                        this.renderSmallMultipleRowClipPath(row);

                    // Small multiple SVGs
                        let multiples = this.renderSmallMultiplesForRow(row, r);
                        this.smSelection = this.chartContainer
                            .selectAll('.small-multiple');

                    // Borders
                        this.renderSmallMultipleBorders(row, r);

                    // Background
                        this.renderSmallMultipleBackground(multiples);

                    // Label
                        this.renderSmallMultipleLabel(multiples);

                    // Add y-axis
                        if (this.settings.yAxis.show) {
                            Debugger.LOG('Rendering Y-axis...');
                            this.renderAxis(
                                multiples,
                                0,
                                this.viewModel.layout.smallMultiples.multiple.margin.top,
                                this.viewModel.yAxis,
                                this.settings.yAxis,
                                false
                            );
                        }

                    // Add x-axis
                        if (this.settings.xAxis.show) {
                            Debugger.LOG('Rendering X-axis...');
                            this.renderAxis(
                                multiples,
                                this.viewModel.layout.smallMultiples.multiple.margin.left,
                                this.viewModel.layout.smallMultiples.multiple.inner.height + this.viewModel.layout.smallMultiples.multiple.margin.top,
                                this.viewModel.xAxis,
                                this.settings.xAxis,
                                false
                            );
                        }

                    // Plot area
                        let plotArea = this.renderSmallMutliplePlotArea(multiples);

                    // Add container to manage tooltip focus
                        let overlay = this.renderSmallMultipleTooltipOverlay(multiples);

                    // Plot lines and tooltip markers
                        this.renderSmallMultipleTooltipMouseLine(overlay);
                        this.renderSmallMultipleMeasureArea(plotArea, overlay);
                        this.renderSmallMultipleMeasureLine(plotArea, overlay);

                    // Bind tooltip events
                        this.bindTooltipEvents(multiples);

                }

            // Bind selection events
                syncSelectionState(
                    this.smSelection,
                    <ISelectionId[]>this.selectionManager.getSelectionIds()
                );
                this.bindSmallMultipleSelection();
                this.bindClearAllSelections();

            // Bind context menu
                this.bindContextMenu();

            // Add overlayscrollbars
                OverlayScrollbars(document.querySelector('.visual-canvas'), {
                    scrollbars: {
                        clickScrolling: true
                    }
                });
        }

    /**
     * Resolves the correct 'central' X-position for a ScalePoint axis category
     */
        private scaleXPoint(
            category: string
        ) {
            let s = <d3.ScalePoint<string>>this.viewModel.xAxis.scale;
            return s(<string>category) + (s.bandwidth() / 2);
        }

    /**
     * Binds the context menu to the small multiple the mouse is over
     */
        private bindContextMenu() {
            if (this.settings.features.contextMenu && this.host.allowInteractions) {
                Debugger.LOG('Binding context menu...');
                this.chartContainer
                    .on('contextmenu', () => {
                        const mouseEvent: MouseEvent = <MouseEvent>d3.event,
                            eventTarget: EventTarget = mouseEvent.target;
                        Debugger.LOG('Context menu click', d3.select(<d3.BaseType>eventTarget).datum());
                        let dataPoint = <ISmallMultiple>d3.select(<d3.BaseType>eventTarget).datum();
                        this.selectionManager.showContextMenu(
                            dataPoint
                                ?   dataPoint.selectionId
                                :   {},
                            {
                                x: mouseEvent.clientX,
                                y: mouseEvent.clientY
                            }
                        );
                        mouseEvent.preventDefault();
                    });
            }
        }

        private bindSmallMultipleSelection() {
            this.smSelection.on('click', (d) => {
                // Allow selection only if the visual is rendered in a view that supports interactivity (e.g. Report)
                if (this.host.allowInteractions && this.settings.features.filterOtherVisuals) {
                    Debugger.LOG('Clicked on SM - filter by category');
                    /** If we have the context menu open, there's nothing in the API currently that lets us close it.
                     *  It does close if somewhere else in the UI is clicked, so this is a 'meh' way we can manage this
                     *  without borking the selection */
                        this.visualContainer.click();

                    const isCtrlPressed: boolean = (<MouseEvent>d3.event).ctrlKey;
    
                    this.selectionManager
                        .select(d.selectionId, isCtrlPressed)
                        .then((ids: ISelectionId[]) => {
                            syncSelectionState(this.smSelection, ids);
                        });
    
                    (<Event>d3.event).stopPropagation();
                }
            });
        }        

        private bindClearAllSelections() {
            this.chartContainer.on('click', (d) => {
                if (this.host.allowInteractions) {
                    Debugger.LOG('Clicked on Chart - clear down selection');
                    this.selectionManager
                        .clear()
                        .then(() => {
                            syncSelectionState(this.smSelection, []);
                        });

                    (<Event>d3.event).stopPropagation();
                }
            });
        }

    /**
     * Binds mouse events for tooltip handling to the specified element(s)
     */
        private bindTooltipEvents(
            element: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>
        ) {
            Debugger.LOG('Binding mouse events...');

            // Bind the tooltipWrapper event listener to each small multiple
                this.tooltipServiceWrapper.addTooltip(
                    element,
                    (tooltipEvent: TooltipEventArgs<ISmallMultipleMeasureValue[]>) => <VisualTooltipDataItem[]>this.getTooltipData(tooltipEvent, 'default'),
                    (tooltipEvent: TooltipEventArgs<ISmallMultipleMeasureValue[]>) => <ISelectionId>this.getTooltipData(tooltipEvent, 'canvas'),
                    true
                );

            // Visual cues on mouse hover
                element
                    // Upon entry, display the line nodes
                        .on('mouseover', (d, i, e) => {
                            d3.select(e[i])
                                .selectAll('.small-multiple-tooltip-overlay')
                                .style('display', null);
                        })
                    // Upon exit, hide the tooltip nodes
                        .on('mouseout', (d, i, e) => {
                                    d3.select(e[i])
                                        .selectAll('.small-multiple-tooltip-overlay')
                                        .style('display', 'none');
                                })
                    // Update the tooltip on hover
                        .on('mousemove', (d, i, e) => {
                                let dataPoints = this.getHighlightedDataPoints(e[i]),
                                    x: number;

                                switch (this.viewModel.xAxis.scaleType) {
                                    case EAxisScaleType.Linear: {
                                        x = (<d3.ScaleLinear<number, number>>this.viewModel.xAxis.scale)(<number>dataPoints[0].category);
                                        break;
                                    }
                                    case EAxisScaleType.Time: {
                                        x = (<d3.ScaleTime<number, number>>this.viewModel.xAxis.scale)(<Date>dataPoints[0].category);
                                        break;
                                    }
                                    default: {
                                        x = this.scaleXPoint(<string>dataPoints[0].category);
                                    }
                                }

                                d3.select(e[i]).select('.hover-line')
                                    .attr('x1', x)
                                    .attr('x2', x);

                                d3.select(e[i]).selectAll('.circle-item')
                                    .attr('transform', (d, di) => {
                                            let measureIndex = this.viewModel.measureMetadata.length - 1 - di,
                                                dataPoint = dataPoints[measureIndex],
                                                measure = this.viewModel.measureMetadata[measureIndex],
                                                value = measure.role === 'tooltip'
                                                        ?   this.viewModel.statistics.min.value
                                                        :   <number>dataPoint.value;
                                            return `translate(${x}, ${
                                                (<d3.ScaleLinear<number, number>>this.viewModel.yAxis.scale)(value)
                                            })`
                                        })
                                    // #23: If we got a null value for closest data point then hide it
                                    .style('display', (d, di) => <number>dataPoints[this.viewModel.measureMetadata.length - 1 - di].value === null ? 'none' : null);
                            });

        }

    /**
     * Retrieves the small multiples for the specified row number from the view model
     */
        private getSmallMultiplesForRow(
            row: number
        ): ISmallMultiple[] {
            Debugger.LOG('Getting small multiples for this row...');
            return this.viewModel.multiples
                .map((m) => m)
                .slice(row * this.viewModel.layout.smallMultiples.grid.columns.count, (row * this.viewModel.layout.smallMultiples.grid.columns.count) + this.viewModel.layout.smallMultiples.grid.columns.count);
        }

    /**
     * Retrieve tooltip data from specified data points
     */
        private getTooltipData(
            tooltipEvent: any,
            tooltipType = 'default'
        ): VisualTooltipDataItem[] | ISelectionId {
            Debugger.LOG('Instantiating tooltip...');
            let overlay = tooltipEvent.context
                        .closest('.small-multiple-canvas');
            let dataPoints = this.getHighlightedDataPoints(overlay);
            switch (tooltipType) {
                case 'canvas': {
                    return dataPoints[0].selectionId;
                }
                default: {
                    return dataPoints.map((dp) => dp.tooltip);
                }
            }
        }

    /**
     * Uses the current mouse position to return data points that fall nearest to it
     */
        private getHighlightedDataPoints(
            overlay: d3.ContainerElement
        ): ISmallMultipleMeasureValue[] {
            let category = this.viewModel.categoryMetadata.metadata,
                xPos = d3.mouse(overlay)[0],
                xData: number | Date | string,
                dataPoints: ISmallMultipleMeasureValue[] = [];

            d3.select(overlay)
                .selectAll('.circle-item')
                    .each((d: ISmallMultiple, i) => {
                        /** 
                         *  Handle inversion for each specific scale type and bisect if necessary. Point axes are handled differently, as they
                         *  aren't really linear so we defer to a special function we've written to handle finding the nearest value in these
                         *  cases.
                         */
                            switch (true) {
                                case category.type.numeric:
                                case category.type.dateTime: {
                                    xData = this.linearPointInvert(<any>this.viewModel.xAxis.scale)(xPos);
                                    dataPoints.push(this.linearPointBisect(d, i, xData));
                                    break;
                                }
                                default: {
                                    xData = this.scalePointInvert(<d3.ScalePoint<string>>this.viewModel.xAxis.scale)(xPos);
                                    dataPoints.push(this.scalePointBisect(d, i, xData));
                                }
                            }
                    });
            return dataPoints;
        }

    /**
     * Gets the resolved category position for the given x-cordinate
     */
        private linearPointInvert(
            scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>
        ) {
            return (value) => scale.invert(value);
        }

    /**
     * Finds the nearest desired category for the given x-coordinate
     */
        private linearPointBisect(
            multiple: ISmallMultiple,
            measureIndex: number,
            xData: number | Date
        ) {
            let data = multiple.measures[measureIndex].values,
            bisectValue = d3.bisector((d: ISmallMultipleMeasureValue) => d.category).left,
            idx = bisectValue(data, xData, 1),
            d0 = data[idx - 1],
            d1 = data[idx] || d0;
            return <any>xData - <any>d0.category > <any>d1.category - <any>xData ? d1 : d0;
        }

    /**
     *  d3.ScalePoint doesn't offer an invert function for us to work out the nearest category, so this provides a proxy and can be used
     *  for these particular cases
     */
        private scalePointInvert(
            scale: d3.ScalePoint<string>
        ) {
            let domain = scale.domain(),
                paddingOuter = scale(domain[0]),
                eachBand = scale.step();
            return (value) => {
                let index = Math.floor((value - paddingOuter) / eachBand);
                return domain[Math.max(0, Math.min(index, domain.length - 1))];
            };
        }

    /**
     * Returns the first matching point (category) value for the given x-coordinate
     */
        private scalePointBisect(
            multiple: ISmallMultiple,
            measureIndex: number,
            xData: string
        ) {
            return multiple.measures[measureIndex].values
                .filter((v) => v.category === xData)[0];
        }

    /**
     * Resolves and retrieves x-axis coordinate for a data point
     */
        private getLineXCoordinate(
            dataPoint: ISmallMultipleMeasureValue
        ) {
            switch (this.viewModel.xAxis.scaleType) {
                case EAxisScaleType.Linear: {
                    return (<d3.ScaleLinear<number, number>>this.viewModel.xAxis.scale)(<number>dataPoint.category);
                }
                case EAxisScaleType.Time: {
                    return (<d3.ScaleTime<number, number>>this.viewModel.xAxis.scale)(<Date>dataPoint.category);
                }
                default: {
                    return this.scaleXPoint(<string>dataPoint.category);
                }
            }
        }

    /**
     * Generator function for measure lines
     */
        private measureLineGenerator(): d3.Line<ISmallMultipleMeasureValue> {
            Debugger.LOG('Building line generation function for measures...');
            let yAxis = (<d3.ScaleLinear<number, number>>this.viewModel.yAxis.scale);
            return d3.line<ISmallMultipleMeasureValue>()
                .x((d) => this.getLineXCoordinate(d))
                .y((d) => yAxis(d.value))
                .defined((d) => d.value !== null);
        }

    /**
     * Generator function for measure areas
     */
        private measureAreaGenerator(): d3.Line<ISmallMultipleMeasureValue> {
            Debugger.LOG('Building area generation function for measures...');
            let yAxis = (<d3.ScaleLinear<number, number>>this.viewModel.yAxis.scale);
            return d3.area<ISmallMultipleMeasureValue>()
                .x((d) => this.getLineXCoordinate(d))
                .y0(yAxis(yAxis.domain()[0]))
                .y1((d) => yAxis(d.value))
                .defined((d) => d.value !== null);
        }

    /**
     * Handles the rendering of an axis within the visual
     * @param container     - element to render the axis against.
     * @param dx            - amount to adjust x-placement by.
     * @param dy            - amount to adjust y-placement by.
     * @param axis          - axis to work with.
     * @param axisSettings  - properties for the specified axis.
     * @param isMasterAxis  - specifies whether the axis is on the outside of the row or inside the small multiple.
     */
        private renderAxis(
            container: d3.Selection<any, any, any, any>,
            dx: number,
            dy: number,
            axis: IAxis,
            axisSettings: AxisSettings,
            isMasterAxis: boolean
        ) {
            let ticks = container
                .append('g')
                    .classed('small-multiple-axis', true)
                    .attr('transform', `translate(${dx}, ${dy})`);

            /**
             *  Do orientation-specific handling:
             *   - Y-Axis is always linear, so we can guarantee that it's always going to behave the same
             *   - X-axis could be one of 3 types so tick behaviour differs depending on this. We also use a fixed number of ticks
             *      (lowest and highest value) for now, so we need to specifically handle their placement and text-anchor.
             */
            switch (axis.axisType) {
                case EAxisType.Value: {
                    Debugger.LOG('Setting up ticks for Y-axis...');
                    ticks.call(this.getD3LinearAxis(axis, isMasterAxis));
                    break;
                }
                case EAxisType.Category: {
                    Debugger.LOG('Setting up ticks for X-axis...');
                    let d3Axis: d3.Axis<number | Date | { valueOf(): number; }> | d3.Axis<String>;

                    // Handle the tick values based on scale type; Linear/Time need formatting
                        switch (axis.scaleType) {
                            case EAxisScaleType.Linear:
                            case EAxisScaleType.Time: {
                                d3Axis = d3.axisBottom(<d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>>axis.scale);
                                break;
                            }
                            case EAxisScaleType.Point: {
                                d3Axis = d3.axisBottom(<d3.ScalePoint<string>>axis.scale);
                                break;
                            }
                        }

                    // Tick size is common to all axis types
                        d3Axis.tickSize(isMasterAxis
                            ?   -axis.tickLabels.textHeight
                            :   axis.tickHeight
                        );
                        d3Axis.ticks(axis.ticks);
                        d3Axis.tickSizeOuter(visualConstants.ranges.axisLineStrokeWidth.max);
                        ticks.call(d3Axis);

                    break;
                }
            }

            // Manipulate the plotted axis accordingly
                ticks
                    // Apply gridline settings    
                    .call((element) => this.applyAxisGridlines(element, isMasterAxis, axisSettings))
                    // Apply tick label settings
                    .call((element) => this.applyAxisTickLabels(element, axis, isMasterAxis, axisSettings))
                    // Remove the domain line for everything but the master X-axis (if we still want it)
                    .call((element) => this.applyAxisDomainLine(element, axis, isMasterAxis));
        }

    /**
     * For the supplied linear axis, create the d3 axis object.
     * @param axis          - linear axis to work with.
     * @param isMasterAxis  - specifies whether the axis is on the outside of the row or inside the small multiple.
     */
        private getD3LinearAxis(
            axis: IAxis,
            isMasterAxis: boolean
        ) {
            return d3.axisLeft(<d3.ScaleLinear<number, number>>axis.scale)
                .ticks(axis.ticks)
                .tickFormat((d) => axis.numberFormat.format(d))
                .tickSize(isMasterAxis
                    ?   -axis.tickLabels.textWidth
                    :   axis.tickWidth
                );
        }

    /**
     * Applies gridline settings for a specified axis to an element.
     * @param element       - DOM element to apply gridlines to.
     * @param isMasterAxis  - specifies whether the axis is on the outside of the row or inside the small multiple.
     * @param axisSettings  - properties for the specified axis.
     */
        private applyAxisGridlines(
            element: d3.Selection<SVGGElement, any, any, any>,
            isMasterAxis: boolean,
            axisSettings: AxisSettings
        ) {
            Debugger.LOG('Applying gridline settings...');
            if (axisSettings.gridlines && !isMasterAxis) {
                element.selectAll('.tick line')
                    .classed(axisSettings.gridlineStrokeLineStyle, true)
                    .style('stroke', axisSettings.gridlineColor)
                    .style('stroke-width', axisSettings.gridlines
                            ? axisSettings.gridlineStrokeWidth
                            : 0
                        );
            } else {
                element.selectAll('.tick line').remove();
            }
        }

    /**
     * Manages the behaviour of tick labels for an axis.
     * @param element       - DOM element to apply tick labels to.
     * @param axis          - axis to work with.
     * @param isMasterAxis  - specifies whether the axis is on the outside of the row or inside the small multiple.
     * @param axisSettings  - properties for the specified axis.
     */
        private applyAxisTickLabels(
            element: d3.Selection<SVGGElement, any, any, any>,
            axis: IAxis,
            isMasterAxis: boolean,
            axisSettings: AxisSettings
        ) {
            Debugger.LOG('Applying tick label settings...');
            if (axisSettings.showLabels && isMasterAxis) {
                // Font configuration & tooltip value
                    element.selectAll('.tick text')
                        .style('font-family', axisSettings.fontFamily)
                        .style('font-size', axisSettings.fontSize)
                        .style('fill', axisSettings.fontColor);

                /**
                 *  Specify different text anchors for X-axis first and last values, so they stay inside the range.
                 *  Also, tailor the label, if it's wider than half the small multiple.
                 */
                    if (axis.axisType === EAxisType.Category) {
                        element.selectAll('.tick:not(:first-of-type):not(:last-of-type) text')
                            .remove();
                        element.select('.tick:first-of-type text')
                            .style('text-anchor', 'start');
                        element.select('.tick:last-of-type text')
                            .style('text-anchor', 'end');
                        element.selectAll('.tick text')
                            .text((d: string) => {
                                let formattedValue = valueFormatter.format(d, this.viewModel.categoryMetadata.metadata.format);
                                let textProperties = axis.tickLabels.properties,
                                    availableWidth = this.viewModel.layout.smallMultiples.multiple.inner.width * 0.5;
                                textProperties.text = formattedValue;
                                let actualWidth = measureSvgTextWidth(textProperties);
                                // This is a bit... unforgiving. We'll need to suss it out
                                return getTailoredTextOrDefault(textProperties, availableWidth);
                            })
                            .append('title')
                                .text((d) => valueFormatter.format(d, this.viewModel.categoryMetadata.metadata.format));
                    }
                // Nudge down the labels if we want the domain line
                    if (axis.axisType === EAxisType.Category && isMasterAxis && this.settings.xAxis.showAxisLine) {
                        element.selectAll('.tick text')
                            .attr('transform', `translate(0, ${visualConstants.ranges.axisLineStrokeWidth.max})`);
                    }
            } else {
                element.selectAll('.tick text').remove();
            }
        }

    /**
     * 
     * @param element       - DOM element to apply domain line to.
     * @param axis          - axis to work with.
     * @param isMasterAxis  - specifies whether the axis is on the outside of the row or inside the small multiple.
     */
        private applyAxisDomainLine(
            element: d3.Selection<SVGGElement, any, any, any>,
            axis: IAxis,
            isMasterAxis: boolean
        ) {
            Debugger.LOG('Applying domain line settings...');
            if (!(axis.axisType === EAxisType.Category && isMasterAxis && this.settings.xAxis.showAxisLine) || axis.ticksAreCollapsed) {
                element.select('.domain').remove();
            }
            if (axis.axisType === EAxisType.Category && isMasterAxis && this.settings.xAxis.showAxisLine) {
                element.select('.domain')
                    .style('stroke', this.settings.xAxis.axisLineColor)
                    .style('stroke-width', this.settings.xAxis.axisLineStrokeWidth);
            }
        }

    /**
     * Determines if the specified axis title is required, and adds it to the DOM if so
     */
        private renderAxisTitle(
            element: d3.Selection<SVGGElement, any, any, any>, axis: IAxis, axisSettings: AxisSettings
        ) {
            if (axisSettings.showTitle && !axis.titleIsCollapsed) {
                Debugger.LOG('Adding axis title...');
                element
                    .append('text')
                        .classed('master-axis', true)
                        .text(axis.masterTitle.tailoredValue)
                        .attr('transform', `rotate(${axis.axisType === EAxisType.Value ? -90 : 0})`)
                        .attr('x', axis.masterTitle.x)
                        .attr('y', axis.masterTitle.y)
                        .style('text-anchor', 'middle')
                        .style('dominant-baseline', 'central')
                        .style('dy', '1em')
                        .style('font-family', axisSettings.titleFontFamily)
                        .style('font-size', `${axisSettings.titleFontSize}pt`)
                        .style('fill', axisSettings.titleColor)
                    .append('title')
                        .text(axis.masterTitle.properties.text);
            }
        }

    /**
     * Adds the background element to the small multiple and applies desired settings
     */
        private renderSmallMultipleBackground(
            element: d3.Selection<SVGGElement, ISmallMultiple, any, any>
        ) {
            Debugger.LOG('Adding small mutliple background...');
            element
                .append('rect')
                    .classed('small-multiple-background', true)
                    .attr('height', this.viewModel.layout.smallMultiples.multiple.outer.height)
                    .attr('width', this.viewModel.layout.smallMultiples.multiple.outer.width)
                    .attr('fill', (d) => d.backgroundColour)
                    .attr('fill-opacity', 1 - (this.settings.smallMultiple.backgroundTransparency / 100));
        }

    /**
     * Adds the small multiple chart to the viewport
     */
        private renderSmallMultipleChartViewport(): d3.Selection<SVGGElement, any, any, any> {
            Debugger.LOG('Rendering chart viewport...');
            return this.canvasContainer
                .append('g')
                    .classed('small-multiple-container', true)
                    .attr('transform', `translate(${this.viewModel.layout.x}, ${this.viewModel.layout.y})`)
                    .attr('width', this.viewModel.layout.visualViewport.width)
                    .attr('height', this.viewModel.layout.visualViewport.height);
        }

    /**
     * Determines if the small multiple label is required and adds it to the DOM if so, with specified settings
     */
        private renderSmallMultipleLabel(
            element: d3.Selection<SVGGElement, any, any, any>
        ) {
            if (this.settings.heading.show) {
                Debugger.LOG('Adding small multiple label...');
                element
                    .append('text')
                        .classed('small-multiple-label', true)
                        .attr('x', this.viewModel.layout.smallMultiples.multiple.heading.x)
                        .attr('y', this.viewModel.layout.smallMultiples.multiple.heading.y)
                        .text((d) => {
                                // This should map to view model properly
                                this.viewModel.layout.smallMultiples.multiple.heading.textProperties.text = 
                                    this.viewModel.layout.smallMultiples.multiple.heading.formatter.format(d.name);
                                return getTailoredTextOrDefault(this.viewModel.layout.smallMultiples.multiple.heading.textProperties, this.viewModel.layout.smallMultiples.multiple.inner.width);
                            })
                        .style('text-anchor', this.viewModel.layout.smallMultiples.multiple.heading.textAnchor)
                        .style('dominant-baseline', this.viewModel.layout.smallMultiples.multiple.heading.dominantBaseline)
                        .style('dy', '1em')
                        .style('font-family', this.settings.heading.fontFamily)
                        .style('font-size', `${this.settings.heading.fontSize}pt`)
                        .style('fill', (d) => d.titleColour)
                    .append('title')
                        .text((d) => d.name);
            }
        }

    /**
     * Manages the rendering of measure line and tooltip overlay markers for specified small multiple element
     */
        private renderSmallMultipleMeasureLine(
            element: d3.Selection<SVGGElement,ISmallMultiple, SVGGElement, any>,
            overlay: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>
        ) {
            let lineGen = this.measureLineGenerator();
            // We step through in reverse to draw first line last
                this.viewModel.measureMetadata.slice(0).reverse().map((m, mi) => {
                    let inverse = this.viewModel.measureMetadata.length - 1 - mi;
                    lineGen.curve(d3[`${m.lineShape}`]);

                    // Plot the line if a valid data point
                        if (m.role === 'dataPoint') {
                            Debugger.LOG(`Plotting line for measure ${m.metadata.displayName}...`);
                            element
                                .append('path')
                                    .classed('small-multiple-measure-line', true)
                                    .classed(m.lineStyle, true)
                                    .attr('d', (d) => lineGen(d.measures[inverse].values.filter(lineGen.defined())))
                                    .style('stroke', m.stroke)
                                    .style('stroke-linecap', 'round')
                                    .style('fill', 'none')
                                    .style('stroke-width', m.strokeWidth);
                        }
                    // Tooltip circle marker. This will be hidden if the measure is a tooltip, but it used to bind the data value for the tooltip.
                        overlay
                            .append('circle')
                                .classed('circle-item', true)
                                .attr('r', 3)
                                .attr('fill', (d) => m.stroke);
                });
        }

    /**
     * Manages the rendering of measure line and tooltip overlay markers for specified small multiple element
     */
        private renderSmallMultipleMeasureArea(
            element: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>,
            overlay: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>
        ) {
            let areaGen = this.measureAreaGenerator();
            // We step through in reverse to draw first line last
                this.viewModel.measureMetadata.slice(0).reverse().map((m, mi) => {
                    if (m.showArea) {
                        let inverse = this.viewModel.measureMetadata.length - 1 - mi;
                        Debugger.LOG(`Plotting line for measure ${m.metadata.displayName}...`);
                        areaGen.curve(d3[`${m.lineShape}`]);
                        element
                            .append('path')
                                .classed('small-multiple-measure-area', true)
                                .attr('d', (d) => areaGen(d.measures[inverse].values.filter(areaGen.defined())))
                                .style('fill', m.stroke)
                                .attr('fill-opacity', 1 - (m.backgroundTransparency / 100))
                                .style('stroke-width', 0);
                    }
                });
        }

    /**
     * Adds an element to manage plotting measures to the small mutliple
     */
        private renderSmallMutliplePlotArea(
            element: d3.Selection<SVGGElement, any, any, any>
        ): d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any> {
            Debugger.LOG('Adding plot area...');
            return element
                .append('g')
                    .classed('small-multiple-chart-path', true)
                    .attr('clip-path', 'url(#small-multiple-clip)')
                    .attr('transform', `translate(${this.viewModel.layout.smallMultiples.multiple.margin.left}, ${this.viewModel.layout.smallMultiples.multiple.margin.top})`);
        }

    /**
     * Adds a small multiple row group to the chart viewport
     */
        private renderSmallMultipleRow(
            element: d3.Selection<SVGGElement, any, any, any>,
            row: number
        ): d3.Selection<SVGGElement, any, any, any> {
            Debugger.LOG('Rendering row group...');
            return element
                .append('g')
                    .classed('small-multiple-row-container', true)
                    .attr('height', this.viewModel.layout.smallMultiples.grid.rows.height)
                    .attr('width', this.viewModel.layout.smallMultiples.grid.rows.width)
                    .attr('transform', `translate(${0}, ${row * this.viewModel.layout.smallMultiples.grid.rows.height})`);
        }

    /**
     * Adds a clipPath to the specified row group element (used to ensure that the chart clips if the Y-axis has been limited, and doesn't exceed
     * the bounds of the small multiple)
     */
        private renderSmallMultipleRowClipPath(
            element: d3.Selection<SVGGElement, any, any, any>
        ) {
            Debugger.LOG('Setting up clipPath...');
            element.selectAll('defs').remove();
            element
                .append('defs')
                .append('clipPath')
                    .attr('id', 'small-multiple-clip')
                    .style('fill', 'none')
                .append('rect')
                    .attr('width', this.viewModel.layout.smallMultiples.multiple.inner.width)
                    .attr('height', this.viewModel.layout.smallMultiples.multiple.inner.height);
        }

    /**
     * Adds all main SVG element containers for each small multiple for the specified row group
     */
        private renderSmallMultiplesForRow(
            element: d3.Selection<SVGGElement, any, any, any>,
            row: number
        ): d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any> {
            Debugger.LOG('Rendering small multiples for row...');
            return element
                .selectAll('svg')
                    .data(this.getSmallMultiplesForRow(row))
                    .enter()
                        .append('svg')
                            .classed('small-multiple', true)
                            .attr('x', (d, i) => i * this.viewModel.layout.smallMultiples.multiple.xOffset)
                            .style('fill-opacity', (d) => this.getSmallMultipleOpacity(d))
                            .style('stroke-opacity', (d) => this.getSmallMultipleOpacity(d))
                        .append('g')
                            .classed('small-multiple-canvas', true);
        }

        private getSmallMultipleOpacity(sm: ISmallMultiple) {
            return sm.highlight === true
                ? visualConstants.defaults.selection.solidOpacity
                : visualConstants.defaults.selection.transparentOpacity;
        }

    /**
     * Applies border configuration to small multiples y rendering over the top of them (this avoids all kinds of issues
     * that we had in the initial version, as borders would get clipped inside the main SVG)
     */
        private renderSmallMultipleBorders(
            element: d3.Selection<SVGGElement, any, any, any>,
            row: number
        ) {
            if (this.settings.smallMultiple.border) {
                Debugger.LOG('Rendering small multiple borders...');
                element
                    .selectAll('.small-multiple-border')
                        .data(this.getSmallMultiplesForRow(row))
                        .enter()
                            .append('g')
                                .classed('small-multiple-border', true)
                            .append('rect')
                                .classed(this.settings.smallMultiple.borderStyle, true)
                                .style('stroke', this.settings.smallMultiple.borderColor)
                                .style('stroke-width', this.settings.smallMultiple.border
                                        ? this.settings.smallMultiple.borderStrokeWidth
                                        : 0
                                    )
                                .attr('x', (d, i) => i * this.viewModel.layout.smallMultiples.multiple.xOffset)
                                .attr('height', this.viewModel.layout.smallMultiples.multiple.outer.height)
                                .attr('width', this.viewModel.layout.smallMultiples.multiple.outer.width);
            }

        }

    /**
     * Adds boilerplate overlay to specified small multiple element(s) for tooltip tracking and info
     */
        private renderSmallMultipleTooltipOverlay(
            element: d3.Selection<SVGGElement, any, any, any>
        ): d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any> {
            Debugger.LOG('Adding tooltip overlay...');
            let overlay = element
                .append('g')
                    .classed('small-multiple-tooltip-overlay', true)
                    .attr('transform', `translate(${this.viewModel.layout.smallMultiples.multiple.margin.left}, ${this.viewModel.layout.smallMultiples.multiple.margin.top})`)
                    .style('display', 'none');
            // Add a (transparent) rectangle, to track mouse movement
                overlay
                    .append('rect')
                        .classed('tooltip-canvas', true)
                        .attr('height', this.viewModel.layout.smallMultiples.multiple.inner.height)
                        .attr('width', this.viewModel.layout.smallMultiples.multiple.inner.width)
                        .style('fill', 'none');
            return overlay;
        }

    /**
     * Adds a line to the specified overlay element, which is used to track mouse position to the nearest category
     */
        private renderSmallMultipleTooltipMouseLine(
            element: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>
        ) {
            Debugger.LOG('Adding tooltip mouse line to overlay...');
            element
                .append('line')
                    .classed('hover-line', true)
                    .attr('y1', 0)
                    .attr('y2', this.viewModel.layout.smallMultiples.multiple.inner.height);
        }

    }