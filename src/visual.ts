/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    
    /** powerbi.extensibility.utils.chart.legend */
        import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
        import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
        import Legend = powerbi.extensibility.utils.chart.legend;
        import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
        import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
        import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;

    /** SmallMultipleViewModel */
        import ISmallMultipleMeasure = SmallMultipleLineChartViewModel.ISmallMultipleMeasure;
        import visualTransform = SmallMultipleLineChartViewModel.visualTransform;
        import mapLayout = SmallMultipleLineChartViewModel.mapLayout;

    export class SmallMultipleLineChart implements IVisual {
        private settings: VisualSettings;
        private measureMetadata: ISmallMultipleMeasure[]
        private element: HTMLElement;
        private container: d3.Selection<{}>;
        private chartWrapper: d3.Selection<{}>;
        private host: IVisualHost;
        private viewport: IViewport;
        private legend: ILegend;
        private legendData: LegendData;

        constructor(options: VisualConstructorOptions) {
            options.element.style.overflow = 'auto';

            this.host = options.host;
            this.element = options.element;
            
            /** Visual container */
                this.container = d3.select(options.element)
                    .append('div')
                    .classed('cartesianLineChart', true);

            /** Legend container */
                this.legend = createLegend(
                    options.element,
                    false,
                    null,
                    false,
                    LegendPosition.Top
                );

        }

        public update(options: VisualUpdateOptions) {
            console.clear();
            
            let settings = this.settings = SmallMultipleLineChart.parseSettings(options && options.dataViews && options.dataViews[0]),
                viewModel = visualTransform(options, this.host, this.settings),
                element = this.element;
            this.measureMetadata = viewModel.multiples[0].measures;
            this.viewport = options.viewport;

            /** Construct legend from measures. We need our legend before we can size the rest of the chart, so we'll do this first. */
                this.legendData = {
                    title: (settings.legend.showTitle 
                                ? settings.legend.titleText 
                                    + (settings.legend.includeRanges 
                                        ? ` (${viewModel.layout.xAxis.minValue.textProperties.text} - ${viewModel.layout.xAxis.maxValue.textProperties.text})`
                                        : '' 
                                    )
                                : null
                    ),
                    fontSize: settings.legend.fontSize,
                    labelColor: settings.legend.fontColor,
                    dataPoints: this.measureMetadata.map(function(m, i) {
                        return {
                            label: m.name,
                            color: m.color,
                            icon: LegendIcon.Circle,
                            selected: false,
                            identity: m.selectionId
                        }
                    })
                }
                this.renderLegend();

            /** Complete mapping our view model layout */
                viewModel = mapLayout(options, this.settings, viewModel)
            
            /** For debugging purposes - remove later on */
                if (settings.debug.show) {
                    // console.clear();
                    console.log('Visual update', options, '\nView model', viewModel, '\nSettings', settings);
                }

            /** Clear down our existing plot data as we need to re-draw the whole thing */
                this.container.selectAll('*').remove();
                
            /** Calculate all necessary dimensions for components */

                /** Size our initial container to match the viewport */
                    this.container.attr({
                        width: viewModel.layout.chart.width,
                        height: viewModel.layout.chart.height,
                    });

                /** Resolve our number of columns, based on configuration and calculate how much space we have available for each small multiple */

                    /** TODO: at this point, we should determine if we need to overflow, based on minimum height, which we will need to also work out
                     * in accordance with height reserved for the multiple text
                     */

                    /** Debugging stuff for grid dimensions */
                    if (settings.debug.show) {
                        console.log(`Grid:\n`,
                            `Viewport Width: ${options.viewport.width}\n`,
                            `Viewport Height: ${options.viewport.height}\n`,
                            `Y-Axis Label Width: ${viewModel.layout.yAxis.width}\n`,
                            `Width Available for Multiples: ${viewModel.layout.multiples.rows.width}\n`,
                            `Height Available for Multiples: ${viewModel.layout.multiples.availableHeight}\n`,
                            `Multiple Count: ${viewModel.layout.multiples.count}\n`,
                            `Multiple Columns Per Row: ${viewModel.layout.multiples.columns.count}\n`,
                            `Multiple Columns Individual Width: ${viewModel.layout.multiples.columns.width}\n`,
                            `Required Multiple Rows: ${viewModel.layout.multiples.rows.count}\n`,
                            `Multiple Rows Individual Height: ${viewModel.layout.multiples.rows.height}\n`,
                            `Multiple Label Height: ${viewModel.layout.multiples.label.height}\n`,
                        );
                    }

            /** Draw our grid by applying our SVG elements based on our configuration */

                /** Y-axis setup */

                    /** Scaling */                            
                        let yScale = d3.scale.linear()
                            .domain(viewModel.layout.yAxis.domain)
                            .range(viewModel.layout.yAxis.range)
                            .nice(viewModel.layout.yAxis.ticks);

                    /** Ticks and labels */
                        let yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(viewModel.layout.yAxis.ticks)
                            .tickFormat(d => (viewModel.layout.yAxis.numberFormat.format(d)))
                            .tickSize(-viewModel.layout.multiples.rows.width, 0);

                /** X-axis setup */

                    /** Scaling */
                        let xScale = d3.scale.linear()
                            .domain(viewModel.layout.xAxis.domain)
                            .rangeRound(viewModel.layout.xAxis.range);
                    
                    /** Pass the scale to our utils module for reuse in the chart */
                        smallMultipleLineChartUtils.xScale = xScale;

                /** Line series generation function */
                    let lineGen = d3.svg.line<SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint>()
                        .x(function(d) { 
                            return xScale(d.name); 
                        })
                        .y(function(d) { 
                            return yScale(d.value); 
                        });

                /** Assign tooltip service wrapper to utility module */
                    smallMultipleLineChartUtils.tooltipService = this.host.tooltipService;

                /** Create as many rows as we need for our multiples based on the configuration of how manay we want per row */
                    for(let i = 0, len = viewModel.layout.multiples.rows.count; i < len; i++) {

                        /** We can filter the source data when drawing but this creates empty elements; this step creates a subset of our
                         *  data for the row in question
                         */
                            let eligibleMultipleFacets: SmallMultipleLineChartViewModel.ISmallMultipleData[] = viewModel.multiples.map(function(o) {
                                return o;
                            }).slice(i * viewModel.layout.multiples.columns.count, (i * viewModel.layout.multiples.columns.count) + viewModel.layout.multiples.columns.count);
                
                        /** Container for entire row of multiples */
                            let multipleRow = this.container
                                .append('svg')
                                    .classed({
                                        smallMultipleRowContainer: true
                                    })
                                    .attr({
                                        height: viewModel.layout.multiples.rows.height,
                                        width: viewModel.layout.chart.width
                                    })
                                    .style({
                                        'padding-bottom': viewModel.layout.multiples.rows.spacing
                                    });

                        /** Definition for clip container */
                            d3.select('.smallMultipleRowContainer')
                                .append('defs')
                                    .append('clipPath')
                                        .attr({
                                            id: 'multiple-clip'
                                        })
                                        .classed({
                                            'multipleClip': true
                                        })
                                        .append('rect')
                                            .attr({
                                                width: viewModel.layout.multiples.columns.width,
                                                height: viewModel.layout.yAxis.height,
                                                transform: viewModel.layout.multiples.translate
                                            });   

                        /** If we've determined that a Y-axis is required, add it in */
                            if(settings.yAxis.show) {
                                let axisContainer = multipleRow
                                    .append('g')
                                        .classed({
                                            yAxisContainer: true
                                        })
                                        .style({
                                            'font-size': viewModel.layout.yAxis.maxValue.textProperties.fontSize,
                                            'font-family': settings.yAxis.fontFamily,
                                            'fill': settings.yAxis.fontColor,
                                            'stroke-width' : 1 /** TODO: Config */
                                        });

                                let axisTicks = axisContainer
                                    .append('g')
                                        .classed({
                                            'grid': true
                                        })
                                        .call(yAxis)
                                        .attr({
                                            transform: function(d) {
                                                return `translate(${viewModel.layout.yAxis.width}, 0)`;
                                            }
                                        });

                                /** This prevents fuzzing of the text if we have gridlines */
                                    axisTicks.selectAll('text')
                                        .style({
                                            'stroke': 'none'
                                        });
                                
                                /** Apply gridline styling; there's probably a better way to do it, particularly with the stroke line styles ... */
                                    axisTicks.selectAll('line')
                                        .attr({
                                            stroke: settings.yAxis.gridlineColor,
                                            'stroke-width': settings.yAxis.gridlines
                                                ? settings.yAxis.gridlineStrokeWidth 
                                                : 0
                                        })
                                        .classed(settings.yAxis.gridlineStrokeLineStyle, true);

                                /** Add axis title */
                                    if (settings.yAxis.showTitle) {
                                        axisContainer
                                        .append('text')
                                        .attr({
                                            transform: 'rotate(-90)',
                                            y: viewModel.layout.yAxis.title.y,
                                            x: viewModel.layout.yAxis.title.x,
                                            dy: '1em'
                                        })
                                        .style({
                                            'text-anchor': 'middle',
                                            'font-size': viewModel.layout.yAxis.title.textProperties.fontSize,
                                            'font-family': settings.yAxis.titleFontFamily,
                                            'fill': settings.yAxis.titleColor,
                                        })
                                        .text(viewModel.layout.yAxis.title.textProperties.text);
                                    }
                            }

                        /** Add group elements for each multiple, and translate based on Y-axis configuration */
                            let multiple = multipleRow.selectAll('.lineChartSmallMultiple')
                                .data(eligibleMultipleFacets)
                                .enter()
                                .append('g')
                                    .classed({
                                        lineChartSmallMultiple: true                                        
                                    })
                                    .attr({
                                        transform: function(d, i) {
                                            return `translate(${(i * viewModel.layout.multiples.columns.width) + viewModel.layout.yAxis.width}, ${0})`;
                                        }
                                    });

                            /** Multiple background */
                                multiple
                                    .append('rect')
                                        .classed({
                                            multipleBackground: true,
                                        })
                                        .classed(settings.smallMultiple.borderStyle, true)
                                        .attr({
                                            height: viewModel.layout.multiples.rows.height,
                                            width: viewModel.layout.multiples.columns.width,
                                            fill: function(d, i) {
                                                return i % 2 && settings.smallMultiple.bandedMultiples 
                                                    ? settings.smallMultiple.backgroundColorAlternate 
                                                    : !settings.smallMultiple.backgroundColor 
                                                        ? 'transparent' 
                                                        : settings.smallMultiple.backgroundColor;
                                            },
                                            'fill-opacity': 1 - (settings.smallMultiple.backgroundTransparency / 100),
                                            stroke: settings.smallMultiple.border 
                                                ? settings.smallMultiple.borderColor
                                                : null,
                                            'stroke-width': viewModel.layout.multiples.borderStrokeWidth
                                        });

                            /** Canvas for lines and points this will overlay the clip-path */
                                let canvas = multiple
                                    .append('g')
                                        .classed({
                                            multipleCanvas: true
                                        })
                                        .attr('clip-path', 'url(#multiple-clip)');                              

                            /** Add container to multiple, specifically to manage interaction */
                                let overlay = canvas
                                    .append('rect')
                                        .classed({
                                            overlay: true
                                        })
                                        .attr({
                                            width: viewModel.layout.xAxis.width,
                                            height: viewModel.layout.yAxis.height,
                                            transform: viewModel.layout.multiples.translate
                                        });

                            /** Add stuff for each measure */

                                /** Container for line plot(s) */
                                    let paths = canvas
                                        .append('g')
                                            .classed({
                                                pathContainer: true
                                            })
                                            .attr({
                                                id: 'multiple-clip'
                                            });

                                /** Container for tooltip nodes */
                                    let focus = canvas
                                        .append('g')
                                            .classed( {
                                                tooltipFocus: true
                                            })
                                            .style({
                                                display: 'none' 
                                            });                                    

                                /** For each measure, add a line plot and a tooltip node */
                                    this.measureMetadata.map(function(measure, measureIndex) {
                                        paths
                                            .append('path')
                                                .classed({
                                                    lineSeries: true /** TODO: May need to change this when multiple measures are introduced */
                                                })
                                                .attr({
                                                    d: function(d) {
                                                        return lineGen(d.measures[measureIndex].categoryData);
                                                    },
                                                    transform: 'translate(0, 0)',
                                                    stroke: measure.color
                                                });

                                        focus
                                            .append('circle')
                                                .attr({
                                                    'r': 3,
                                                    fill: function(d) {
                                                        return d.measures[measureIndex].color;
                                                    }
                                                });
                                    });

                                /** Add events to the multiple container */
                                    overlay
                                        /** Upon entry, display the line nodes */
                                            .on("mouseover", function() { 
                                                let selectedFocus = d3.select(this.parentNode).select('.tooltipFocus'),
                                                    mouse = d3.mouse(element),
                                                    dataPoints = smallMultipleLineChartUtils.getHighlightedDataPoints(this);

                                                    selectedFocus.style('display', null);

                                                    smallMultipleLineChartUtils.tooltipService.show({
                                                        dataItems: smallMultipleLineChartUtils.getTooltipData(dataPoints),
                                                        identities: [],
                                                        coordinates: [mouse[0], mouse[1]],
                                                        isTouchEvent: false
                                                    });
                                            })
                                        /** Upon exit, hide the line nodes */
                                            .on("mouseout", function() { 
                                                let selectedFocus = d3.select(this.parentNode).select('.tooltipFocus');
                                                selectedFocus.style('display', 'none');
                                                smallMultipleLineChartUtils.tooltipService.hide({
                                                    immediately: true,
                                                    isTouchEvent: false
                                                });
                                            })
                                        /** When mouse is moved, calculate node position for tooltips */
                                            .on('mousemove', function(d) {
                                                let dataPoints = smallMultipleLineChartUtils.getHighlightedDataPoints(this),
                                                    mouse = d3.mouse(element);

                                                focus.selectAll('circle')
                                                    .attr({
                                                        transform: function(d, j) {
                                                            return `translate(${xScale(dataPoints[j].name)}, ${yScale(dataPoints[j].value)})`;
                                                        }
                                                    });

                                                smallMultipleLineChartUtils.tooltipService.move({
                                                    dataItems: smallMultipleLineChartUtils.getTooltipData(dataPoints),
                                                    identities: [],
                                                    coordinates: [mouse[0], mouse[1]],
                                                    isTouchEvent: false
                                                });
                                            });

                            /** Apply our text label */
                                if(settings.smallMultiple.showMultipleLabel) {
                                    multiple
                                        .append('text')
                                            .classed({
                                                smallMultipleLabel: true
                                            })
                                            .attr({
                                                x: viewModel.layout.multiples.label.x,
                                                y: viewModel.layout.multiples.label.y,
                                                'text-anchor': viewModel.layout.multiples.label.textAnchor,
                                                'alignment-baseline': 'text-after-edge'
                                            })
                                            .style({
                                                'font-size': viewModel.layout.multiples.label.textProperties.fontSize,
                                                'font-family': settings.smallMultiple.fontFamily,
                                                fill: function(d, i) {
                                                    return i % 2 && settings.smallMultiple.bandedMultiples 
                                                        ? settings.smallMultiple.fontColorAlternate 
                                                        : settings.smallMultiple.fontColor;
                                                }
                                            })
                                            .text(function(d) {
                                                return d.name;
                                            })
                                            .each(function() {
                                                var self = d3.select(this),
                                                    textLength = textMeasurementService.measureSvgTextWidth(
                                                        viewModel.layout.multiples.label.textProperties,
                                                        self.text()
                                                    ),
                                                    text = self.text();
                                                while (textLength > (viewModel.layout.xAxis.width) && text.length > 0) {
                                                    text = text.slice(0, -1);
                                                    self.text(text + '\u2026');
                                                    textLength = textLength = textMeasurementService.measureSvgTextWidth(
                                                        viewModel.layout.multiples.label.textProperties,
                                                        self.text()
                                                    );
                                                }
                                            });
                                }
                    }

            console.log('We did it!');
        }

        /** Renders the legend, based on the properties supplied in the update method */
        private renderLegend(): void {
            if (!this.measureMetadata) {
                return;
            }

            const position: LegendPosition = this.settings.legend.show
                ? LegendPosition[this.settings.legend.position]
                : LegendPosition.None;

            this.legend.changeOrientation(position);
            this.legend.drawLegend(this.legendData, JSON.parse(JSON.stringify(this.viewport)));
            Legend.positionChartArea(this.container, this.legend);

            /** Adjust to viewport to match the legend orientation */
                switch (this.legend.getOrientation()) {
                    case LegendPosition.Left:
                    case LegendPosition.LeftCenter:
                    case LegendPosition.Right:
                    case LegendPosition.RightCenter:
                        this.viewport.width -= this.legend.getMargins().width;
                        break;
                    case LegendPosition.Top:
                    case LegendPosition.TopCenter:
                    case LegendPosition.Bottom:
                    case LegendPosition.BottomCenter:
                        this.viewport.height -= this.legend.getMargins().height;
                        break;
                }
        }
        
        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            const instances: VisualObjectInstance[] = (VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options) as VisualObjectInstanceEnumerationObject).instances;
            let objectName = options.objectName;
            
            switch (objectName) {
                case 'yAxis': {
                    /** Gridline toggle */
                    if (!this.settings.yAxis.gridlines) {
                        delete instances[0].properties['gridlineColor'];
                        delete instances[0].properties['gridlineStrokeWidth'];
                        delete instances[0].properties['gridlineStrokeLineStyle'];
                    }
                    /** Title toggle */
                    if (!this.settings.yAxis.showTitle) {
                        delete instances[0].properties['titleStyle'];
                        delete instances[0].properties['titleColor'];
                        delete instances[0].properties['titleText'];
                        delete instances[0].properties['titleFontSize'];
                        delete instances[0].properties['titleFontFamily'];
                    }
                    /** Title style toggle if units are none */
                    if (this.settings.yAxis.labelDisplayUnits == 1) {
                        instances[0].properties['titleStyle'] = 'title'; /** TODO: Delete entries from list */
                    }
                    break;
                }
                case 'smallMultiple': {
                    /** Small multiple label toggle */
                    if(!this.settings.smallMultiple.showMultipleLabel) {
                        delete instances[0].properties['fontColor'];
                        delete instances[0].properties['fontSize'];
                        delete instances[0].properties['fontFamily'];
                        delete instances[0].properties['labelPosition'];
                        delete instances[0].properties['labelAlignment'];
                    }
                    /** Add padding between rows if we specify multiples per row */
                    if(!this.settings.smallMultiple.maximumMultiplesPerRow) {
                        delete instances[0].properties['spacingBetweenRows'];
                    }
                    /** Range validation on multiple spacing */
                    if(this.settings.smallMultiple.maximumMultiplesPerRow && this.settings.smallMultiple.spacingBetweenRows) {
                        instances[0].properties['spacingBetweenRows'] = Math.min(this.viewModel.layout.padding.smallMultipleMaximums.bottom, Math.max(0, this.settings.smallMultiple.spacingBetweenRows));
                    }
                    /** Banded multiples toggle */
                    if(!this.settings.smallMultiple.bandedMultiples) {
                        delete instances[0].properties['fontColorAlternate'];
                        delete instances[0].properties['backgroundColorAlternate'];
                    }
                    /** Border toggle */
                    if(!this.settings.smallMultiple.border) {
                        delete instances[0].properties['borderColor'];
                        delete instances[0].properties['borderStrokeWidth'];
                        delete instances[0].properties['borderStyle'];
                    }
                    break;
                }
                case 'legend': {
                    /** Legend title toggle */
                    if(!this.settings.legend.showTitle) {
                        delete instances[0].properties['titleText'];
                        delete instances[0].properties['includeRanges'];
                    }
                    break;
                }
                case 'colorSelector': {
                    /** Enumerate measures and create colour pickers */
                    for (let measure of this.measureMetadata) {
                        instances.push({
                            objectName: objectName,
                            displayName: measure.name,
                            properties: {
                                fill: {
                                    solid: {
                                        color: measure.color
                                    }
                                }
                            },
                            selector: {
                                metadata: measure.queryName
                            }
                        });
                    }
                    break;
                }
            }
            return instances;
        }
    }
}