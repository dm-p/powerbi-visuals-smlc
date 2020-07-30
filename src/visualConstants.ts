/**
 * Constants used throughout visual
 */
    const
        maxCategories = 100, // Manually copied from capabilities
        strokeWidthMin = 1,
        strokeWidthMax = 5;

    export const visualConstants = {
        debug: false,
        about: {
            version: '2.2.0',
            usageUrl: 'https://bit.ly/powerbi-smlc'
        },
        visual: {
            minPx: 75
        },
        defaults: {
            selection: {
                solidOpacity: 1,
                transparentOpacity: 0.4
            },
            features: {
                axisLabelPlacement: false,
                contextMenu: true,
                filterOtherVisuals: true
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
                showArea: false,
                backgroundTransparency: 50,
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
                multipleDataReductionCap: maxCategories,
                horizontalGrid: 'width',
                verticalGrid: 'height',
                fitHeight: false,
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
            spacing: {
                min: 0,
                max: 50
            },
            borderStrokeWidth: {
                min: strokeWidthMin,
                max: strokeWidthMax
            },
            numberOfColumns: {
                min: 1,
                max: maxCategories
            },
            axisLineStrokeWidth: {
                min: strokeWidthMin,
                max: strokeWidthMax
            },
            gridlineStrokeWidth: {
                min: strokeWidthMin,
                max: strokeWidthMax
            },
            precision: {
                min: 0,
                max: 10
            },
            shapeStrokeWidth: {
                min: 0,
                max: strokeWidthMax
            },
            multipleSize: {
                min: 40,
                max: 500
            }
        }
    };