/** Power BI API Dependencies */
    import 'core-js/stable';
    import './../style/visual.less';
    import powerbi from 'powerbi-visuals-api';
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataView = powerbi.DataView;
    import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import IVisualEventService = powerbi.extensibility.IVisualEventService;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
    import VisualUpdateType = powerbi.VisualUpdateType;
    import { createTooltipServiceWrapper } from 'powerbi-visuals-utils-tooltiputils';

/** Internal Dependencies */
    import VisualSettings from './settings/VisualSettings';
    import VisualDebugger from './debug/VisualDebugger';
    import ViewModelHandler from './viewModel/ViewModelHandler';
    import ChartHelper from './dom/ChartHelper';
    import { VisualConstants } from './constants';
    import { objectMigrationV1ToV2 } from './propertyMigration';
    import DataViewHelper from './dataView/DataViewHelper';

    export class Visual implements IVisual {
        /** The root element for the entire visual */
            private visualContainer: HTMLElement;
        /** Visual host services */
            private host: IVisualHost;
        /** Parsed visual settings */
            private settings: VisualSettings;
        /** Handle rendering events */
            private events: IVisualEventService;
        /** Handle localisation of visual text */
            private localisationManager: ILocalizationManager;
        /** Debugger (runs if we've set the debug flag in code) */
            private debug: VisualDebugger;
        /** Keeps our view model managed */
            private viewModelHandler: ViewModelHandler;
        /** Manages drawing stuff in our visual */
            private chartHelper: ChartHelper;

        /** Runs when the visual is initialised */
            constructor(options: VisualConstructorOptions) {
                this.host = options.host;
                this.visualContainer = options.element;
                this.debug = new VisualDebugger(VisualConstants.debug);
                this.viewModelHandler = new ViewModelHandler(this.host);
                this.localisationManager = this.host.createLocalizationManager();
                this.chartHelper = new ChartHelper(this.visualContainer);
                this.chartHelper.host = this.host;
                this.chartHelper.selectionManager = this.host.createSelectionManager();
                this.chartHelper.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
                this.events = this.host.eventService;
            }

        /** Runs when data roles added or something changes */
            public update(options: VisualUpdateOptions) {

                /** Handle main update flow */
                    try {

                        /** Signal we've begun rendering */
                            this.events.renderingStarted(options);
                            this.chartHelper.clearChart();
                            this.debug.clear();
                            this.debug.heading('Visual update');
                            this.debug.log(`Update type: ${options.type}`);
                            this.debug.log('Edit Mode', options.editMode, options.editMode ? '(Editor On)' : '(Editor Off)');

                        /** Parse the settings for use in the visual */
                            this.debug.log('Parsing settings...');
                            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0], this.host, this.debug);
                            this.viewModelHandler.settings = this.chartHelper.settings = this.settings;
                            this.debug.log('Settings', this.settings);
                            this.debug.footer();

                        /** Initialise view model and test */
                            switch (options.type) {
                                case VisualUpdateType.Data:
                                case VisualUpdateType.All: {
                                    this.debug.log('Data changed. We need to re-map from data view...');
                                    this.viewModelHandler.validateDataViewMapping(options);
                                    if (this.viewModelHandler.viewModel.dataViewIsValid) {
                                        this.viewModelHandler.mapDataView();
                                        this.viewModelHandler.populateLegend();
                                        /** Additional stuff */
                                    }
                                    break;
                                }
                                default: {
                                    this.debug.log('No need to re-map data. Skipping over...');
                                }
                            }
                            this.chartHelper.viewModel = this.viewModelHandler.viewModel;

                        /** If we're good to go, let's plot stuff */
                            if (this.viewModelHandler.viewModel.dataViewIsValid) {
                                this.debug.footer();
                                this.debug.log('Drawing Chart');
                                this.debug.log('Passing initial viewport...');
                                this.viewModelHandler.viewModel.initialViewport = this.viewModelHandler.viewModel.viewport = options.viewport;
                                this.chartHelper.renderLegend();
                                this.viewModelHandler.calculateInitialViewport();
                                this.viewModelHandler.initialiseAxes();
                                this.viewModelHandler.resolveAxisTitles();
                                this.viewModelHandler.resolveVisualViewport();
                                this.viewModelHandler.resolveChartArea();
                                this.chartHelper.addMasterAxisContainers();
                                this.chartHelper.sizeContainer(); /** This needs fixing for calcluated viewport */
                                this.chartHelper.addCanvas();
                                this.chartHelper.renderMasterAxes();
                                this.chartHelper.renderSmallMultiples();
                            } else {
                                this.debug.log('View model is not valid!');
                                this.chartHelper.renderLegend();
                            }

                        /** Signal that we've finished rendering */
                            this.events.renderingFinished(options);
                            this.debug.log('Finished rendering');
                            this.debug.log('View Model', this.viewModelHandler.viewModel);
                            this.debug.footer();
                            return;

                    } catch (e) {

                        /** Signal that we've encountered an error */
                            this.events.renderingFailed(options, e);
                            this.debug.heading('Rendering failed');
                            this.debug.log('View Model', this.viewModelHandler.viewModel);
                            this.debug.log(e);

                    }

            }

            private static parseSettings(dataView: DataView, host: IVisualHost, debug: VisualDebugger): VisualSettings {

                let objects = dataView.metadata.objects;

                /** All Small Multiple configuration used to be underneath a single menu in 1.0. A lot of this has since been refactored
                 *  into more specific locations. However, we need to ensure that any user-defined properties are migrated across to their
                 *  correct location and removed for subsequent versions. If we don't remove them, 'reset to default' will fall back to the
                 *  'pre-migration' values and potentially confuse the end-user.
                 */
                    if (    !objects
                        ||  !objects.features
                        ||  !objects.features.objectVersion
                        ||  objects.features.objectVersion < 2
                    ) {
                        debug.log('v2 object schema unconfirmed. Existing v1 properties will be migrated.');
                        DataViewHelper.migrateObjectProperties(dataView, host, objectMigrationV1ToV2, debug, 2);
                    } else {
                        debug.log('Object schema is already on v2. No need to set up.');
                    }

                    return VisualSettings.parse(dataView) as VisualSettings;
            }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         *
         */
            public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstanceEnumeration {
                let instances: VisualObjectInstance[] = (
                    VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options) as VisualObjectInstanceEnumerationObject).instances;
                let objectName = options.objectName;
                
                const enumerationObject: powerbi.VisualObjectInstanceEnumerationObject = {
                    containers: [],
                    instances: [],
                };

                switch (objectName) {

                    case 'yAxis': {

                        /** Range validation */
                            instances[0].validValues = instances[0].validValues || {};
                            instances[0].validValues.precision = {
                                numberRange: {
                                    min: VisualConstants.ranges.precision.min,
                                    max: VisualConstants.ranges.precision.max
                                },
                            };
                            instances[0].validValues.gridlineStrokeWidth = {
                                numberRange: {
                                    min: VisualConstants.ranges.gridlineStrokeWidth.min,
                                    max: VisualConstants.ranges.gridlineStrokeWidth.max
                                },
                            };

                        /** Label toggle */
                            if (!this.settings.yAxis.showLabels) {
                                delete instances[0].properties['labelPlacement'];
                                delete instances[0].properties['fontColor'];
                                delete instances[0].properties['fontSize'];
                                delete instances[0].properties['fontFamily'];
                                delete instances[0].properties['labelDisplayUnits'];
                                delete instances[0].properties['precision'];
                            }

                        /** Gridline toggle */
                            if (!this.settings.yAxis.gridlines) {
                                delete instances[0].properties['gridlineColor'];
                                delete instances[0].properties['gridlineStrokeWidth'];
                                delete instances[0].properties['gridlineStrokeLineStyle'];
                            }

                        /** Title toggle */
                            if (!this.settings.yAxis.showTitle) {
                                delete instances[0].properties['titleStyle'];
                                delete instances[0].properties['titleColor'];
                                delete instances[0].properties['titleText'];
                                delete instances[0].properties['titleFontSize'];
                                delete instances[0].properties['titleFontFamily'];
                            }

                        /** Title style toggle if units are none */
                            if (this.settings.yAxis.labelDisplayUnits === 1 || !this.viewModelHandler.viewModel.yAxis.numberFormat.displayUnit) {
                                instances[0].properties['titleStyle'] = 'title';
                                instances[0].validValues.titleStyle = [
                                    'title'
                                ];
                            }

                        /** Axis placement */
                            if (!this.settings.features.axisLabelPlacement) {
                                delete instances[0].properties['labelPlacement'];
                            }

                        break;
                    }

                    case 'xAxis': {

                        /** Range validation */
                            instances[0].validValues = instances[0].validValues || {};
                            instances[0].validValues.gridlineStrokeWidth = {
                                numberRange: {
                                    min: VisualConstants.ranges.gridlineStrokeWidth.min,
                                    max: VisualConstants.ranges.gridlineStrokeWidth.max
                                },
                            };
                            instances[0].validValues.axisLineStrokeWidth = {
                                numberRange: {
                                    min: VisualConstants.ranges.axisLineStrokeWidth.min,
                                    max: VisualConstants.ranges.axisLineStrokeWidth.max
                                },
                            };

                        /** Label toggle */
                            if (!this.settings.xAxis.showLabels) {
                                delete instances[0].properties['labelPlacement'];
                                delete instances[0].properties['fontColor'];
                                delete instances[0].properties['fontSize'];
                                delete instances[0].properties['fontFamily'];
                            }

                        /** Gridline toggle */
                            if (!this.settings.xAxis.gridlines) {
                                delete instances[0].properties['gridlineColor'];
                                delete instances[0].properties['gridlineStrokeWidth'];
                                delete instances[0].properties['gridlineStrokeLineStyle'];
                            }

                        /** Title toggle */
                            if (!this.settings.xAxis.showTitle) {
                                delete instances[0].properties['titleColor'];
                                delete instances[0].properties['titleText'];
                                delete instances[0].properties['titleFontSize'];
                                delete instances[0].properties['titleFontFamily'];
                            }

                        /** Axis line toggle */
                            if (!this.settings.xAxis.showAxisLine) {
                                delete instances[0].properties['axisLineColor'];
                                delete instances[0].properties['axisLineStrokeWidth'];
                            }

                        /** Axis placement */
                            if (!this.settings.features.axisLabelPlacement) {
                                delete instances[0].properties['labelPlacement'];
                            }

                        break;
                    }

                    case 'colorSelector': {

                        /** No longer needed, as all properties have been migrated */
                            instances = [];

                        break;

                    }

                    case 'lines': {

                        /** Remove default instance, and replace with measure-based properties */
                            instances = [];
                            for (let measure of this.viewModelHandler.viewModel.measureMetadata) {
                                let displayName = measure.metadata.displayName,
                                    containerIdx = enumerationObject.containers.push({displayName: displayName}) - 1;
                                instances.push({
                                    objectName: objectName,
                                    properties: {
                                        stroke: {
                                            solid: {
                                                color: measure.stroke
                                            }
                                        },
                                        strokeWidth: measure.strokeWidth,
                                        lineShape: measure.lineShape,
                                        lineStyle: measure.lineStyle
                                    },
                                    selector: {
                                        metadata: measure.metadata.queryName
                                    },
                                    containerIdx: containerIdx,
                                    validValues: {
                                        strokeWidth: {
                                            numberRange: {
                                                min: VisualConstants.ranges.shapeStrokeWidth.min,
                                                max: VisualConstants.ranges.shapeStrokeWidth.max
                                            }
                                        }
                                    }
                                });
                            }

                        break;
                    }

                    case 'legend': {

                        /** Title toggle */
                            if (!this.settings.legend.showTitle) {
                                delete instances[0].properties['titleText'];
                                delete instances[0].properties['includeRanges'];
                            }

                        break;
                    }

                    case 'layout': {

                        /** Range validation */
                            instances[0].validValues = instances[0].validValues || {};
                            instances[0].validValues.spacingBetweenColumns = {
                                numberRange: {
                                    min: VisualConstants.ranges.spacing.min,
                                    max: VisualConstants.ranges.spacing.max
                                },
                            };
                            instances[0].validValues.spacingBetweenRows = {
                                numberRange: {
                                    min: VisualConstants.ranges.spacing.min,
                                    max: VisualConstants.ranges.spacing.max
                                }
                            };
                            instances[0].validValues.numberOfColumns = {
                                numberRange: {
                                    min: VisualConstants.ranges.numberOfColumns.min,
                                    max: VisualConstants.ranges.numberOfColumns.max
                                }
                            };
                            instances[0].validValues.multipleHeight =
                            instances[0].validValues.multipleWidth = {
                                numberRange: {
                                    min: VisualConstants.ranges.multipleSize.min,
                                    max: VisualConstants.ranges.multipleSize.max
                                }
                            };

                        /** Manage flow options */
                            switch (this.settings.layout.mode) {
                                case 'column': {
                                    /** Row spacing */
                                        if (!this.settings.layout.numberOfColumns) {
                                            delete instances[0].properties['spacingBetweenRows'];
                                        }
                                    /** No setting of width or height */
                                        delete instances[0].properties['multipleWidth'];
                                        delete instances[0].properties['multipleHeight'];
                                    break;
                                }
                                case 'flow': {
                                    delete instances[0].properties['numberOfColumns'];
                                    break;
                                }
                            }
                        break;

                    }

                    case 'heading': {
                        /** Banded multiples toggle */
                        if (!this.settings.smallMultiple.zebraStripe) {
                            delete instances[0].properties['fontColourAlternate'];
                        }
                        break;
                    }

                    case 'smallMultiple': {

                        /** Conceal previously shown properties that have since been moved */
                            delete instances[0].properties['showMultipleLabel'];
                            delete instances[0].properties['spacingBetweenColumns'];
                            delete instances[0].properties['maximumMultiplesPerRow'];
                            delete instances[0].properties['spacingBetweenRows'];
                            delete instances[0].properties['labelPosition'];
                            delete instances[0].properties['labelAlignment'];
                            delete instances[0].properties['fontSize'];
                            delete instances[0].properties['fontFamily'];
                            delete instances[0].properties['fontColor'];
                            delete instances[0].properties['fontColorAlternate'];

                        /** Range validation */
                            instances[0].validValues = instances[0].validValues || {};
                            instances[0].validValues.borderStrokeWidth = {
                                numberRange: {
                                    min: VisualConstants.ranges.borderStrokeWidth.min,
                                    max: VisualConstants.ranges.borderStrokeWidth.max
                                }
                            };

                        /** Banded multiples toggle */
                            if (!this.settings.smallMultiple.zebraStripe) {
                                delete instances[0].properties['zebraStripeApply'];
                                delete instances[0].properties['backgroundColorAlternate'];
                            }

                        /** Border toggle */
                            if (!this.settings.smallMultiple.border) {
                                delete instances[0].properties['borderColor'];
                                delete instances[0].properties['borderStrokeWidth'];
                                delete instances[0].properties['borderStyle'];
                            }

                        break;
                    }

                    case 'features': {
                        if (!VisualConstants.debug) {
                            instances = [];
                        }
                        break;
                    }

                }

                enumerationObject.instances.push(...instances);
                console.log(enumerationObject);
                return enumerationObject;

            }
    }