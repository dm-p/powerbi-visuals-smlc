/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    let defaultFontSize: number = 11;
    let defaultFontFamily: string = '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif';
    let defaultFontColor: string = '#C8C8C8';
    let defaultAxisFontColor: string = '#777777';
    let defaultAxisGridlineColor: string = '#EAEAEA';

    export class VisualSettings extends DataViewObjectsParser {
      public debug: debugSettings = new debugSettings();
      public smallMultiple: smallMultipleSettings = new smallMultipleSettings();
      public colorSelector: colorSelectorSettings = new colorSelectorSettings();
      public yAxis: yAxisSettings = new yAxisSettings();
    }

    export class debugSettings {
      public show: boolean = true;
    }

    export class colorSelectorSettings {

    }

    export class smallMultipleSettings {
      // Show label
      public showMultipleLabel: boolean = true;
      // Font color
      public fontColor: string = defaultAxisFontColor;
      // Alignment
      public labelAlignment: string = 'center';
      // Text Size
      public fontSize: number = defaultFontSize;
      // Font
      public fontFamily: string = defaultFontFamily;
      // Maximum multiples per row
      public maximumMultiplesPerRow: number = null;
      
      // No capabilities, so not in the properties pane, but still accessible

        // Required height for multiple label
        public labelHeight: number = 0;

    }

    

    export class axisSettings {
      // Show whole axis
      public show: boolean = true;
      // Font color
      public fontColor: string = defaultAxisFontColor;
      // Text Size
      public fontSize: number = defaultFontSize;
      // Font
      public fontFamily: string = defaultFontFamily;
      // Display Units
      public labelDisplayUnits: number = 0;
      // Precision
      public precision: number = null;
      // TODO: Title
      // Gridlines toggle
      public gridlines: boolean = true;
      // Gridline colour
      public gridlineColor: string = defaultAxisGridlineColor;
      // Gridline stroke width
      public gridlineStrokeWidth: number = 1;
      // Gridline line style
      public gridlineStrokeLineStyle: string = 'solid';
      // No capabilities, so not in the properties pane, but still accessible

        // Axis number format
        public numberFormat: utils.formatting.IValueFormatter;

    }

    // Independent of the toggle
    export class yAxisSettings extends axisSettings {
      // Axis range start
      public start: number = null;
      // Axis range end
      public end: number = null;
      
      // No capabilities, so not in the properties pane, but still accessible

        // Specified width of y-axis
        public width: number = 0;

    }




}
