import SmallMultiplesHelper from "../src/smallMultiple/SmallMultiplesHelper";
import SmallMultiplesLayoutSettings from "../src/smallMultiple/SmallMultiplesLayoutSettings";
import SmallMultiplesStylingSettings from "../src/smallMultiple/SmallMultiplesStylingSettings";
import SmallMultiplesHeadingSettings from "../src/smallMultiple/SmallMultiplesHeadingSettings";

/** Set up a simple helper for fixed width mode testing */
function commonFixedWidth(): SmallMultiplesLayoutSettings {
  let layout = new SmallMultiplesLayoutSettings();
  layout.horizontalGrid = "width";
  layout.verticalGrid = "height";
  layout.multipleWidth = 50;
  layout.spacingBetweenColumns = 0;
  return layout;
}

/** Set up a simple helper for fixed column mode testing */
function commonFitColumns(): SmallMultiplesLayoutSettings {
  let layout = new SmallMultiplesLayoutSettings();
  layout.horizontalGrid = "column";
  layout.verticalGrid = "fit";
  layout.spacingBetweenColumns = 0;
  return layout;
}

describe("SmallMultiplesHelper", () => {
  describe("Grid layout calculations", () => {
    describe("| Flow Layout", () => {
      it("| Fit single row, no spacing", () => {
        let layout = commonFixedWidth();
        let smh = new SmallMultiplesHelper(
          4,
          layout,
          new SmallMultiplesHeadingSettings(),
          new SmallMultiplesStylingSettings()
        );
        smh.calculateGridSize(200);
        expect(smh.layout.grid.columns.count).toEqual(4);
        expect(smh.layout.grid.rows.count).toEqual(1);
      });

      it("| Spacing causes overflow onto new row", () => {
        let layout = commonFixedWidth();
        layout.spacingBetweenColumns = 10;
        let smh = new SmallMultiplesHelper(
          4,
          layout,
          new SmallMultiplesHeadingSettings(),
          new SmallMultiplesStylingSettings()
        );
        smh.calculateGridSize(200);
        expect(smh.layout.grid.columns.count).toEqual(3);
        expect(smh.layout.grid.rows.count).toEqual(2);
      });
    });

    describe("| Fixed Column Layout", () => {
      it("| # multiples below column cap (single row)", () => {
        let multiples = 10;
        let layout = commonFitColumns();
        let smh = new SmallMultiplesHelper(
          multiples,
          layout,
          new SmallMultiplesHeadingSettings(),
          new SmallMultiplesStylingSettings()
        );
        smh.calculateGridSize(200);
        expect(smh.layout.grid.columns.count).toEqual(multiples);
        expect(smh.layout.grid.rows.count).toEqual(1);
      });

      it("| Column cap creates multiple rows", () => {
        let multiples = 10;
        let layout = commonFitColumns();
        layout.numberOfColumns = 4;
        let smh = new SmallMultiplesHelper(
          multiples,
          layout,
          new SmallMultiplesHeadingSettings(),
          new SmallMultiplesStylingSettings()
        );
        smh.calculateGridSize(200);
        expect(smh.layout.grid.columns.count).toEqual(layout.numberOfColumns);
        expect(smh.layout.grid.rows.count).toEqual(3);
      });
    });
  });
});
