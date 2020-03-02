// Power BI API references
    import {
        textMeasurementService,
        interfaces
    } from 'powerbi-visuals-utils-formattingutils';
    import TextProperties = interfaces.TextProperties;
    import measureSvgTextHeight = textMeasurementService.measureSvgTextHeight;

// Internal dependencies
    import Debugger from '../debug/Debugger';
    import {
        visualConstants
    } from '../visualConstants';
    import {
        ISmallMultiplesLayout, ISmallMultiplesHeading
    } from './interfaces';
    import {
        HorizontalGridMode
    } from './enums';
    import SmallMultiplesLayoutSettings from './SmallMultiplesLayoutSettings';
    import SmallMultiplesStylingSettings from './SmallMultiplesStylingSettings';
    import SmallMultiplesHeadingSettings from './SmallMultiplesHeadingSettings';

/**
 * Manages the calculation and handling of small multiples within the visual viewport.
 */
    export default class SmallMultiplesHelper {

        // View model, representing layout configuration for the small multiples.
            public layout: ISmallMultiplesLayout;
        // Layout settings from properties pane.
            private layoutSettings: SmallMultiplesLayoutSettings;
        // Heading settings from properties pane.
            private headingSettings: SmallMultiplesHeadingSettings;
        // Styling settings from properties pane.
            private stylingSettings: SmallMultiplesStylingSettings;

    /**
     * Instantiates a new `SmallMultiplesHelper`.
     * @param count             - Number of small multiples to work with.
     * @param layoutSettings    - Layout settings from properties pane.
     * @param stylingSettings   - Styling settings from properties pane.
     */
        constructor(count: number, layoutSettings: SmallMultiplesLayoutSettings, headingSettings: SmallMultiplesHeadingSettings, stylingSettings: SmallMultiplesStylingSettings) {
            Debugger.LOG('SmallMultiplesHelper initialised :)');
            this.layoutSettings = layoutSettings;
            this.headingSettings = headingSettings;
            this.stylingSettings = stylingSettings;
            this.layout = SmallMultiplesHelper.INITIAL_STATE();
            this.layout.count = count;
            // Resolve heading properties
                this.layout.multiple.heading = this.resolveHeadingProperties();
            // Resolve border offset
                this.layout.multiple.borderOffset = this.stylingSettings.border && this.stylingSettings.borderStrokeWidth || 0;
        }

    // Represents the initial state of the small multiples view model and can be also be used to reset it.
        static INITIAL_STATE(): ISmallMultiplesLayout {
            return {
                count: 0,
                grid: {
                    columns: {
                        count: 0,
                        height: 0,
                        width: 0
                    },
                    rows: {
                        count: 0,
                        height: 0,
                        width: 0
                    }
                },
                multiple: {
                    outer: {
                        width: 0,
                        height: 0
                    },
                    inner: {
                        width: 0,
                        height: 0
                    },
                    margin: {
                        top: visualConstants.defaults.smallMultiple.margin.top,
                        bottom: visualConstants.defaults.smallMultiple.margin.bottom,
                        left: visualConstants.defaults.smallMultiple.margin.left,
                        right: visualConstants.defaults.smallMultiple.margin.right
                    },
                    heading: null,
                    xOffset: 0,
                    borderOffset: 0
                }
            };
        }

    // Resolves row and column count based on settings.
        calculateGridSize(chartWidth: number) {
            Debugger.HEADING('Calculating small multiple grid dimensions...');
            Debugger.LOG('Options', this.layoutSettings);
            Debugger.LOG('Chart width', chartWidth);
            switch (this.layoutSettings.horizontalGrid) {
                case HorizontalGridMode.width: {
                    if (    chartWidth
                        &&  this.layoutSettings.multipleWidth) {
                        Debugger.LOG('Calculating columns for Flow mode...');
                        this.layout.grid.columns.count =
                            Math.min(
                                this.layout.count,
                                Math.max(
                                    Math.floor(
                                            (chartWidth)
                                        /   (this.layoutSettings.multipleWidth + this.layoutSettings.spacingBetweenColumns)
                                    ),
                                    1
                                )
                            );
                    }
                    break;
                }
                case HorizontalGridMode.column: {
                    Debugger.LOG('Calculating columns for Column mode...');
                    // Resolve number of columns for null (Auto)
                        let columnCap = this.layoutSettings.numberOfColumns || visualConstants.defaults.layout.multipleDataReductionCap;
                    this.layout.grid.columns.count = (
                        this.layout.count < columnCap
                            ?   this.layout.count
                            :   columnCap
                    );
                    break;
                }
            }
            this.layout.grid.rows.count = this.layout.grid.columns.count && Math.ceil(this.layout.count / this.layout.grid.columns.count);
        }

    /**
     * Calculate dimensions of small multiples and grid, accommodating for spacing and other factors.
     * @param chartWidth 
     * @param chartHeight 
     */
        calculateDimensions(
            chartWidth: number,
            chartHeight: number
        ) {
            Debugger.HEADING('Resolving small multiple row and column dimensions...');
            Debugger.LOG('Chart width', chartWidth, 'Chart height', chartHeight);
            let vph = chartHeight,
                vpw = chartWidth,
                rc = this.layout.grid.rows.count,
                cc = this.layout.grid.columns.count,
                br = this.stylingSettings.border
                    ?   this.stylingSettings.borderStrokeWidth
                    :   0;

            this.resolveSmallMultipleHeight(rc, vph, br);

            // Adjust margins for border
                this.layout.multiple.margin.top = this.getMarginAdjustedForBorder(visualConstants.defaults.smallMultiple.margin.top);
                this.layout.multiple.margin.bottom = this.getMarginAdjustedForBorder(visualConstants.defaults.smallMultiple.margin.bottom);

            this.adjustMarginsForHeading();

            // Adjust inner canvas for margin
                this.layout.multiple.inner.height = this.layout.multiple.outer.height
                    - this.layout.multiple.margin.top
                    - this.layout.multiple.margin.bottom;

            Debugger.LOG(
                'Resolved heights: Row height',
                this.layout.grid.rows.height,
                'SM height (outer)',
                this.layout.multiple.outer.height,
                'SM height (inner)',
                this.layout.multiple.inner.height
            );

            // Resolve widths
                this.resolveSmallMultipleWidth(cc, vpw, br);
                this.layout.grid.rows.width = this.layout.grid.columns.width * this.layout.grid.columns.count;
                this.layout.multiple.xOffset = this.layout.multiple.outer.width + this.layoutSettings.spacingBetweenColumns || 0;
                this.layout.multiple.inner.width = this.layout.multiple.outer.width
                    - this.layout.multiple.margin.right
                    - this.layout.multiple.margin.left;

            this.setHeadingPosition();

            Debugger.LOG(
                'Resolved widths: Column width',
                this.layout.grid.columns.width,
                'Row width',
                this.layout.grid.rows.width,
                'SM width (outer)',
                this.layout.multiple.outer.width,
                'SM width (inner)',
                this.layout.multiple.inner.width,
                'SM x-offset',
                this.layout.multiple.xOffset
            );
        }

    /**
     * Sets heading x-position and text anchor based on settings.
     */
        private setHeadingPosition() {
            switch (this.headingSettings.labelAlignment) {
                case 'left': {
                    this.layout.multiple.heading.x = this.layout.multiple.margin.left;
                    this.layout.multiple.heading.textAnchor = 'start';
                    break;
                }
                case 'center': {
                    this.layout.multiple.heading.x = this.layout.multiple.inner.width / 2;
                    this.layout.multiple.heading.textAnchor = 'middle';
                    break;
                }
                case 'right': {
                    this.layout.multiple.heading.x = this.layout.multiple.inner.width;
                    this.layout.multiple.heading.textAnchor = 'end';
                    break;
                }
            }
        }

    /**
     * Adjust the margin for the chart within the small multiple to compensate for label configuration.
     */
        private adjustMarginsForHeading() {
            switch (true) {
                case this.headingSettings.labelPosition === 'top' && this.headingSettings.show: {
                    Debugger.LOG('Adjusting for top...');
                    this.layout.multiple.heading.y = this.layout.multiple.margin.top;
                    this.layout.multiple.margin.top += this.layout.multiple.heading.textHeight;
                    break;
                }
                case this.headingSettings.labelPosition === 'bottom' && this.headingSettings.show: {
                    Debugger.LOG('Adjusting for bottom...');
                    this.layout.multiple.margin.bottom += this.layout.multiple.heading.textHeight;
                    this.layout.multiple.heading.y = this.layout.multiple.outer.height - this.layout.multiple.margin.bottom;
                    break;
                }
            }
        }

    /**
     * Calculates the width of each small multiple, based on sizing and settings.
     * @param columnCount   - number of columns
     * @param totalWidth    - width of area to work with
     * @param borderWidth   - border width to adjust for
     */
        private resolveSmallMultipleWidth(
            columnCount: number,
            totalWidth: number,
            borderWidth: number
        ) {
            switch (this.layoutSettings.horizontalGrid) {
                case 'width': {
                    this.layout.grid.columns.width = this.layoutSettings.multipleWidth + (columnCount > 1 ? this.layoutSettings.spacingBetweenColumns : 0);
                    this.layout.multiple.outer.width = this.layoutSettings.multipleWidth;
                    break;
                }
                case 'column': {
                    this.layout.grid.columns.width = Math.max(visualConstants.ranges.multipleSize.min, (totalWidth - borderWidth) / columnCount);
                    this.layout.multiple.outer.width = this.layout.grid.columns.width - (this.layoutSettings.spacingBetweenColumns || 0);
                    break;
                }
            }
        }

    /**
     * Calculates the height of each small multiple, based on sizing and settings.
     * @param rowCount      - number of rows
     * @param totalHeight   - height of area to work with
     * @param borderWidth   - border width to adjust for
     */
        private resolveSmallMultipleHeight(
            rowCount: number,
            totalHeight: number,
            borderWidth: number
        ) {
            Debugger.LOG('Resolving heights...');
            switch (this.layoutSettings.verticalGrid) {
                case 'height': {
                    this.layout.grid.rows.height = this.layoutSettings.multipleHeight + (rowCount > 1 ? this.layoutSettings.spacingBetweenRows : 0);
                    this.layout.multiple.outer.height = this.layoutSettings.multipleHeight;
                    break;
                }
                case 'fit': {
                    this.layout.grid.rows.height = Math.max(visualConstants.ranges.multipleSize.min, (totalHeight / rowCount) - borderWidth);
                    this.layout.multiple.outer.height = this.layout.grid.rows.height - (rowCount > 1 ? this.layoutSettings.spacingBetweenRows : 0);
                    break;
                }
            }
        }

    /**
     * Adjusts the margin to compensate for border width (if enabled).
     * @param initialMargin  -initial potision of margin
     */
        private getMarginAdjustedForBorder(
            initialMargin: number
        ) {
            return initialMargin +
                (   this.stylingSettings.border
                        ?   this.stylingSettings.borderStrokeWidth
                        :   0
                );
        }

    /**
     * Resolve the small multiple label properties so we can work out how much space is required for the label.
     */
        private resolveHeadingProperties(): ISmallMultiplesHeading {
            let textProperties: TextProperties = {
                fontFamily: this.headingSettings.fontFamily,
                fontSize: `${this.headingSettings.fontSize}pt`,
                text: ''
            };
            return {
                textProperties: textProperties,
                textHeight: this.headingSettings.show
                    ?   measureSvgTextHeight(textProperties, 'A')
                    :   0,
                dominantBaseline: 'hanging',
                textAnchor: '',
                x: 0,
                y: 0
            };
        }

    }