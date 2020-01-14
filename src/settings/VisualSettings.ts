/** Power BI API Dependencies */
    import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
    import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

/** Internal dependencies */
    import SmallMultiplesStylingSettings from '../smallMultiple/SmallMultiplesStylingSettings';
    import LegendSettings from './LegendSettings';
    import ColorSelectorSettings from './ColorSelectorSettings';
    import LineSettings from './LineSettings';
    import ValueAxisSettings from './ValueAxisSettings';
    import CategoryAxisSettings from './CategoryAxisSettings';
    import SmallMultiplesLayoutSettings from '../smallMultiple/SmallMultiplesLayoutSettings';
    import SmallMultiplesHeadingSettings from '../smallMultiple/SmallMultiplesHeadingSettings';
    import FeatureSettings from './FeatureSettings';

/** Holds all visual objects/settings */
    export default class VisualSettings extends DataViewObjectsParser {
        public layout: SmallMultiplesLayoutSettings = new SmallMultiplesLayoutSettings();
        public heading: SmallMultiplesHeadingSettings = new SmallMultiplesHeadingSettings();
        public smallMultiple: SmallMultiplesStylingSettings = new SmallMultiplesStylingSettings();
        public legend: LegendSettings = new LegendSettings();
        public colorSelector: ColorSelectorSettings = new ColorSelectorSettings();
        /** public lines: LineSettings = new LineSettings(); */
        public yAxis: ValueAxisSettings = new ValueAxisSettings();
        public xAxis: CategoryAxisSettings = new CategoryAxisSettings();
        public features: FeatureSettings = new FeatureSettings();
    }