import { LayoutMode } from "./enums";

export interface ISmallMultipleLayoutOptions {
    mode: LayoutMode;
    chartWidth?: number;
    smallMultipleWidth?: number;
    columnCap?: number;
    columnSpacing?: number;
}

export interface ISmallMultipleLayout {
    grid: ISmallMultipleGrid;
}

export interface ISmallMultipleGrid {
    rows: number;
    columns: number;
}