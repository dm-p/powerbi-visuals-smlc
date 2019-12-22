# Change Log
---
[Home](../readme.md) | [Usage](./usage.md) | [Theming](./theming.md) | Examples | **Change Log** | [Privacy Policy](./privacy_policy.md) | Support

---

## 2.0.0.x (TBC)

### Major Changes

* In order to support new features, the visual has been completely re-written and runs in the latest custom visuals SDK. Extreme care has been taken to support transition from original versions of the visual to this version, but please be aware that some properties might need reviewing accordingly.
* A [**Line Styling**](./usage.md#Line-Styling) menu has been added, which allows you to configure the following properties per measure:
    * Color
    * Stroke Width
    * Line Shape - **Linear**, Stepped, Curve (Cardinal), Curve (Natural)
    * Line Style - Dashed, **Solid**, Dotted, Dot-Dash
* The **Small Multiples** menu contained too many properties, spanning too many features for one location. These have been split up into more-specific menus to better manage properties and make future enhancements easier:
    * [**SM Layout**](./usage.md#SM-Layout) - configuration of the small multiple 'grid', including mode (refer below)
    * [**SM Heading**](./usage.md#SM-Heading) - configuration of the small multiple heading (formerly known as *Label*).
    * [**SM Styling**](./usage.md#SM-Styling) - configuration of the small multiple background and border styling.
* Added [additional properties that reside in the **SM Layout** menu](./usage.md#SM-Layout) and provides the following options:
    * **Column Sizing** allows you to specify the behavior of how columns widths are calculated for small multiples:
        * **Fixed Width** (default) - small multiples have a specified width and will flow across rows if width does not accomodate.
        * **Fixed # Columns** - fit widths according to specificed number of columns.
    * **Row Sizing** allows you to specify the behavior of how row heights are calculated for small multiples:
        * **Fixed Height** (default) - small multiples have a specified height and the visual will scroll to accomodate them if this excees the visual viewport.
        * **Divide Evenly** - small multiple height will be divided evenly by the number of rows across the height of the visual.
    * If wanting to work with the original v1 layout, the use **Fixed # Columns** for **Column Sizing** and **Divide Evenly** for **Row Sizing**.
* Core Tooltip support has been added, which includes:
    * Standard tooltip configuration options, such as background, font, colors and transparency
    * Canvas (Report Page) tooltips
    * Visual header tooltips
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
* Data limits have been raised from **50** small multiple values and **200** axis values (10K total) to [**100** small multiple values and **300** axis values](./usage.md#Fields) (30K total).
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

### Known Issues

* If your measure contains a specific number format, the visual will not render this with respect to the user's locale. This appears to be an issue with one of the APIs, as the visual is coded to support locale. I've raised an issue for this with the custom visuals team and will advise as soon as possible.

## 1.0.1.0 (2018-11-29)

### Bugs Fixed

* Line needs to be continuous for missing data.
* Charts constantly expand vertically on iOS.

## 1.0.0.0 (2018-07-12)

Initial release of the visual.