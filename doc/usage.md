[Home](../readme.md) | **Usage** | Examples | [Change Log](./change_log.md) | [Privacy Policy](./privacy_policy.md) | Support

---

# Usage

Where possible, the visual utilises properties and concepts common to typical Power BI visuals but there are some specific properties that you might be able to get more use out of if correctly explained.

* [Fields](#Fields)
* [Small Multiples](#Small-Multiples)
    * [SM Layout](#SM-Layout)
    * [SM Heading](#SM-Heading)
    * [SM Styling](#SM-Styling)
* [Line Styling](#Line-Styling)
* [Additional Features](#Additional-Features)
    * [Y-Axis](#Y-Axis)
    * [X-Axis](#X-Axis)
    * [Legend](#Legend)

## Fields

In order to plot a chart, you will need the following added to the visual fields:

| Field | Purpose | Requirements | Max. Data Points | Data Reduction Algorithm* |
| ----- | ------- | ---------- | ---------------- | ------------------------- |
| Small Multiple | Attribute to partition your data, or chart by. If supplying more then one field, you can drill/expand. | One or More | 75 | Top |
| Axis | Series to plot on the x-axis of your chart. Only continuous series such as dates or numbers are currently supported. Categorical/ordinal series are being worked on for a future version. | One | 400 | Sample |
| Values | Measures to plot on your charts. | One or more | | |

If the above requirements are not met, then the chart will not render for you.

> *\* The Data Reduction method applies if the number of data points for that field are exceeded. This is to keep the rendered chart sensible for lots of data. In these cases, it is suggested that you create multiple instances of the chart if you wish to exceed these amounts.*
>
> *For an overview of how these data reduction algorithms are applied, you can refer to the [PowerBI-Visuals documentation](https://docs.microsoft.com/en-nz/power-bi/developer/visuals/dataview-mappings#data-reduction-algorithm-types).*

## Small Multiples

There are three property menus that govern the behaviour of the small multiples in the visual.

### SM Layout

The **SM Layout** menu allows you to configure the layout of the 'grid' of small multiples. This is driven from the **Mode** property, and there are two modes available:

#### Flow

<table>
    <tbody>
        <tr>
            <td>
              <img src="./assets/png/sm_layout_flow.png" alt="SM Layout: Flow"/>
            </td>
            <td>
                <ul>
                    <li>Small multiples have a fixed size and a row is filled, they will flow onto the next one.</li>
                    <li>This allows you to guarantee the dimensions of your small multiples if you are unsure as to how many may be displayed in the visual at one time (for example, if your report contains interactions and users may be doing their own filtering).</li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>

#### Fixed Columns

TODO

### SM Heading

The **SM Heading** menu allows you to configure the heading displayed on the small multiple.

### SM Styling

## Line Styling

## Additional Features

### Y-Axis

The behaviour and configuration of the chart's Y-axis is very much the same as a standard line chart, with a few small considerations. The Y-axis comprises the following three components:

| Component | Remarks |
| --------- | ------- |
| Labels | To reduce clutter, axis labels are displayed at the start of each row of small multiples. |
| Title | The title is vertically centered across all small multiple rows. |
| Gridlines | Gridlines are displayed within the confines of each small multiple. They are not shown across column spacing, so if you want a continuous line then it is advisable to set spacing to **0**. | 

> ℹ *Disabling an axis in the properties pane will prevent you from setting any properties for it, which is why the components have individual on/off switches.*

### X-Axis

The X-axis settings work much the same as the Y-axis. The one exception being that labels are displayed once per column and have an **Axis Domain Line** setting that can be used to toggle on a visual axis line for each one.

### Legend

Legends work very much the same as standard chart legends; the only exception being the **Include Range as Suffix** switch, which will add the min/max X-axis range values as a suffix to the title text.