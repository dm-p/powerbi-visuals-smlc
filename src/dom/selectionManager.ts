// Power BI API Dependencies
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import ISelectionId = powerbi.visuals.ISelectionId;

// External Dependencies
    import * as d3 from 'd3';

// Internal Dependencies
    import ISmallMultiple from '../viewModel/ISmallMultiple';
    import { visualConstants } from '../visualConstants';

    type Selection<T1, T2 = T1> = d3.Selection<any, T1, any, T2>;

    export function isSelectionIdInArray(selectionIds: ISelectionId[], selectionId: ISelectionId): boolean {
        if (!selectionIds || !selectionId) {
            return false;
        }

        return selectionIds.some((currentSelectionId: ISelectionId) => {
            return currentSelectionId.includes(selectionId);
        });
    }

    export function syncSelectionState(
        selection: Selection<ISmallMultiple>,
        selectionIds: ISelectionId[]
    ): void {
        if (!selection || !selectionIds) {
            return;
        }

        if (!selectionIds.length) {
            const opacity: number = visualConstants.defaults.selection.solidOpacity;
            selection
                .style('fill-opacity', opacity)
                .style('stroke-opacity', opacity);

            return;
        }
        
        selection.each(function (smallMultiple: ISmallMultiple) {
            const isSelected: boolean = isSelectionIdInArray(selectionIds, smallMultiple.selectionId);

            const opacity: number = isSelected
                ? visualConstants.defaults.selection.solidOpacity
                : visualConstants.defaults.selection.transparentOpacity;

            d3.select(this)
                .style('fill-opacity', opacity)
                .style('stroke-opacity', opacity);
        });
    }