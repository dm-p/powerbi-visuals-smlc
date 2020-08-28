// Power BI API references
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ISelectionId = powerbi.visuals.ISelectionId;

// Internal dependencies
    import MeasureRole from './MeasureRole';

/**
 * Handles the display or an individual measure value within our visual.
 */
    export default interface ISmallMultipleMeasureValue {
        index: number;
        category: string | number | Date;
        value: number;
        tooltip?: VisualTooltipDataItem;
        selectionId?: ISelectionId;
        role: MeasureRole;
    }