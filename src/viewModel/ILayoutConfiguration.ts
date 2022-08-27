// Power BI API Dependencies
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import IViewport = powerbi.IViewport;

// Internal dependencies
import { ISmallMultiplesLayout } from '../smallMultiple/interfaces';

/**
 * Used to manage the layout of the visual at a high-level.
 */
export default interface ILayoutConfiguration {
    smallMultiples: ISmallMultiplesLayout;
    visualViewport: IViewport;
    chartViewport: IViewport;
    minimumViewport: IViewport;
    x: number;
    y: number;
}
