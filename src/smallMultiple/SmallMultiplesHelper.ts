/** Internal dependencies */
    import Debugger from '../debug/Debugger';
    import ISmallMultiple from '../viewModel/ISmallMultiple';
    import {
        ISmallMultipleGrid,
        ISmallMultipleLayoutOptions
    } from './interfaces';
    import {
        LayoutMode
    } from './enums'

/**
 * 
 */
    export default class SmallMultiplesHelper {

        private smallMultiples: ISmallMultiple[];
        private mode: LayoutMode;
        
        constructor(smallMultiples: ISmallMultiple[], mode: string = 'flow') {
            Debugger.log('SmallMultiplesHelper initialised :)');
            Debugger.log('Mode', mode);
            this.smallMultiples = smallMultiples;
            switch (mode) {
                case 'column': {
                    this.mode = LayoutMode.Column;
                    break;
                }
                default: {
                    this.mode = LayoutMode.Flow;
                }
            }
        }

        gridDimensions(options: ISmallMultipleLayoutOptions): ISmallMultipleGrid {
            Debugger.log('Calculating small multiple grid dimensions...');
            Debugger.log('Mode', this.mode);
            Debugger.log('Options', options);
            let columns: number = 0;
            switch (this.mode) {
                case LayoutMode.Flow: {
                    if (options.chartWidth && options.columnSpacing && options.smallMultipleWidth) {
                        Debugger.log('Calculating columns for Flow mode...');
                        columns =
                            Math.min(
                                this.smallMultiples.length,
                                Math.max(
                                    Math.floor(
                                            (options.chartWidth)
                                        /   (options.smallMultipleWidth + options.columnSpacing)
                                    ),
                                    1
                                )
                            );
                    }
                    break;
                }
                case LayoutMode.Column: {
                    if (options.columnCap) {
                        Debugger.log('Calculating columns for Column mode...');
                        columns = (
                            this.smallMultiples.length < options.columnCap
                                ?   this.smallMultiples.length
                                :   options.columnCap
                        );
                    }                    
                    break;
                }
            }
            return {
                columns: columns,
                rows: columns && Math.ceil(this.smallMultiples.length / columns)
            }
        }

    }