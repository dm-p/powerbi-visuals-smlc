import SmallMultiplesHelper from '../src/smallMultiple/SmallMultiplesHelper';
import { LayoutMode } from '../src/smallMultiple/enums';

/** Set up a simple helper for flow mode testing */
    function simpleFlow(): SmallMultiplesHelper {
        let smh = new SmallMultiplesHelper(4, {
            mode: LayoutMode.flow,
            smallMultipleWidth: 50,
            chartWidth: 200
        });
        return smh;
    }

describe('SmallMultiplesHelper', () => {
    it('Flow Layout (fit single row, no spacing)', () => {
        let smh = simpleFlow();
        smh.layoutOptions.columnSpacing = 0;
        smh.calculateGridDimensions();
        expect(smh.layout.grid).toEqual({
            columns: 4,
            rows: 1
        });
    });

    it('Flow Layout (spacing causes overflow)', () => {
        let smh = simpleFlow();
        smh.layoutOptions.columnSpacing = 10;
        smh.calculateGridDimensions();
        expect(smh.layout.grid).toEqual({
            columns: 3,
            rows: 2
        });
    });

});