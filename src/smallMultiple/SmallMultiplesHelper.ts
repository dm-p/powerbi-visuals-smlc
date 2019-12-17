/** Internal dependencies */
    import Debugger from '../debug/Debugger';
    import {
        ISmallMultipleLayoutOptions,
        ISmallMultipleLayout
    } from './interfaces';
    import {
        LayoutMode
    } from './enums';

/**
 * Manages the calculation and handling of small multiples within the visual viewport.
 */
    export default class SmallMultiplesHelper {

        /** View model, representing layout configuration for the small multiples. */
            public layout: ISmallMultipleLayout;
        /** Specific options to consider when resolving layout.*/
            public layoutOptions: ISmallMultipleLayoutOptions;

    /**
     * Instantiates a new `SmallMultiplesHelper`.
     * @param count         - Number of small multiples to work with.
     * @param layoutOptions - Specific options to consider when resolving layout.
     */
        constructor(count: number, layoutOptions: ISmallMultipleLayoutOptions) {
            Debugger.log('SmallMultiplesHelper initialised :)');
            this.layout = SmallMultiplesHelper.initialState();
            this.layout.count = count;
            this.layoutOptions = layoutOptions;
        }

    /** Represents the initial state of the small multiples view model and can be used to reset it back. */
        private static initialState(): ISmallMultipleLayout {
            return {
                count: 0,
                grid: {
                    columns: 0,
                    rows: 0
                }
            };
        }

    /** Resolves row and column count based on settings. */
        calculateGridDimensions() {
            Debugger.log('Calculating small multiple grid dimensions...');
            Debugger.log('Options', this.layoutOptions);
            switch (this.layoutOptions.mode) {
                case LayoutMode.flow: {
                    if (    this.layoutOptions.chartWidth
                        &&  this.layoutOptions.smallMultipleWidth) {
                        Debugger.log('Calculating columns for Flow mode...');
                        this.layout.grid.columns =
                            Math.min(
                                this.layout.count,
                                Math.max(
                                    Math.floor(
                                            (this.layoutOptions.chartWidth)
                                        /   (this.layoutOptions.smallMultipleWidth + this.layoutOptions.columnSpacing)
                                    ),
                                    1
                                )
                            );
                    }
                    break;
                }
                case LayoutMode.column: {
                    if (this.layoutOptions.columnCap) {
                        Debugger.log('Calculating columns for Column mode...');
                        this.layout.grid.columns = (
                            this.layout.count < this.layoutOptions.columnCap
                                ?   this.layout.count
                                :   this.layoutOptions.columnCap
                        );
                    }
                    break;
                }
            }
            this.layout.grid.rows = this.layout.grid.columns && Math.ceil(this.layout.count / this.layout.grid.columns);
        }
    }