/** Power BI API Dependencies */
    import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
    import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

/** Internal dependencies */
    import { VisualConstants } from '../constants';
    import SmallMultipleSettings from './SmallMultipleSettings';
    import LegendSettings from './LegendSettings';
    import ColorSelectorSettings from './ColorSelectorSettings';
    import LineSettings from './LineSettings';
    import ValueAxisSettings from './ValueAxisSettings';
    import CategoryAxisSettings from './CategoryAxisSettings';
    import LayoutSettings from './LayoutSettings';
    import HeadingSettings from './HeadingSettings';
    import FeatureSettings from './FeatureSettings';

/** Holds all visual objects/settings */
    export default class VisualSettings extends DataViewObjectsParser {
        public layout: LayoutSettings = new LayoutSettings();
        public heading: HeadingSettings = new HeadingSettings();
        public smallMultiple: SmallMultipleSettings = new SmallMultipleSettings();
        public legend: LegendSettings = new LegendSettings();
        public colorSelector: ColorSelectorSettings = new ColorSelectorSettings();
        // public lines: LineSettings = new LineSettings();
        public yAxis: ValueAxisSettings = new ValueAxisSettings();
        public xAxis: CategoryAxisSettings = new CategoryAxisSettings();
        public features: FeatureSettings = new FeatureSettings();
    }