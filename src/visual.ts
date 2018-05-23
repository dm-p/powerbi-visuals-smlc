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
    
    import axisHelper = powerbi.extensibility.utils.chart.axis;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import ISelectionId = powerbi.visuals.ISelectionId;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import createTooltipServiceWrapper = powerbi.extensibility.utils.tooltip.createTooltipServiceWrapper;
        
    /**
     * Function that converts queried data into a view model that will be used by the visual
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     * @param {IVisualHost} host            - Contains references to the host which contains services
     */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): LineChartSmallMultipleViewModel {
        let dataViews = options.dataViews;

        // /* Instantiate empty model, just in case we have nothing supplied to our visual */
        let viewModel: LineChartSmallMultipleViewModel = {
            multiples: [],
            yMax: 0,
            yMin: 0,
            xMax: 0,
            xMin: 0
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].matrix
            || !dataViews[0].matrix.columns
            || !dataViews[0].matrix.rows
            || !dataViews[0].matrix.valueSources
            || !dataViews[0].metadata
        ) {
            return viewModel;
        }

        let matrix = dataViews[0].matrix;
        let columns = dataViews[0].matrix.columns;
        let rows = dataViews[0].matrix.rows;
        let valueSources = dataViews[0].matrix.valueSources;
        let metadata = dataViews[0].metadata;
        let smallMultipleFacetMetadata = metadata.columns.filter(c => c.roles['smallMultiple'])[0];
        let categoryMetadata = metadata.columns.filter(c => c.roles['category'])[0];

        let colorPalette: IColorPalette = host.colorPalette;
        let lineChartSmallMultiples: LineChartSeriesSmallMultiple[] = []
        let yMax: number = 0;
        let yMin: number = 0;
        let xMax: number;
        let xMin: number;

        // TODO: We might be able to do this better now that we know how to traverse metadata (see smallMultipleFacetName etc.)
        let multiples = columns.root.children.map(function(multiple, multipleIndex) {
            lineChartSmallMultiples.push({
                facet: multiple.value.toString(),
                measures: valueSources.map(function(measure, measureIndex) {
                    /** Obtain the default colour based on the measure */
                        let defaultColor: Fill = {
                            solid: {
                                color: colorPalette.getColor(measure.displayName + '').value
                            }
                        };
                    /** Get measure metadata from datview, so we can do formatting etc. later on */
                        let measureMetadata = valueSources[measureIndex];
                    return {                        
                        name: measure.displayName,
                        queryName: measureMetadata.queryName,
                        categories: rows.root.children.map(function(category, categoryIndex) {
                            let targetKey = multipleIndex * valueSources.length + measureIndex
                            let categoryValue = <number>category.value; //TODO: This should manage different types
                            let value = <number>category.values[targetKey].value; // TODO: Manage data types for measure
                            /** Get highest/lowest x/y values; TODO: handle categorical vs. continuous for x */
                                yMax = Math.max(isNaN(yMax) ? value : yMax, value);
                                yMin = Math.min(isNaN(yMin) ? value : yMin, value);
                                xMax = Math.max(isNaN(xMax) ? categoryValue: xMax, categoryValue);
                                xMin = Math.min(isNaN(xMin) ? categoryValue: xMin, categoryValue);
                            return {
                                name: categoryValue,
                                value: value,
                                tooltips: [
                                    {
                                        header: `${multiple.value} - ${valueFormatter.format(category.value, categoryMetadata.format)}`,
                                        displayName: measureMetadata.displayName,
                                        value: `${valueFormatter.format(value, measureMetadata.format)}`,
                                        color: smallMultipleLineChartUtils.getValue<Fill>(valueSources[measureIndex].objects, 'colorSelector', 'fill', defaultColor).solid.color
                                    }
                                ]
                            }   
                        }),
                        color: smallMultipleLineChartUtils.getValue<Fill>(valueSources[measureIndex].objects, 'colorSelector', 'fill', defaultColor).solid.color
                    }
                })
            })
        });

        return {
            multiples: lineChartSmallMultiples,
            yMax: yMax,
            yMin: yMin,
            xMax: xMax,
            xMin: xMin
        };

    }

    export class SmallMultipleLineChart implements IVisual {
        private settings: VisualSettings;
        private measures: LineChartSeriesSmallMultipleMeasure[]
        private element: HTMLElement;
        private svg: d3.Selection<SVGElement>;
        private div: d3.Selection<HTMLElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;

        static Config = {
            chartAreaPadding: {
                top: 5,
                right: 10,
                bottom: 10,
                left: 10,
            },
            chartSeriesPadding: {
                left: 2,
                right: 2
            }
        };

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.element = options.element;
            options.element.style.overflow = 'auto';

            // TODO: selectionManager
            
            this.svg = d3.select(options.element)
                .append('div')
                .classed('cartesianLineChart', true);

        }

        public update(options: VisualUpdateOptions) {
            let viewModel: LineChartSmallMultipleViewModel = visualTransform(options, this.host);
            let dataView: DataView = options.dataViews[0];
            let settings = this.settings = SmallMultipleLineChart.parseSettings(options && options.dataViews && options.dataViews[0]);
            let element = this.element;
            this.measures = viewModel.multiples[0].measures;
            
            /** For debugging purposes - remove later on */
                if (settings.debug.show) {
                    console.clear();
                    console.log('Visual update', options, 'View model', viewModel, 'Settings', settings);
                }
                
            /** Clear down our existing plot data as we need to re-draw the whole thing */
                this.svg.selectAll('*').remove();

            /** We need to start figuring things out in terms of layout:
             *  - Determine if we need a y-axis and calculate how much space we'll need, based on the axis number format.
             *  - Get the minimum/maximum multiple sizes 
             *  - Get other dimensions as required for drawing our charts 
             * 
             *  TODO: This could probably be done in a view model or the configuration view model
             */
                
                /** Get the viewport dimensions and cater for padding */
                    let entireChartWidth = options.viewport.width;
                    let entireChartHeight = options.viewport.height;
                
                /** Work out the horizontal space that a y-axis would take, based on our configuration, and we might as well prep it while we're at it... */
                    if(settings.yAxis.show) {
                        settings.yAxis.numberFormat = valueFormatter.create({
                            format: valueFormatter.getFormatStringByColumn(dataView.metadata.columns[2]),
                            value : (settings.yAxis.labelDisplayUnits == 0 
                                ? viewModel.yMax
                                : settings.yAxis.labelDisplayUnits
                            ),
                            precision: (settings.yAxis.precision != null
                                ? settings.yAxis.precision
                                : null
                            )
                        });

                        if (settings.debug.show) {
                            console.log('Formatter:', settings.yAxis.numberFormat);
                        }

                        let yAxisTextPropertiesMin: TextProperties = {
                            text: settings.yAxis.numberFormat.format(viewModel.yMin),
                            fontFamily: `${settings.yAxis.fontFamily}`,
                            fontSize: `${settings.yAxis.fontSize}px`
                        };
    
                        let yAxisTextPropertiesMax: TextProperties = {
                            text: settings.yAxis.numberFormat.format(viewModel.yMax),
                            fontFamily: `${settings.yAxis.fontFamily}`,
                            fontSize: `${settings.yAxis.fontSize}px`
                        };
            
                        settings.yAxis.width = Math.round(
                                Math.max(
                                    textMeasurementService.measureSvgTextWidth(yAxisTextPropertiesMin),
                                    textMeasurementService.measureSvgTextWidth(yAxisTextPropertiesMax)
                                )
                            ) + 10;
                    } else {
                         settings.yAxis.width = 0;
                    }

                /** Work out the vertical space that the small multiple would take up, based on font configuration */
                    if(settings.smallMultiple.showMultipleLabel) {
                        let smallMultipleTextProperties: TextProperties = {
                            text: dataView.categorical.categories[0].values[0].toString(),
                            fontFamily: `${settings.smallMultiple.fontFamily}`,
                            fontSize: `${settings.smallMultiple.fontSize}px`
                        }
                        settings.smallMultiple.labelHeight = textMeasurementService.measureSvgTextHeight(smallMultipleTextProperties);
                    } else {
                        settings.smallMultiple.labelHeight = 0;
                    }

                /** Size our initial container to match the viewport */
                    this.svg.attr({
                        width: entireChartWidth,
                        height: entireChartHeight
                    });

                /** Calculate our row width, after the Y-Axis has been taken into consideration */
                    let multipleAvailableRowWidth: number = entireChartWidth - settings.yAxis.width; // TODO: I've hardcoded enough space for a scrolbar for now; fix when we determine overflow

                /** And the height for the whole chart, as we might need to overflow based on configuration. This is abstracted as we might
                    want to pad it later on and this will make it easier. */
                    let multipleAvailableChartHeight: number = entireChartHeight;

                /** Resolve our number of columns, based on configuration and calculate how much space we have available for each small multiple */
                    let multipleCount: number = viewModel.multiples.length,
                        multipleColumns: number,
                        multipleIndividualWidth: number,
                        multipleRows: number,
                        multipleIndividualRowHeight: number;

                    if (!settings.smallMultiple.maximumMultiplesPerRow
                        || settings.smallMultiple.maximumMultiplesPerRow > multipleCount
                    ) {
                        multipleColumns = multipleCount
                    } else {
                        multipleColumns = settings.smallMultiple.maximumMultiplesPerRow
                    }

                    multipleIndividualWidth = multipleAvailableRowWidth / multipleColumns;
                    multipleRows = Math.ceil(multipleCount / multipleColumns);

                    multipleIndividualRowHeight = Math.floor(multipleAvailableChartHeight / multipleRows) - 4; /* TODO: This -4 deals with arbitrary overflow; needs fixing properly once we introduce padding etc. */

                    /** TODO: at this point, we should determine if we need to overflow, based on minimum height, which we will need to also work out
                     * in accordance with height reserved for the multiple text
                     */

                    /** Debugging stuff for grid dimensions */
                    if (settings.debug.show) {
                        console.log(`Grid:\n`,
                            `Viewport Width: ${entireChartWidth}\n`,
                            `Y-Axis Label Width: ${settings.yAxis.width}\n`,
                            `Width Available for Multiples: ${multipleAvailableRowWidth}\n`,
                            `Height Available for Multiples: ${multipleAvailableChartHeight}\n`,
                            `Multiple Count: ${multipleCount}\n`,
                            `Multiple Columns Per Row: ${multipleColumns}\n`,
                            `Multiple Columns Individual Width: ${multipleIndividualWidth}\n`,
                            `Required Multiple Rows: ${multipleRows}\n`,
                            `Multiple Rows Individual Height: ${multipleIndividualRowHeight}\n`,
                            `Multiple Label Height: ${settings.smallMultiple.labelHeight}\n`,
                        );
                    }

            /** Draw our grid by applying our SVG elements based on our configuration */

                /** Y-axis setup */

                    /** Scaling */
                        let yScale = d3.scale.linear()
                        .domain([
                            settings.yAxis.start != null ? settings.yAxis.start : viewModel.yMin, 
                            settings.yAxis.end != null ? settings.yAxis.end : viewModel.yMax, 
                        ])
                        .range([
                            multipleIndividualRowHeight - settings.smallMultiple.labelHeight - SmallMultipleLineChart.Config.chartAreaPadding.bottom, 
                            SmallMultipleLineChart.Config.chartAreaPadding.top]
                        ); // TODO: May get more complicated if we change position of multiple label!

                    /** Ticks and labels */
                        let yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(axisHelper.getRecommendedNumberOfTicksForYAxis(multipleIndividualRowHeight - settings.smallMultiple.labelHeight - SmallMultipleLineChart.Config.chartAreaPadding.bottom))
                            .tickFormat(d => (settings.yAxis.numberFormat.format(d)))
                            .tickSize(-multipleAvailableRowWidth, 0);

                /** X-axis setup */

                    /** Scaling */
                        let xScale = d3.scale.linear()
                            .domain([viewModel.xMin, viewModel.xMax])
                            .rangeRound([SmallMultipleLineChart.Config.chartSeriesPadding.left, multipleIndividualWidth - SmallMultipleLineChart.Config.chartSeriesPadding.right]);
                    
                    /** Pass the scale to our utils module for reuse in the chart */
                        smallMultipleLineChartUtils.xScale = xScale;

                /** Line series generation function */
                    let lineGen = d3.svg.line<LineChartSeriesSmallMultipleCategoryDataPoint>()
                        .x(function(d) { 
                            return xScale(d.name); 
                        })
                        .y(function(d) { 
                            return yScale(d.value); 
                        });

                /** Assign tooltip service wrapper to utility module */
                    smallMultipleLineChartUtils.tooltipService = this.host.tooltipService;

                /** Create as many rows as we need for our multiples based on the configuration of how manay we want per row */
                    for(let i = 0, len = multipleRows; i < len; i++) {

                        /** We can filter the source data when drawing but this creates empty elements; this step creates a subset of our
                         *  data for the row in question
                         */
                            let eligibleMultipleFacets: LineChartSeriesSmallMultiple[] = viewModel.multiples.map(function(o) {
                                return o;
                            }).slice(i * multipleColumns, (i * multipleColumns) + multipleColumns);
                
                        /** Container for entire row of multiples */
                            let multipleRow = this.svg
                                .append('svg')
                                    .classed({
                                        smallMultipleRowContainer: true
                                    })
                                    .attr({
                                        height: multipleIndividualRowHeight,
                                        width: entireChartWidth
                                    });

                        /** If we've determined that a Y-axis is required, add it in */
                            if(settings.yAxis.show) {
                                let axisContainer = multipleRow
                                    .append('g')
                                        .classed({
                                            yAxisContainer: true
                                        })
                                        .style({
                                            'font-size': `${settings.yAxis.fontSize}px`,
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
                                                return `translate(${settings.yAxis.width}, 0)`;
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
                                            'stroke-width': settings.yAxis.gridlines? settings.yAxis.gridlineStrokeWidth : 0
                                        })
                                        .classed(settings.yAxis.gridlineStrokeLineStyle, true);
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
                                            return `translate(${(i * multipleIndividualWidth) + settings.yAxis.width}, ${0})`;
                                        }
                                    });

                        /** Multiple background */
                            multiple.append('rect')
                                .classed({
                                    multipleBackground: true
                                })
                                .attr({
                                    height: multipleIndividualRowHeight,
                                    width: multipleIndividualWidth,
                                    fill: function(d, i) {
                                        return i % 2 && settings.smallMultiple.bandedMultiples ? 
                                        settings.smallMultiple.backgroundColorAlternate : 
                                        !settings.smallMultiple.backgroundColor ? 
                                            'transparent' : 
                                            settings.smallMultiple.backgroundColor;
                                    },
                                    'fill-opacity': 1 - (settings.smallMultiple.backgroundTransparency / 100)                                
                                });

                        /** Add container to multiple, specifically to manage interaction */
                            let overlay = multiple.append('rect')
                                .classed({
                                    overlay: true
                                })
                                .attr({
                                    width: multipleIndividualWidth - SmallMultipleLineChart.Config.chartSeriesPadding.right,
                                    height: multipleIndividualRowHeight - settings.smallMultiple.labelHeight - SmallMultipleLineChart.Config.chartAreaPadding.bottom,
                                    transform: function() {
                                        let x = SmallMultipleLineChart.Config.chartSeriesPadding.left,
                                            y: number;
                                        switch(settings.smallMultiple.labelPosition) {
                                            case 'top': {
                                                y = settings.smallMultiple.labelHeight;
                                                break;
                                            }
                                            case 'bottom': {
                                                y = 0;
                                                break;
                                            }
                                        }
                                        return `translate(${x}, ${y})`;
                                    }
                                });

                        /** Add stuff for each measure */

                            /** Container for line plot(s) */
                                let paths = multiple
                                    .append('g')
                                        .classed({
                                            pathContainer: true
                                        });

                            /** Container for tooltip nodes */
                                let focus = multiple
                                    .append('g')
                                        .classed( {
                                            tooltipFocus: true
                                        })
                                        .style({
                                            display: 'none' 
                                        });                                    

                            /** For each measure, add a line plot and a tooltip node */
                                this.measures.map(function(measure, measureIndex) {
                                    paths
                                        .append('path')
                                            .classed({
                                                lineSeries: true /** TODO: May need to change this when multiple measures are introduced */
                                            })
                                            .attr({
                                                d: function(d) {
                                                    return lineGen(d.measures[measureIndex].categories);
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
                                multiple.append('text')
                                .classed({
                                    smallMultipleLabel: true
                                })
                                .attr({
                                    'x': function(d) {
                                        switch(settings.smallMultiple.labelAlignment) {
                                            case 'left': {
                                                return 0;
                                            }
                                            case 'center': {
                                                return multipleIndividualWidth / 2;
                                            }
                                            case 'right': {
                                                return multipleIndividualWidth;
                                            }
                                        }
                                    },
                                    'y': function(){
                                        switch(settings.smallMultiple.labelPosition) {
                                            case 'top': {
                                                return 0 + settings.smallMultiple.labelHeight;
                                            }
                                            case  'bottom': {
                                                return multipleIndividualRowHeight;
                                            }
                                        }                                        
                                    },
                                    'text-anchor': function(d) {
                                        switch(settings.smallMultiple.labelAlignment) {
                                            case 'left': {
                                                return 'start';
                                            }
                                            case 'center': {
                                                return 'middle';
                                            }
                                            case 'right': {
                                                return 'end';
                                            }
                                        }
                                    },
                                    'alignment-baseline': 'text-after-edge'
                                })
                                .style({
                                    'font-size': `${settings.smallMultiple.fontSize}px`,
                                    'font-family': settings.smallMultiple.fontFamily,
                                    fill: function(d, i) {
                                        return i % 2 && settings.smallMultiple.bandedMultiples ? 
                                                settings.smallMultiple.fontColorAlternate : 
                                                settings.smallMultiple.fontColor;
                                    }
                                })
                                .text(function(d) { 
                                    return d.facet; 
                                });
                            }
                    }

            console.log('We did it!');
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
                    /** Banded multiples toggle */
                    if(!this.settings.smallMultiple.bandedMultiples) {
                        delete instances[0].properties['fontColorAlternate'];
                        delete instances[0].properties['backgroundColorAlternate'];
                    }
                    break;
                }
                case 'colorSelector': {
                    /** Enumerate measures and create colour pickers */
                    for (let measure of this.measures) {
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