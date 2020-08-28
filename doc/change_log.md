# Change Log
---
[Home](../readme.md) | [Usage](./usage.md) | [Theming](./theming.md) | Examples | **Change Log** | [Privacy Policy](./privacy_policy.md) | [Support](./support.md)

---

## 2.2.0.133 (2020-08-28)

Not yet available in the Power BI Marketplace - [early adopters can download the standalone version here](https://github.com/dm-p/powerbi-visuals-smlc/releases/tag/2.2.0.133). **Please note that the standalone version is uncertified, as it has a different ID to the version in the Marketplace**.

### Minor Enhancements

* The visual exposes a **Tooltips** data role, which will allow up to 5 additional measures to be added to the standard tooltip.

### Bugs Fixed

* [SEVERE] Axis values not resolved correctly in report page tooltips when visual contains multiple measures (#22)
* [SEVERE] Tooltip doesn't resolve nearest data point correctly if (Blank) or 0 (#23)

## 2.1.0.130 (2020-04-15)

The majority of changes are to underlying code in order to attempt certification of the visual with Microsoft, but some additional functionality has been squeezed in:

### Minor Enhancements

* The legend line styling will correctly mirror the measure if **Dashed**, **Dotted** or **Dot-Dash**.
* Clicking a small mutiple will now filter other visuals by that category.
* [Ctrl] + clicking a small multiple will filter other visuals by multiple categories.
* Number formats for non-US locales will now work as per the data model (due to bug in [powerbi-visuals-utils-formattingutils](https://github.com/microsoft/powerbi-visuals-utils-formattingutils/issues/36) - updated library has been added).

### Bugs Fixed

* [SEVERE] Linear x-axes starting at **0** break the visual (#6)
* [MINOR] Using a Date Value in the Small Multiple Title Doesn't Respect Formatting (#5)


## 2.0.0.121 (2020-01-15)

### Major Changes

* In order to support new features, the visual has been completely re-written and runs in the latest custom visuals SDK. Extreme care has been taken to support transition from original versions of the visual to this version, but please be aware that some properties might need reviewing accordingly.
* A [**Line Styling**](./usage.md#Line-Styling) menu has been added, which allows you to configure the following properties per measure:
    * Color
    * Stroke Width
    * Show Area and Transparency
    * Line Shape - **Linear**, Stepped, Curve (Cardinal), Curve (Natural)
    * Line Style - Dashed, **Solid**, Dotted, Dot-Dash
* The **Small Multiples** menu contained too many properties, spanning too many features for one location. These have been split up into more-specific menus to better manage properties and make future enhancements easier:
    * [**SM Layout**](./usage.md#SM-Layout) - configuration of the small multiple 'grid', including mode (refer below)
    * [**SM Heading**](./usage.md#SM-Heading) - configuration of the small multiple heading (formerly known as *Label*).
    * [**SM Styling**](./usage.md#SM-Styling) - configuration of the small multiple background and border styling.
* [Additional properties that reside in the **SM Layout** menu](./usage.md#SM-Layout) that provide the following options:
    * **Column Sizing** allows you to specify the behavior of how column widths are calculated for small multiples:
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
* The **Small Multiple** field supports drill-down/expand and drill up (also via the context menu).
* Standard sorting options have been enabled and can be supplied in the visual header - the visual used to previously sort implicitly by Small Multiple value.
* Mouse tracking for data points and tooltips has been made more responsive and should feel more natural.
* Measures are coded to respect Power BI language and display culture. **There is an issue with the Power BI API for this** however (refer to [Known Issues](#Known-Issues) below).
* "Zebra-Stripe" has been renamed to **Alternate Background Color**.
* **Alternate Background Color** can now be applied by:
    * Column (v1 behavior)
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

* If your measure contains a specific number format, the visual will not render this with respect to the user's locale. This appears to be an issue with one of the APIs, as the visual is coded to support locale. I've raised an issue for this with the custom visuals team and will advise as soon as possible. **Will be resolved in 2.1.0**.
* Measures in the **Line Styling** menu are separated with hyphens (`----------`). This is because containers (where measures are selectable via dropdown) are not yet fully supported for non-Microsoft visuals. This is expected to be available in 2020 and as soon as it's available, it's definitely going into this one.

## 1.0.1.0 (2018-11-29)

### Bugs Fixed

* Line needs to be continuous for missing data.
* Charts constantly expand vertically on iOS.

## 1.0.0.0 (2018-07-12)

Initial release of the visual.
