[Home](../readme.md) | [Usage](./usage.md) | Examples | **Change Log** | [Privacy Policy](./privacy_policy.md) | Support

---

# Change Log

## 2.0.0.x (TBC)

### Major Changes

* In order to support new features, the visual has been completely re-written and runs in the latest custom visuals SDK. Extreme care has been taken to support transition from original versions of the visual to this version, but please be aware that some properties might need reviewing accordingly.
* A [**Line Styling**](./usage.md#Line-Styling) menu has been added, which allows you to configure the following properties per measure:
    * Color
    * Stroke Width
    * Line Shape - **Linear**, Stepped, Curve (Cardinal), Curve (Natural)
    * Line Style - Dashed, **Solid**, Dotted, Dot-Dash
* The **Small Multiples** menu contained too many properties, spanning too many features. These have been split up into more-specific menus to better manage properties and make future enhancements easier:
    * [**SM Layout**](./usage.md#SM-Layout) - configuration of the small multiple 'grid', including mode (refer below)
    * [**SM Heading**](./usage.md#SM-Heading) - configuration of the small multiple heading (formerly known as *Label*).
    * [**SM Styling**](./usage.md#SM-Styling) - configuration of the small multiple background and border styling.
* Added [**Mode** property, which resides in the **SM Layout** menu](./usage.md#SM-Layout) and provides the following options:
    * **Flow** (default) - allows you to set desired fixed width and height of small multiples. 
        * The visual will fit as many per row as possible, based on the prescribed width, and 'flow' the remainer on to the next row.
        * This makes it easier to ensure that small mutliples appear consistently when interacting with other visuals and slicers in your report.
        * The visual will display scrollbars if more vertical room is needed, based on the supplied dimensions.
    * **Fixed Columns** - allows you to specify a number of columns per row and the visual will auto-fit based on this.
        * This is how the visual managed the small mutiple grid for previous versions, so if you've been using the visual beforehand, this is how you will be used to working with it.
        * If you're already using v1 of the visual in your report, this mode will be retained, to ensure continuity. You can set this to **Flow** by editing the report and setting this accordingly.
* Core Tooltip support has been added, which includes:
    * Standard tooltip configuration options, such as background, font, colors and transparency
    * Canvas (Report Page) tooltips
* Context menu support has been added, which also allows drillthrough (if you have configured your report appropriately).

### Minor Enhancements

* X-axis now supports ordinal categories and date/time fields.
* The **Small Mutliple** field supports drill-down/expand and drill up (also via the context menu).
* Standard sorting options have been enabled and can be supplied in the visual header - the visual used to previously sort implicitly by Small Multiple value.
* Measures respect Power BI language and display culture.
* "Zebra-Stripe" has been renamed to **Alternate Background Color**.
* Alternate Background Color can now be applied by:
    * Column (v1)
    * Row
    * Small Multiple.
* If the visual is too small to draw components such the axis and legend, it will remove them to preserve as much space as possible for the small multiples.
* Data limits have been raised from **50** small multiple values and **200** axis values (10K total) to [**75** small multiple values and **400** axis values](./usage.md#Fields) (30K total).
* Legend icons have been replaced with lines rather than circles (it is a line chart after all...).
* Properties have all been corrected to have the correct controls and have sensible limits where possible.
* We're now using GitHub to manage the source code and project.

### Bugs Fixed

* If your small multiple category was `(blank)`, this would prevent the chart from rendering. At all.
* Axis ticks would leave whitespace if the data model didn't have a format applied.
* Small multiple labels would not always fit correctly if font size was set too large, or text was too wide. Labels will now fit vertically and truncate with an ellipsis (...) if text starts to overflow.
* Due to size calculation issues, the border would not apply correctly and look inconsistent.
* Measures do not always auto-assign colors from the palette.
* When using a legend, and specifying to use the range as suffix on the title and then manually overridng the title would prevent the suffix from being displayed.


## 1.0.1.0 (2018-11-29)

### Bugs Fixed

* Line needs to be continuous for missing data.
* Charts constantly expand vertically on iOS.

## 1.0.0.0 (2018-07-12)

Initial release of the visual.