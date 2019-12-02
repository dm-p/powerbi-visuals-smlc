/** Power BI API Dependencies */
    import powerbi from 'powerbi-visuals-api';
    import { legend, legendInterfaces } from 'powerbi-visuals-utils-chartutils';
    import ILegend = legendInterfaces.ILegend;
    import LegendPosition = legendInterfaces.LegendPosition;
    import positionChartArea = legend.positionChartArea;
    import createLegend = legend.createLegend;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import { textMeasurementService, valueFormatter } from 'powerbi-visuals-utils-formattingutils';
    import getTailoredTextOrDefault = textMeasurementService.textMeasurementService.getTailoredTextOrDefault;
    import measureSvgTextWidth = textMeasurementService.textMeasurementService.measureSvgTextWidth;
    import TextProperties = textMeasurementService.TextProperties;
    import measureSvgTextHeight = textMeasurementService.textMeasurementService.measureSvgTextHeight;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import {
        TooltipEventArgs,
        ITooltipServiceWrapper
    } from 'powerbi-visuals-utils-tooltiputils';
    import ISelectionId = powerbi.visuals.ISelectionId;

/** External dependencies */
    import * as d3 from 'd3';
    import * as OverlayScrollbars from 'overlayscrollbars';

/** Internal dependencies */
    import IViewModel from '../viewModel/IViewModel';
    import VisualSettings from '../settings/VisualSettings';
    import VisualDebugger from '../debug/VisualDebugger';
    import { VisualConstants } from '../constants';
    import ISmallMultipleMeasureValue from '../viewModel/ISmallMutlipleMeasureValue';
    import ISmallMultipleMeasure from '../viewModel/ISmallMultipleMeasure';
    import EAxisScaleType from '../viewModel/EAxisScaleType';
    import ISmallMultiple from '../viewModel/ISmallMultiple';
    import IAxis from '../viewModel/IAxis';
    import AxisSettings from '../settings/AxisSettings';
    import EAxisType from '../viewModel/EAxisType';
    import IMeasure from '../viewModel/IMeasure';
    import IMeasureDataLabelValue from '../viewModel/IMeasureDataLabelValue';

