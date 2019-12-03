**Home** | Usage and Visual Properties | Examples | [Change Log](./doc/change_log.md) | Roadmap | [Privacy Policy](./doc/privacy_policy.md) | Support

# Small Multiple Line Chart for Power BI

By Daniel Marsh-Patrick

![github.png](doc\assets\png\github.png "GitHub: dm-p") [dm-p](https://github.com/dm-p) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![twitter.png](doc\assets\png\twitter.png "Twitter: @the_d_mp") [@run_dmp](https://twitter.com/the_d_mp) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  ![linkedin.png](doc\assets\png\linkedin.png "in/daniel-m-p") [daniel-m-p](https://www.linkedin.com/in/daniel-m-p)  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; www.coacervo.co  |  [daniel@coacervo.co](mailto:daniel@coacervo.co) 

----

## What the Visual Does

A small multiple is a series of charts using the same scale and axes, allowing them to be easily compared. This visual allows you to take a measure you might normally plot in a line chart, and duplicate this for the values of another category, e.g.:

> ![SMLC_Introduction_Simple.png](https://bitbucket.org/repo/akedXeM/images/3440626957-SMLC_Introduction_Simple.png)

In this example, we are able to take a measure (**Rate**), plotted by time (**Year**), but also split this out into individual charts by category (**Location**). Each small multiple uses the same X and Y scale to allow for visual comparison between categories.

## Obtaining the Visual

The latest version of the visual is **2.0.0.x**

The visual is [available in AppSource](https://appsource.microsoft.com/en-us/product/power-bi-visuals/WA104381711?src=website&mktcmpid=repo_main_page) or through the Power BI marketplace. you can also download the following resources directly from this repository's [Releases section](/dm-p/powerbi-visuals-smlc/releases).

----

Need:
* Nice axes with linear values seems to casue spacig issues; we can allow categorical as a selection and that'll pporbably help
* Landing page / clear if fields removed
* Full-collapse (height or width too small)
* Test IE/iPad
* Code review and doc
* Stretch goals:
    * Specify axis on small multiple or by row/column and get axes rendering
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