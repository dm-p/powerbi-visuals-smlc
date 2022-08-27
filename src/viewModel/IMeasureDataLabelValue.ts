/**
 * Used to manage the display of a data label within the visual.
 */
export default interface IMeasureDataLabelValue {
    showDataPoint: boolean;
    showValue: boolean;
    valuePosition: string;
    fontColour: string;
    showMarker: boolean;
    markerColour: string;
}