/**
 *
 */
    export default class ChartHelper {

        /** The root element for the entire visual */
            private visualContainer: HTMLElement;
        /** The chart container */
            private chartContainer: d3.Selection<any, any, any, any>;
        /** Y-axis title container */
            private yTitleContainer: d3.Selection<any, any, any, any>;
        /** X-axis title container */
            private xTitleContainer: d3.Selection<any, any, any, any>;
        /** Chart canvas container */
            private canvasContainer: d3.Selection<SVGSVGElement, any, any, any>;
        /** Visual legend */
            private legend: ILegend;
        /** View model */
            public viewModel: IViewModel;
        /** Handles debugging based on visual constants */
            private debug: VisualDebugger;
        /** Visual settings */
            public settings: VisualSettings;
        /** Host services */
            public host: IVisualHost;
        /** Selection manager */
            public selectionManager: ISelectionManager;
        /** Tooltip service */
            public tooltipServiceWrapper: ITooltipServiceWrapper;

        constructor(visualContainer: HTMLElement) {
            this.debug = new VisualDebugger(VisualConstants.debug);
            this.debug.log('Chart helper constructor');
            this.visualContainer = visualContainer;
            this.createLegendContainer();
            this.createChartContainer();
            this.debug.log('Chart helper instantiated!');
        }

    /** Clear down our existing plot data as we need to re-draw the whole thing */
        clearChart() {
            this.debug.log('Clearing chart canvas...');
            this.chartContainer.selectAll('*').remove();
        }

    /** Creates the element used to manage the legend */
        private createLegendContainer() {
            this.legend = createLegend(
                this.visualContainer,
                false,
                null,
                true,
                LegendPosition.Top
            );
        }

    /** Creates the container for the small multiple chart */
        private createChartContainer() {
            this.chartContainer = d3.select(this.visualContainer)
                .append('div')
                    .classed('visual-container', true);
        }

    /** If the legend won't fit, then this will remove it and clean up any styling remnants */
        private removeLegend() {
            this.legend.changeOrientation(LegendPosition.None);
            this.viewModel.viewport = this.viewModel.initialViewport;
            this.chartContainer.style('margin-left', null);
            this.chartContainer.style('margin-top', null);
            this.legend.drawLegend(this.viewModel.legend, this.viewModel.viewport);
        }

    /** Renders the legend, based on the properties supplied in the update method */
        renderLegend() {

            this.debug.footer();
            this.debug.log('Rendering legend...');
            if (!this.viewModel || !this.viewModel.measureMetadata) {
                this.debug.log('No measure metadata. Skipping render!');
                return;
            }

            /** We need to draw the legend first to figure out how big it might be */
                this.debug.log('Setting position...');
                const position: LegendPosition = (this.settings.legend.show && this.viewModel.dataViewIsValid)
                    ? LegendPosition[this.settings.legend.position]
                    : LegendPosition.None;
                this.debug.log(`Position: ${LegendPosition[position]}`);

                this.debug.log('Setting orientation...');
                this.legend.changeOrientation(position);
                this.legend.drawLegend(this.viewModel.legend, this.viewModel.viewport);
                positionChartArea(this.chartContainer, this.legend);

            /** We need to test the viewport. If there's not enough room, we remove the legend */
                this.debug.log('Testing and adjusting viewport to fit legend...');
                this.debug.log('Previous dimensions', JSON.stringify(this.viewModel.viewport));
                let width = this.legend.getMargins().width,
                    height = this.legend.getMargins().height;
                switch (this.legend.getOrientation()) {
                    case LegendPosition.Left:
                    case LegendPosition.LeftCenter:
                    case LegendPosition.Right:
                    case LegendPosition.RightCenter:
                        if (this.viewModel.viewport.width - width < VisualConstants.ranges.canvas.minWidth) {
                            this.debug.log('Viewport cannot support legend in this orientation. Will be hidden.');
                            this.removeLegend();
                        } else {
                            this.debug.log('Legend will fit.');
                            this.viewModel.viewport.width -= width;
                        }
                        break;
                    case LegendPosition.Top:
                    case LegendPosition.TopCenter:
                    case LegendPosition.Bottom:
                    case LegendPosition.BottomCenter:
                        if (this.viewModel.viewport.height - height < VisualConstants.ranges.canvas.minWidth) {
                            this.debug.log('Viewport cannot support legend in this orientation. Will be hidden.');
                            this.removeLegend();
                        } else {
                            this.debug.log('Legend will fit.');
                            this.viewModel.viewport.height -= height;
                        }
                        break;
                }
                this.debug.log('Adjusted dimensions', JSON.stringify(this.viewModel.viewport));
        }

    /** Resizes the main SVG container based on where the legend is */
        sizeContainer() {
            this.debug.log('Sizing chart container for viewport...');
            this.chartContainer
                .attr('height', this.viewModel.layout.visualViewport.height)
                .attr('width', this.viewModel.layout.visualViewport.width);
        }

    /** We add containers to hold the individual axis titles, so that we can have scrolling within the main chart viewport */
        addMasterAxisContainers() {
            this.debug.log('Adding container for Y-axis title...');
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

            this.debug.log('Adding container for X-axis title...');
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

    /** Set up the main chart canvas */
        addCanvas() {
            this.canvasContainer = this.chartContainer
                .append('div')
                    .classed('visual-canvas', true)
                .append('svg')
                    .attr('width', this.viewModel.layout.chartViewport.width)
                    .attr('height', this.viewModel.layout.chartViewport.height);
        }

    /** Adds master X and Y axis elements to the DOM */
        renderMasterAxes() {
            this.debug.log('Adding master axes group...');
            let group = this.canvasContainer
                .append('g')
                    .classed('small-multiple-master-axis-container', true);

            /** Y-axis */
                if (this.settings.yAxis.show) {
                    this.debug.log('Rendering Y-axis...');
                    for (let r = 0; r < this.viewModel.layout.rows; r++) {
                        this.debug.log('Rendering Y-axis ticks...');
                        this.renderAxis(
                            group,
                            this.viewModel.yAxis.tickLabels.textWidth,
                            (r * this.viewModel.layout.rowDimensions.height)
                                + this.viewModel.layout.smallMultipleMargin.top
                                + this.viewModel.layout.smallMultipleBorderOffset,
                            this.viewModel.yAxis,
                            this.settings.yAxis,
                            true
                        );
                    }
                }

            /** X-axis */
                if (this.settings.xAxis.show) {
                    this.debug.log('Rendering X-axis...');
                    for (let c = 0; c < this.viewModel.layout.columns; c++) {
                        this.debug.log('Rendering X-axis ticks...');
                        this.renderAxis(
                            group,
                            this.viewModel.yAxis.tickLabels.textWidth
                                + (c * this.viewModel.layout.smallMultipleXConstant)
                                + this.viewModel.layout.smallMultipleMargin.left
                                + this.viewModel.layout.smallMultipleBorderOffset,
                            this.viewModel.layout.chartViewport.height
                                - this.viewModel.xAxis.tickLabels.textHeight
                                + this.viewModel.layout.smallMultipleBorderOffset,
                            this.viewModel.xAxis,
                            this.settings.xAxis,
                            true
                        );
                    }
                }
        }

    /** Adds the containing SVG element for all small multiples to the DOM */
        renderSmallMultiples() {

            /** Main viewport */
                let viewport = this.renderSmallMultipleChartViewport();

            /** Add rows to group */
                for (let r = 0; r < this.viewModel.layout.rows; r++) {
                    this.debug.log(`Rendering row #${r}...`);

                    /** Row (of multiples) element */
                        let row = this.renderSmallMultipleRow(viewport, r);

                    /** Clip path for line chart */
                        this.renderSmallMultipleRowClipPath(row);

                    /** Small multiple SVGs */
                        let multiples = this.renderSmallMultiplesForRow(row, r);

                    /** Borders */
                        this.renderSmallMultipleBorders(row, r);

                    /** Background */
                        this.renderSmallMultipleBackground(multiples);

                    /** Label */
                        this.renderSmallMultipleLabel(multiples);

                    /** Add y-axis */
                        if (this.settings.yAxis.show) {
                            this.debug.log('Rendering Y-axis...');
                            this.renderAxis(
                                multiples,
                                0,
                                this.viewModel.layout.smallMultipleMargin.top,
                                this.viewModel.yAxis,
                                this.settings.yAxis,
                                false
                            );
                        }

                    /** Add x-axis */
                        if (this.settings.xAxis.show) {
                            this.debug.log('Rendering X-axis...');
                            this.renderAxis(
                                multiples,
                                this.viewModel.layout.smallMultipleMargin.left,
                                this.viewModel.layout.smallMultipleChartDimensions.height + this.viewModel.layout.smallMultipleMargin.top,
                                this.viewModel.xAxis,
                                this.settings.xAxis,
                                false
                            );
                        }

                    /** Plot area */
                        let plotArea = this.renderSmallMutliplePlotArea(multiples);

                    /** Add container to manage tooltip focus */
                        let overlay = this.renderSmallMultipleTooltipOverlay(multiples);

                    /** Plot lines and tooltip markers */
                        this.renderSmallMultipleTooltipMouseLine(overlay);
                        this.renderSmallMultipleMeasure(plotArea, overlay);

                    /** Bind tooltip events */
                        this.bindTooltipEvents(multiples);

                    /** Bind context menu */
                        this.bindContextMenu();

                    /** Add overlayscrollbars */
                        OverlayScrollbars(document.querySelector('.visual-canvas'), {
                            scrollbars: {
                                clickScrolling: true
                            }
                        });

                }

        }

    /** Resolves the correct 'central' X-position for a ScalePoint axis category */
        private scaleXPoint(category: string) {
            let s = <d3.ScalePoint<string>>this.viewModel.xAxis.scale;
            return s(<string>category) + (s.bandwidth() / 2);
        }

    /** Binds the context menu to the small multiple the mouse is over */
        private bindContextMenu() {
            if (this.settings.features.contextMenu) {
                this.debug.log('Binding context menu...');
                this.chartContainer
                    .on('contextmenu', () => {
                        const mouseEvent: MouseEvent = d3.event as MouseEvent,
                            eventTarget: EventTarget = mouseEvent.target;
                        this.debug.log('Context menu click', d3.select(<d3.BaseType>eventTarget).datum());
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

    /** Binds mouse events for tooltip handling to the specified element(s) */
        private bindTooltipEvents(element: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>) {
            this.debug.log('Binding mouse events...');

            /** Bind the tooltipWrapper event listener to each small multiple */
                this.tooltipServiceWrapper.addTooltip(
                    element,
                    (tooltipEvent: TooltipEventArgs<ISmallMultipleMeasureValue[]>) => <VisualTooltipDataItem[]>this.getTooltipData(tooltipEvent, 'default'),
                    (tooltipEvent: TooltipEventArgs<ISmallMultipleMeasureValue[]>) => <ISelectionId>this.getTooltipData(tooltipEvent, 'canvas'),
                    true
                );

            /** Visual cues on mouse hover */
                element
                    /** Upon entry, display the line nodes */
                        .on('mouseover', (d, i, e) => {
                            d3.select(e[i])
                                .selectAll('.small-multiple-tooltip-overlay')
                                .style('display', null);
                        })
                    /** Upon exit, hide the tooltip nodes */
                        .on('mouseout', (d, i, e) => {
                                    d3.select(e[i])
                                        .selectAll('.small-multiple-tooltip-overlay')
                                        .style('display', 'none');
                                })
                    /** Update the tooltip on hover */
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
                                    .attr('transform', (d, di) => `translate(${x}, ${
                                            (<d3.ScaleLinear<number, number>>this.viewModel.yAxis.scale)(<number>dataPoints[this.viewModel.measureMetadata.length - 1 - di].value)
                                        })`);
                            });

        }

    /** Retrieves the small multiples for the specified row number from the view model */
        private getSmallMultiplesForRow(row: number): ISmallMultiple[] {
            this.debug.log('Getting small multiples for this row...');
            return this.viewModel.multiples
                .map((m) => m)
                .slice(row * this.viewModel.layout.columns, (row * this.viewModel.layout.columns) + this.viewModel.layout.columns);
        }

    /** Retrieve tooltip data from specified data points */
        private getTooltipData(tooltipEvent: any, tooltipType = 'default'): VisualTooltipDataItem[] | ISelectionId {
            this.debug.log('Instantiating tooltip...');
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

    /** Uses the current mouse position to return data points that fall nearest to it */
        private getHighlightedDataPoints(overlay: d3.ContainerElement): ISmallMultipleMeasureValue[] {
            let category = this.viewModel.categoryMetadata.metadata,
                xPos = d3.mouse(overlay)[0],
                xData: number | Date | string,
                dataPoints: ISmallMultipleMeasureValue[] = [];

            d3.select(overlay)
                .selectAll('.circle-item')
                    .each((d: ISmallMultiple, i) => {
                        /** Handle inversion for each specific scale type and bisect if necessary. Point axes are handled differently, as they
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

    /** Gets the resolved category position for the given x-cordinate */
        private linearPointInvert(scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>) {
            return (value) => scale.invert(value);
        }

    /** Finds the nearest desired category for the given x-coordinate */
        private linearPointBisect(multiple: ISmallMultiple, measureIndex: number, xData: number | Date) {
            let data = multiple.measures[measureIndex].values
                .filter((v) => v.value !== null),
            bisectValue = d3.bisector((d: ISmallMultipleMeasureValue) => d.category).left,
            idx = bisectValue(data, xData, 1),
            d0 = data[idx - 1],
            d1 = data[idx] || d0;
            return <any>xData - <any>d0.category > <any>d1.category - <any>xData ? d1 : d0;
        }

    /** d3.ScalePoint doesn't offer an invert function for us to work out the nearest category, so this provides a proxy and can be used
     *  for these particular cases
     */
        private scalePointInvert(scale: d3.ScalePoint<string>) {
            let domain = scale.domain(),
                paddingOuter = scale(domain[0]),
                eachBand = scale.step();
            return (value) => {
                let index = Math.floor((value - paddingOuter) / eachBand);
                return domain[Math.max(0, Math.min(index, domain.length - 1))];
            };
        }

    /** Returns the first matching point (category) value for the given x-coordinate */
        private scalePointBisect(multiple: ISmallMultiple, measureIndex: number, xData: string) {
            return multiple.measures[measureIndex].values
                .filter((v) => v.category === xData)[0];
        }

    /** Generator function for measure lines */
        private measureLineGenerator(): d3.Line<ISmallMultipleMeasureValue> {
            this.debug.log('Building line generation function for measures...');
            return d3.line<ISmallMultipleMeasureValue>()
                .x((d) => {
                        switch (this.viewModel.xAxis.scaleType) {
                            case EAxisScaleType.Linear: {
                                return (<d3.ScaleLinear<number, number>>this.viewModel.xAxis.scale)(<number>d.category);
                            }
                            case EAxisScaleType.Time: {
                                return (<d3.ScaleTime<number, number>>this.viewModel.xAxis.scale)(<Date>d.category);
                            }
                            default: {
                                return this.scaleXPoint(<string>d.category);
                            }
                        }
                    })
                .y((d) => (<d3.ScaleLinear<number, number>>this.viewModel.yAxis.scale)(d.value))
                .defined((d) => d.value !== null);
        }

        private renderAxis(container: d3.Selection<any, any, any, any>, dx: number, dy: number, axis: IAxis, axisSettings: AxisSettings, isMasterAxis: boolean) {
            let ticks = container
                .append('g')
                    .classed('small-multiple-axis', true)
                    .attr('transform', `translate(${dx}, ${dy})`);

            /** Do orientation-specific handling:
             *   - Y-Axis is always linear, so we can guarantee that it's always going to behave the same
             *   - X-axis could be one of 3 types so tick behaviour differs depending on this. We also use a fixed number of ticks
             *      (lowest and highest value) for now, so we need to specifically handle their placement and text-anchor.
             */

            switch (axis.axisType) {
                case EAxisType.Value: {
                    this.debug.log('Setting up ticks for Y-axis...');
                    ticks
                        .call(d3.axisLeft(<d3.ScaleLinear<number, number>>axis.scale)
                                .ticks(axis.ticks)
                                .tickFormat((d) => axis.numberFormat.format(d))
                                .tickSize(isMasterAxis
                                        ?   -axis.tickLabels.textWidth
                                        :   axis.tickWidth
                                    )
                            );
                    break;
                }
                case EAxisType.Category: {
                    this.debug.log('Setting up ticks for X-axis...');
                    let d3Axis: d3.Axis<number | Date | { valueOf(): number; }> | d3.Axis<String>;

                    /** Handle the tick values based on scale type; Linear/Time need formatting */
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

                    /** Tick size is common to all axis types */
                        d3Axis.tickSize(isMasterAxis
                            ?   -axis.tickLabels.textHeight
                            :   axis.tickHeight
                        );
                        d3Axis.ticks(axis.ticks);
                        d3Axis.tickSizeOuter(VisualConstants.ranges.axisLineStrokeWidth.max);
                        ticks.call(d3Axis);

                    break;
                }
            }

            /** Manipulate the plotted axis accordingly */
                ticks

                    /** Apply gridline settings */
                        .call((g) => {
                                this.debug.log('Applying gridline settings...');
                                if (axisSettings.gridlines && !isMasterAxis) {
                                    g.selectAll('.tick line')
                                        .classed(axisSettings.gridlineStrokeLineStyle, true)
                                        .style('stroke', axisSettings.gridlineColor)
                                        .style('stroke-width', axisSettings.gridlines
                                                ? axisSettings.gridlineStrokeWidth
                                                : 0
                                            );
                                } else {
                                    g.selectAll('.tick line').remove();
                                }
                            })

                    /** Apply tick label settings */
                        .call((g) => {
                                this.debug.log('Applying tick label settings...');
                                if (axisSettings.showLabels && isMasterAxis) {
                                    /** Font configuration & tooltip value */
                                        g.selectAll('.tick text')
                                            .style('font-family', axisSettings.fontFamily)
                                            .style('font-size', axisSettings.fontSize)
                                            .style('fill', axisSettings.fontColor);

                                    /** Specify different text anchors for X-axis first and last values, so they stay inside the range.
                                     *  Also, tailor the label, if it's wider than half the small multiple.
                                     */
                                        if (axis.axisType === EAxisType.Category) {
                                            g.selectAll('.tick:not(:first-of-type):not(:last-of-type) text')
                                                .remove();
                                            g.select('.tick:first-of-type text')
                                                .style('text-anchor', 'start');
                                            g.select('.tick:last-of-type text')
                                                .style('text-anchor', 'end');
                                            g.selectAll('.tick text')
                                                .text((d: string) => {
                                                    let formattedValue = valueFormatter.format(d, this.viewModel.categoryMetadata.metadata.format);
                                                    let textProperties = axis.tickLabels.properties,
                                                        availableWidth = this.viewModel.layout.smallMultipleChartDimensions.width * 0.5;
                                                    textProperties.text = formattedValue;
                                                    let actualWidth = measureSvgTextWidth(textProperties);
                                                    /**
                                                     *  TODO: this is a bit... unforgiving. We'll need to suss it out
                                                     *  console.log('Available', availableWidth, 'Actual', actualWidth, 'Props', textProperties.text);
                                                     */
                                                    return getTailoredTextOrDefault(textProperties, availableWidth);
                                                })
                                                .append('title')
                                                    .text((d) => valueFormatter.format(d, this.viewModel.categoryMetadata.metadata.format));
                                        }
                                    /** Nudge down the labels if we want the domain line */
                                        if (axis.axisType === EAxisType.Category && isMasterAxis && this.settings.xAxis.showAxisLine) {
                                            g.selectAll('.tick text')
                                                .attr('transform', `translate(0, ${VisualConstants.ranges.axisLineStrokeWidth.max})`);
                                        }
                                } else {
                                    g.selectAll('.tick text').remove();
                                }
                            })

                    /** Remove the domain line for everything but the master X-axis (if we still want it) */
                        .call((g) => {
                                this.debug.log('Applying domain line settings...');
                                if (!(axis.axisType === EAxisType.Category && isMasterAxis && this.settings.xAxis.showAxisLine) || axis.ticksAreCollapsed) {
                                    g.select('.domain').remove();
                                }
                                if (axis.axisType === EAxisType.Category && isMasterAxis && this.settings.xAxis.showAxisLine) {
                                    g.select('.domain')
                                        .style('stroke', this.settings.xAxis.axisLineColor)
                                        .style('stroke-width', this.settings.xAxis.axisLineStrokeWidth);
                                }
                            });
        }

    /** Determines if the specified axis title is required, and adds it to the DOM if so */
        private renderAxisTitle(element: d3.Selection<SVGGElement, any, any, any>, axis: IAxis, axisSettings: AxisSettings) {
            if (axisSettings.showTitle && !axis.titleIsCollapsed) {
                this.debug.log('Adding axis title...');
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

    /** Adds the background element to the small multiple and applies desired settings */
        private renderSmallMultipleBackground(element: d3.Selection<SVGGElement, ISmallMultiple, any, any>) {
            this.debug.log('Adding small mutliple background...');
            element
                .append('rect')
                    .classed('small-multiple-background', true)
                    .attr('height', this.viewModel.layout.smallMultipleDimensions.height)
                    .attr('width', this.viewModel.layout.smallMultipleDimensions.width)
                    .attr('fill', (d) => d.backgroundColour)
                    .attr('fill-opacity', 1 - (this.settings.smallMultiple.backgroundTransparency / 100));
        }

    /** Adds the small multiple chart to the viewport */
        private renderSmallMultipleChartViewport(): d3.Selection<SVGGElement, any, any, any> {
            this.debug.log('Rendering chart viewport...');
            return this.canvasContainer
                .append('g')
                    .classed('small-multiple-container', true)
                    .attr('transform', `translate(${this.viewModel.layout.x}, ${this.viewModel.layout.y})`)
                    .attr('width', this.viewModel.layout.visualViewport.width)
                    .attr('height', this.viewModel.layout.visualViewport.height);
        }

    /** Determines if the small multiple label is required and adds it to the DOM if so, with specified settings */
        private renderSmallMultipleLabel(element: d3.Selection<SVGGElement, any, any, any>) {
            if (this.settings.heading.show) {
                this.debug.log('Adding small multiple label...');
                element
                    .append('text')
                        .classed('small-multiple-label', true)
                        .attr('x', this.viewModel.label.text.x)
                        .attr('y', this.viewModel.label.text.y)
                        .text((d) => {
                                /** TODO: should map to view model properly */
                                this.viewModel.label.text.properties.text = d.name;
                                return getTailoredTextOrDefault(this.viewModel.label.text.properties, this.viewModel.layout.smallMultipleChartDimensions.width);
                            })
                        .style('text-anchor', this.viewModel.label.textAnchor)
                        .style('dominant-baseline', this.viewModel.label.dominantBaseline)
                        .style('dy', '1em')
                        .style('font-family', this.settings.heading.fontFamily)
                        .style('font-size', `${this.settings.heading.fontSize}pt`)
                        .style('fill', (d) => d.titleColour)
                    .append('title')
                        .text((d) => d.name);
            }
        }

    /** Manages the rendering of measure line and tooltip overlay markers for specified small multiple element */
        private renderSmallMultipleMeasure(element: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>, overlay: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>) {
            let lineGen = this.measureLineGenerator();
            /** We step through in reverse to draw first line last */
                this.viewModel.measureMetadata.slice(0).reverse().map((m, mi) => {
                    let inverse = this.viewModel.measureMetadata.length - 1 - mi;
                    lineGen.curve(d3[`${m.lineShape}`]);
                    this.debug.log(`Plotting line for measure ${m.metadata.displayName}...`);
                    element
                        .append('path')
                            .classed('small-multiple-measure', true)
                            .classed(m.lineStyle, true)
                            .attr('d', (d) => lineGen(d.measures[inverse].values.filter(lineGen.defined())))
                            .attr('transform', 'translate(0, 0)')
                            .style('stroke', m.colour)
                            .style('stroke-linecap', 'round')
                            .style('fill', 'none')
                            .style('stroke-width', m.strokeWidth);

                    /** Tooltip circle marker */
                        overlay
                            .append('circle')
                                .classed('circle-item', true)
                                .attr('r', 3)
                                .attr('fill', (d) => m.colour);
                });
        }

    /** Adds an element to manage plotting measures to the small mutliple */
        private renderSmallMutliplePlotArea(element: d3.Selection<SVGGElement, any, any, any>): d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any> {
            this.debug.log('Adding plot area...');
            return element
                .append('g')
                    .classed('small-multiple-chart-path', true)
                    .attr('clip-path', 'url(#small-multiple-clip)')
                    .attr('transform', `translate(${this.viewModel.layout.smallMultipleMargin.left}, ${this.viewModel.layout.smallMultipleMargin.top})`);
        }

    /** Adds a small multiple row group to the chart viewport */
        private renderSmallMultipleRow(element: d3.Selection<SVGGElement, any, any, any>, row: number): d3.Selection<SVGGElement, any, any, any> {
            this.debug.log('Rendering row group...');
            return element
                .append('g')
                    .classed('small-multiple-row-container', true)
                    .attr('height', this.viewModel.layout.rowDimensions.height)
                    .attr('width', this.viewModel.layout.rowDimensions.width)
                    .attr('transform', `translate(${0}, ${row * this.viewModel.layout.rowDimensions.height})`);
        }

    /** Adds a clipPath to the specified row group element (used to ensure that the chart clips if the Y-axis has been limited, and doesn't exceed
     *  the bounds of the small multiple) */
        private renderSmallMultipleRowClipPath(element: d3.Selection<SVGGElement, any, any, any>) {
            this.debug.log('Setting up clipPath...');
            element.selectAll('defs').remove();
            element
                .append('defs')
                .append('clipPath')
                    .attr('id', 'small-multiple-clip')
                    .style('fill', 'none')
                .append('rect')
                    .attr('width', this.viewModel.layout.smallMultipleChartDimensions.width)
                    .attr('height', this.viewModel.layout.smallMultipleChartDimensions.height);
        }

    /** Adds all main SVG element containers for each small multipe for the specified row group */
        private renderSmallMultiplesForRow(element: d3.Selection<SVGGElement, any, any, any>, row: number): d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any> {
            this.debug.log('Rendering small multiples for row...');
            return element
                .selectAll('svg')
                    .data(this.getSmallMultiplesForRow(row))
                    .enter()
                        .append('svg')
                            .classed('small-multiple', true)
                            .attr('x', (d, i) => i * this.viewModel.layout.smallMultipleXConstant)
                        .append('g')
                            .classed('small-multiple-canvas', true);
        }

    /** Applies border configuration to small multiples y rendering over the top of them (this avoids all kinds of issues
     *  that we had in the initial version, as borders would get clipped inside the main SVG) */
        private renderSmallMultipleBorders(element: d3.Selection<SVGGElement, any, any, any>, row: number) {
            if (this.settings.smallMultiple.border) {
                this.debug.log('Rendering small multiple borders...');
                element
                    .selectAll('.small-multiple-border')
                        .data(this.getSmallMultiplesForRow(row))
                        .enter()
                            .append('g')
                                .classed('small-multiple-border', true)
                            .append('rect')
                                .classed(this.settings.smallMultiple.borderStyle, true)
                                .attr('x', (d, i) => i * this.viewModel.layout.smallMultipleXConstant)
                                .attr('height', this.viewModel.layout.smallMultipleDimensions.height)
                                .attr('width', this.viewModel.layout.smallMultipleDimensions.width)
                                .style('outline-style', this.settings.smallMultiple.border
                                        ?   this.settings.smallMultiple.borderStyle
                                        :   null
                                    )
                                .style('outline-width', `${this.settings.smallMultiple.border
                                        ?   this.settings.smallMultiple.borderStrokeWidth
                                        :   0}px`
                                    )
                                .style('outline-color', this.settings.smallMultiple.border
                                        ?   this.settings.smallMultiple.borderColor
                                        :   null
                                    );
            }

        }

    /** Adds boilerplate overlay to specified small multiple element(s) for tooltip tracking and info */
        private renderSmallMultipleTooltipOverlay(element: d3.Selection<SVGGElement, any, any, any>): d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any> {
            this.debug.log('Adding tooltip overlay...');
            let overlay = element
                .append('g')
                    .classed('small-multiple-tooltip-overlay', true)
                    .attr('transform', `translate(${this.viewModel.layout.smallMultipleMargin.left}, ${this.viewModel.layout.smallMultipleMargin.top})`)
                    .style('display', 'none');
            /** Add a (transparent) rectangle, to track mouse movement */
                overlay
                    .append('rect')
                        .classed('tooltip-canvas', true)
                        .attr('height', this.viewModel.layout.smallMultipleChartDimensions.height)
                        .attr('width', this.viewModel.layout.smallMultipleChartDimensions.width)
                        .style('fill', 'none');
            return overlay;
        }

    /** Adds a line to the specified overlay element, which is used to track mouse position to the nearest category */
        private renderSmallMultipleTooltipMouseLine(element: d3.Selection<SVGGElement, ISmallMultiple, SVGGElement, any>) {
            this.debug.log('Adding tooltip mouse line to overlay...');
            element
                .append('line')
                    .classed('hover-line', true)
                    .attr('y1', 0)
                    .attr('y2', this.viewModel.layout.smallMultipleChartDimensions.height);
        }

    }