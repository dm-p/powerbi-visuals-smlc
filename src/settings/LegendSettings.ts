// Internal dependencies
   import { visualConstants } from '../visualConstants';
   let defaults = visualConstants.defaults;

/**
 * Manages properties to display the legend in the visual.
 */
    export default class LegendSettings {
      // Show legend.
         public show: boolean = true;
      // Position of the legend within the visual container.
         public position: string = defaults.legend.position;
      // Show the legend title before the series.
         public showTitle: boolean = defaults.legend.showTitle;
      // Manual title text to overload, if required.
         public titleText: string = defaults.legend.titleText;
      // Include X-ranges.
         public includeRanges: boolean = defaults.legend.includeRanges;
      // Font colour.
         public fontColor: string = defaults.font.colour;
      // Text size.
         public fontSize: number = defaults.legend.fontSize;
    }