/*
 *  Power BI Small Multiple Line Chart
 *
 *  Copyright (c) Daniel Marsh-Patrick
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
    'use strict';
    
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
                        .classed('smallMultipleLineChart', true);

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
            let settings = this.settings = SmallMultipleLineChart.parseSettings(options && options.dataViews && options.dataViews[0]),
                element = this.element,
                viewModel = visualTransform(options, this.host, settings)
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
                viewModel = mapLayout(options, this.settings, viewModel);
            
            /** For debugging purposes - remove later on */
                if (settings.debug.show) {
                    console.clear();
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
                    
                /** Pass the x-scale to our utils module for reuse in the chart */
                    smallMultipleLineChartUtils.xScale = viewModel.layout.xAxis.scale;

                /** Line series generation function */
                    let lineGen = d3.svg.line<SmallMultipleLineChartViewModel.ISmallMultipleCategoryDataPoint>()
                        .x(function(d) { 
                            return viewModel.layout.xAxis.scale(d.name); 
                        })
                        .y(function(d) { 
                            return viewModel.layout.yAxis.scale(d.value); 
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

                        /** If we've determined that a Y-axis is required, add it in at the start of the row */
                            if (settings.yAxis.show) {
                                smallMultipleLineChartUtils.renderAxis(
                                    multipleRow,
                                    settings,
                                    viewModel,
                                    'yAxisRow',
                                    'yAxis'
                                );
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
                                            let xOffset = (i * (viewModel.layout.multiples.columns.width + viewModel.layout.multiples.columns.spacing))
                                                            + viewModel.layout.yAxisRow.width
                                            return `translate(${xOffset}, ${0})`;
                                        }
                                    });

                            /** Separate y-axis tick lines, if required */
                                if (settings.yAxis.show) {
                                    smallMultipleLineChartUtils.renderAxis(
                                        multiple,
                                        settings,
                                        viewModel,
                                        'yAxis',
                                        'yAxis'
                                    );
                                }

                            /** Internal x-axis, if needed */
                                if (settings.xAxis.show) {
                                    smallMultipleLineChartUtils.renderAxis(
                                        multiple,
                                        settings,
                                        viewModel,
                                        'xAxis',
                                        'xAxis'
                                    );
                                }

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
                                            .on('mouseover', function() { 
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
                                            .on('mouseout', function() { 
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
                                                            return `translate(${viewModel.layout.xAxis.scale(dataPoints[j].name)}, ${viewModel.layout.yAxis.scale(dataPoints[j].value)})`;
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
                                if (settings.smallMultiple.showMultipleLabel) {
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
                                                smallMultipleLineChartUtils.wrapText(
                                                    d3.select(this),
                                                    viewModel.layout.multiples.label.textProperties,
                                                    viewModel.layout.xAxis.width
                                                );
                                            });
                                }
                    }

                /** If we need an x-axis for our columns, let's render it */
                    if (settings.xAxis.show) {

                        /** Containing SVG element */
                            let xAxisRow = this.container
                                .append('svg')
                                    .classed({
                                        smallMultipleColumnAxisContainer: true
                                    })
                                    .attr({
                                        width: viewModel.layout.chart.width
                                    });

                        /** Add one axis per column */
                            for (let x=0; x < viewModel.layout.multiples.columns.count; x++) {

                                /** We're not using a conventional d3 axis for our column axis, so we'll produce our own containing element for the stuff we want to draw */
                                    let xAxisContainer = xAxisRow
                                        .append('g')
                                            .classed({
                                                smallMultipleColumnAxis: true
                                            })
                                            .attr({
                                                transform: `translate(${(x * (viewModel.layout.multiples.columns.width + viewModel.layout.multiples.columns.spacing)) + viewModel.layout.yAxisRow.width}, ${0})`
                                            })
                                            .style({
                                                'font-size': viewModel.layout.xAxisColumn.maxValue.textProperties.fontSize,
                                                'font-family': settings.xAxis.fontFamily,
                                                'fill': settings.xAxis.fontColor
                                            });

                                /** If we need axis lines, render them */
                                    if (settings.xAxis.showAxisLine) {
                                        let top = viewModel.layout.xAxisColumn.line.top,
                                            bottom = viewModel.layout.xAxisColumn.line.top + viewModel.layout.xAxisColumn.line.tickMarkLength,
                                            width = viewModel.layout.multiples.columns.width;

                                        xAxisContainer
                                            .append('polyline')
                                                .attr({
                                                    points: `0,${bottom} 0,${top} ${width},${top} ${width},${bottom}`
                                                })
                                                .style({
                                                    stroke: settings.xAxis.axisLineColor,
                                                    fill: 'none',
                                                    'stroke-width': settings.xAxis.axisLineStrokeWidth,
                                                    'stroke-linecap': 'butt',
                                                    'stroke-linejoin': 'miter'
                                                });
                                    }

                                /** Add min/max labels at left/right extremes */
                                    smallMultipleLineChartUtils.addXAxisLabel(
                                        xAxisContainer, viewModel, 'xAxisColumn', 'minValue', 'start'
                                    );
                                    smallMultipleLineChartUtils.addXAxisLabel(
                                        xAxisContainer, viewModel, 'xAxisColumn', 'maxValue', 'end'
                                    );
                            }

                            /** Add title, if requested */
                                if (settings.xAxis.showTitle) {
                                    xAxisRow
                                        .append('text')
                                            .attr({
                                                x: viewModel.layout.multiples.rows.width / 2,
                                                y: viewModel.layout.xAxisColumn.height,
                                                'text-anchor': 'middle',
                                                'alignment-baseline': 'text-after-edge'
                                            })
                                            .style({
                                                'font-size': viewModel.layout.xAxisColumn.title.textProperties.fontSize,
                                                'font-family': settings.xAxis.titleFontFamily,
                                                'fill': settings.xAxis.titleColor
                                            })
                                            .text(viewModel.layout.xAxisColumn.title.textProperties.text)
                                            .each(function() {
                                                smallMultipleLineChartUtils.wrapText(
                                                    d3.select(this),
                                                    viewModel.layout.xAxisColumn.title.textProperties,
                                                    viewModel.layout.multiples.rows.width
                                                );
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
                    /** Label toggle */
                    if (!this.settings.yAxis.showLabels) {
                        delete instances[0].properties['fontColor'];
                        delete instances[0].properties['fontSize'];
                        delete instances[0].properties['fontFamily'];
                        delete instances[0].properties['labelDisplayUnits'];
                        delete instances[0].properties['precision'];
                    }                    
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
                case 'xAxis': {
                    /** Label toggle */
                    if (!this.settings.xAxis.showLabels) {
                        delete instances[0].properties['fontColor'];
                        delete instances[0].properties['fontSize'];
                        delete instances[0].properties['fontFamily'];
                    }
                    /** Gridline toggle */
                    if (!this.settings.xAxis.gridlines) {
                        delete instances[0].properties['gridlineColor'];
                        delete instances[0].properties['gridlineStrokeWidth'];
                        delete instances[0].properties['gridlineStrokeLineStyle'];
                    }
                    /** Title toggle */
                    if (!this.settings.xAxis.showTitle) {
                        delete instances[0].properties['titleColor'];
                        delete instances[0].properties['titleText'];
                        delete instances[0].properties['titleFontSize'];
                        delete instances[0].properties['titleFontFamily'];
                    }
                    /** Axis line toggle */
                    if (!this.settings.xAxis.showAxisLine) {
                        delete instances[0].properties['axisLineColor'];
                        delete instances[0].properties['axisLineStrokeWidth'];
                    }
                    /** Range validation on axis line stroke width */
                    instances[0].validValues
                    instances[0].validValues = instances[0].validValues || {};
                    instances[0].validValues.axisLineStrokeWidth = {
                        numberRange: {
                            min: 1,
                            max: 5
                        },
                    };
                    break;
                }
                case 'smallMultiple': {
                    /** Small multiple label toggle */
                    if (!this.settings.smallMultiple.showMultipleLabel) {
                        delete instances[0].properties['fontColor'];
                        delete instances[0].properties['fontSize'];
                        delete instances[0].properties['fontFamily'];
                        delete instances[0].properties['labelPosition'];
                        delete instances[0].properties['labelAlignment'];
                    }
                    /** Range validation on multiple column spacing and row spacing */
                    instances[0].validValues
                    instances[0].validValues = instances[0].validValues || {};
                    instances[0].validValues.spacingBetweenColumns = {
                        numberRange: {
                            min: 0,
                            max: 20
                        },
                    };
                    instances[0].validValues.spacingBetweenRows = {
                        numberRange: {
                            min: 0,
                            max: 20
                        }
                    };
                    /** Add padding between rows if we specify multiples per row */
                    if (!this.settings.smallMultiple.maximumMultiplesPerRow) {
                        delete instances[0].properties['spacingBetweenRows'];
                    }
                    /** Banded multiples toggle */
                    if (!this.settings.smallMultiple.bandedMultiples) {
                        delete instances[0].properties['fontColorAlternate'];
                        delete instances[0].properties['backgroundColorAlternate'];
                    }
                    /** Border toggle */
                    if (!this.settings.smallMultiple.border) {
                        delete instances[0].properties['borderColor'];
                        delete instances[0].properties['borderStrokeWidth'];
                        delete instances[0].properties['borderStyle'];
                    }
                    break;
                }
                case 'legend': {
                    /** Legend title toggle */
                    if (!this.settings.legend.showTitle) {
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