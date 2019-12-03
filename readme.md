# Change Log (to note)

* Re-written all code for latest SDK
* Properties have been tightened up to use correct controls
* Added culture selection to Y-axis
* Added support for additional data types on x-axis (categorical - will assume ordinal, and date/time)
* Allowed suffix to be displayed with custom title
* Small Multiple layout (grid) properties moved to Layout menu
* Small Multiple label properties moved to Heading menu
* "Zebra stripe" = "Alternate Background Color"
* Alternate Backround Color can now be applied by column (original/default), by row, or across each small mutliple
* Context menu available
* Drilldown/expand on small multiple field is available
* If you have a drillthrough page featuring the small multiple field, the visual will allow drillthrough via context menu
* Standard tooltip configuration is now available, plus support for canvas tooltips
* Implicit sorting has been removed and the user can now manage this using the standard menu
* You can configure stroke width/shape and style for all lines, and independently. Colours have moved into this menu too.
* Localised all capabilities
* Flow or Fixed Columns Mode - Lots of doc here
* \# Small multiples increased to 75; axis values up from 200 to 400

Bugs fixed:
* Incorrect axis spacing when measure doesn't have a format applied in the data model
* Fixed issues with label sizing and fit within small multiple
* Fixed title/unit/both issue when enum issue when y-axis display units are not set
* Fixed issues with border clipping
* Measures will now auto-assign colours from the report theme correctly
* Only supported field types can be used for data roles
* If Small Multiple field contains (blank), then visual will now render ;)

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
    * Move line colours to lines menu + test migration
    * Start a new 'group' with heading if expanded rather than drilled (identityFields > 1)
    * Add 'target, forecast and previous' measures. If measures has > 1 these cannot be used but we get addiitonal metrics in tooltip if we use them all

Examples:

Time series
Date series
Category series
Linear series