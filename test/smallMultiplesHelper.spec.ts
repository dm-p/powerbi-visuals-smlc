import SmallMultiplesHelper from '../src/smallMultiple/SmallMultiplesHelper';
import { LayoutMode } from '../src/smallMultiple/enums';

/** Set up a simple helper for flow mode testing */
    function simpleFlow(): SmallMultiplesHelper {
        return new SmallMultiplesHelper(4, {
            mode: LayoutMode.flow,
            smallMultipleWidth: 50,
            chartWidth: 200
        });
    }

/** Set up a simple helper for fixed column mode testing */
    function simpleColumn(): SmallMultiplesHelper {
        return new SmallMultiplesHelper(10, {
            mode: LayoutMode.column
        });
    }

describe('SmallMultiplesHelper', () => {

    describe('Grid layout calculations', () => {

        describe('| Flow Layout', () => {
            it('| Fit single row, no spacing', () => {
                let smh = simpleFlow();
                smh.layoutOptions.columnSpacing = 0;
                smh.calculateGridDimensions();
                expect(smh.layout.grid).toEqual({
                    columns: 4,
                    rows: 1
                });
            });
        
            it('| Spacing causes overflow onto new row', () => {
                let smh = simpleFlow();
                smh.layoutOptions.columnSpacing = 10;
                smh.calculateGridDimensions();
                expect(smh.layout.grid).toEqual({
                    columns: 3,
                    rows: 2
                });
            });
        });

        describe('| Fixed Column Layout', () => {
            it('| # multiples below column cap (single row)', () => {
                let smh = simpleColumn();
                smh.layoutOptions.columnCap = 20
                smh.calculateGridDimensions();
                expect(smh.layout.grid).toEqual({
                    columns: 10,
                    rows: 1
                });
            });
        
            it('| Column cap creates multiple rows', () => {
                let smh = simpleColumn();
                smh.layoutOptions.columnCap = 4
                smh.calculateGridDimensions();
                expect(smh.layout.grid).toEqual({
                    columns: smh.layoutOptions.columnCap,
                    rows: 3
                });
            });
        });

    });

});