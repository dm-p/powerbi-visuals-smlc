// Power BI API references
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import ISelectionId = powerbi.visuals.ISelectionId;

// Internal dependencies
import ISmallMultipleMeasure from './ISmallMultipleMeasure';
import IElementSideDimension from './IElementSideDimension';

/**
 * Used to manage the aspects of displaying an individual small multiple within our visual.
 */
export default interface ISmallMultiple {
    name: string;
    measures: ISmallMultipleMeasure[];
    highlight: boolean;
    margin: IElementSideDimension;
    spacing: IElementSideDimension;
    selectionId: ISelectionId;
    row: number;
    column: number;
    backgroundColour: string;
    titleColour: string;
}
