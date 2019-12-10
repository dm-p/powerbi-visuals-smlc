/** Internal dependencies */
    import Debugger from '../debug/Debugger';
    import ISmallMultiple from '../viewModel/ISmallMultiple';
    import {
        ISmallMultipleGrid,
        ISmallMultipleLayoutOptions,
        ISmallMultipleLayout
    } from './interfaces';
    import {
        LayoutMode
    } from './enums';

/**
 *
 */
    export default class SmallMultiplesHelper {

        public layout: ISmallMultipleLayout;
        public options: ISmallMultipleLayoutOptions;
        private smallMultiples: ISmallMultiple[];

        constructor(smallMultiples: ISmallMultiple[], options: ISmallMultipleLayoutOptions) {
            Debugger.log('SmallMultiplesHelper initialised :)');
            this.smallMultiples = smallMultiples;
            this.options = options;
            this.layout = SmallMultiplesHelper.initialState();
        }

    /** Initial state of small multiples view model */
        private static initialState(): ISmallMultipleLayout {
            return {
                grid: {
                    columns: 0,
                    rows: 0
                }
            };
        }

    /** Resolves row and column count based on settings */
        calculateGridDimensions() {
            Debugger.log('Calculating small multiple grid dimensions...');
            switch (this.options.mode) {
                case LayoutMode.flow: {
                    if (    this.options.chartWidth
                        &&  this.options.smallMultipleWidth) {
                        Debugger.log('Calculating columns for Flow mode...');
                        this.layout.grid.columns =
                            Math.min(
                                this.smallMultiples.length,
                                Math.max(
                                    Math.floor(
                                            (this.options.chartWidth)
                                        /   (this.options.smallMultipleWidth + this.options.columnSpacing)
                                    ),
                                    1
                                )
                            );
                    }
                    break;
                }
                case LayoutMode.column: {
                    if (this.options.columnCap) {
                        Debugger.log('Calculating columns for Column mode...');
                        this.layout.grid.columns = (
                            this.smallMultiples.length < this.options.columnCap
                                ?   this.smallMultiples.length
                                :   this.options.columnCap
                        );
                    }
                    break;
                }
            }
            this.layout.grid.rows = this.layout.grid.columns && Math.ceil(this.smallMultiples.length / this.layout.grid.columns);
        }
    }