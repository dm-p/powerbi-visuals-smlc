# Small Multiple Line Chart for Power BI

By Daniel Marsh-Patrick

![github.png](./doc/assets/png/github.png "GitHub: dm-p") [dm-p](https://github.com/dm-p) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![twitter.png](./doc/assets/png/twitter.png "Twitter: @the_d_mp") [@run_dmp](https://twitter.com/the_d_mp) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  ![linkedin.png](./doc/assets/png/linkedin.png "in/daniel-m-p") [daniel-m-p](https://www.linkedin.com/in/daniel-m-p)  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; www.coacervo.co  |  [daniel@coacervo.co](mailto:daniel@coacervo.co) 

----
**Home** | [Usage](./doc/usage.md) | [Theming](./doc/theming.md) | Examples | [Change Log](./doc/change_log.md) | [Privacy Policy](./doc/privacy_policy.md) | Support

----

## Current Status

| | Development | Submitted | Approved | Available |
|-|:--:|:-:|:-:|:-:|
| [1.0.1.0](./doc/change_log.md#1010-2018-11-29)| | | | ✔ |
| [2.0.0.x](./doc/change_log.md#200x-tbc) | 🚧 | | |

> **If a version is in any status other than *Available* this cannot be imported via file or via the Marketplace, even if the listing is showing the new version**. [More on this below](#More-About-Current-Status).

## What the Visual Does

A small multiple is a series of charts using the same scale and axes, allowing them to be easily compared. This visual allows you to take a measure you might normally plot in a line chart, and duplicate this for the values of another category, e.g.:

> ![SMLC_Introduction_Simple.png](https://bitbucket.org/repo/akedXeM/images/3440626957-SMLC_Introduction_Simple.png)

In this example, we are able to take a measure (**Rate**), plotted by time (**Year**), but also split this out into individual charts by category (**Location**). Each small multiple uses the same X and Y scale to allow for visual comparison between categories.

## Obtaining the Visual

The latest version of the visual is **2.0.0.x**

The visual is [available in AppSource](https://appsource.microsoft.com/en-us/product/power-bi-visuals/WA104381711?src=website&mktcmpid=repo_main_page) or through the Power BI marketplace. You can also download from this repository's [Releases section](https://github.com/dm-p/powerbi-visuals-smlc/releases).

Please read the below or review the [Current Status](#Current-Status) table prior to attempting to load a version other then the one in the Marketplace.

## More About Current Status

Custom visuals have a somewhat unconventional path to the Marketplace, and the [Current Status](#Current-Status) table above tries to mirror this as simply as possible. This process takes as long as it takes and is entirely dependent on the current backlog of work with the Custom Visuals Team at Microsoft.

If a custom visual is published to the Marketplace, **it will always be loaded from there**, even if you manually upload a specific version into your report. This is to ensure that reports are always using the latest version and the user doesn't have to manually upgrade all reports containing a particular visual when new versions become available.

If you want to load a version of this visual before it's fully available (or downgrade), you'll need to use [organizational custom visuals](https://docs.microsoft.com/en-us/power-bi/power-bi-custom-visuals-organization) in conjunction with your administrator, which will prioritise the version in your tenant over the one in the Marketplace.

Here's a bigger explanation for anyone who wants to know about what each status means:

* **Development** - the specified version is undergoing active development and is not in the AppSource/Marketplace ecosystem. Development builds may be available via releases [Releases](https://github.com/dm-p/powerbi-visuals-smlc/releases) or can be compiled from source.
* **Submitted** - the visual has been submitted to AppSource and is undergoing initial review.
* **Approved** - the visual listing is updated **but not yet fully available while MS do internal testing and verification**.
* **Available** - the visual is fully available and can be obtained from the marketplace as normal. Any reports using the visual will be automatically updated.

----

Need:
* Code review and doc
* Stretch goals:
    * Specify axis on small multiple or by row/column and get axes rendering
    * Allow single measure, multiple categories
    * Add label to line rather than top/bottom
    * Data point/measure highlight - will need bookmark support also
    * Test allow interactions - https://microsoft.github.io/PowerBI-visuals/docs/how-to-guide/allow-interactions/ - this works okay, as we're not doing highlighting yet
    * Data Labels:
        - Specific points (bool)
            - First
            - Last
            - Min
            - Max
    * Click to drill
    * Start a new 'group' with heading if expanded rather than drilled (identityFields > 1)
    * Add 'target, forecast and previous' measures. If measures has > 1 these cannot be used but we get addiitonal metrics in tooltip if we use them all

Examples:

Time series
Date series
Category series
Linear series