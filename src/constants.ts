/** Constants used throughout visual */
    export const VisualConstants = {
        debug: true,
        defaults: {
            features: {
                contextMenu: true
            },
            font: {
                size: 11,
                family: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
                colour: '#777777'
            },
            axis: {
                show: true,
                showLabels: true,
                labelDisplayUnits: 0,
                precision: null,
                showTitle: true,
                titleStyle: 'title',
                titleText: null,
                gridlines: true,
                gridlineColour: '#EAEAEA',
                gridlineStrokeWidth: 1,
                gridlineStrokeStyle: 'solid'
            },
            valueAxis: {
                range: {
                    start: null,
                    end: null
                },
                labelPlacement: 'row'
            },
            categoryAxis: {
                show: false,
                gridlines: false,
                showTitle: false,
                titleStyle: 'title',
                showAxisLine: false,
                axisLineStrokeWidth: 1,
                fixedTicks: 8,
                labelPlacement: 'column'
            },
            heading: {
                show: true,
                verticalPosition: 'top',
                horizontalAlignment: 'center',
            },
            lines: {
                strokeWidth: 2,
                lineShape: 'curveLinear',
                lineStyle: 'solid',
                byMeasure: false
            },
            legend: {
                position: 'Top',
                showTitle: true,
                titleText: null,
                includeRanges: true,
                fontSize: 8
            },
            layout: {
                multipleDataReductionCap: 75, /** Manually copied from capabilities */
                mode: 'flow',
                multipleHeight: 125,
                multipleWidth: 125,
                numberOfColumns: null,
                columnSpacing: 5,
                rowSpacing: 5,
                scrollbarPadding: 10
            },
            smallMultiple: {
                zebraStripe: false,
                zebraStripeApply: 'column',
                backgroundColour: null,
                backgroundColourAlternate: '#B3B3B3',
                backgroundTransparency: 50,
                border: false,
                borderColour: '#999999',
                borderStrokeWidth: 1,
                borderStyle: 'solid',
                margin: {
                    top: 2,
                    bottom: 2,
                    left: 2,
                    right: 2
                }
            }
        },
        ranges: {
            canvas: {
                minWidth: 75,
                minHeight: 75
            },
            spacing: {
                min: 0,
                max: 20
            },
            borderStrokeWidth: {
                min: 1,
                max: 5
            },
            numberOfColumns: {
                min: 1,
                max: 75
            },
            axisLineStrokeWidth: {
                min: 1,
                max: 5
            },
            gridlineStrokeWidth: {
                min: 1,
                max: 5
            },
            precision: {
                min: 0,
                max: 10
            },
            shapeStrokeWidth: {
                min: 1,
                max: 5
            },
            multipleSize: {
                min: 40,
                max: 500
            }
        }
    };