// Power BI API Dependencies
    import 'core-js/stable';
    import './../style/visual.less';
    import powerbiVisualsApi from 'powerbi-visuals-api';
    import powerbi = powerbiVisualsApi;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataView = powerbi.DataView;
    import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import IVisualEventService = powerbi.extensibility.IVisualEventService;
    import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
    import VisualUpdateType = powerbi.VisualUpdateType;
    import { createTooltipServiceWrapper } from 'powerbi-visuals-utils-tooltiputils';

// Internal Dependencies
    import VisualSettings from './settings/VisualSettings';
    import Debugger from './debug/Debugger';
    import ViewModelHandler from './viewModel/ViewModelHandler';
    import ChartHelper from './dom/ChartHelper';
    import { visualConstants } from './visualConstants';
    import { objectMigrationV1ToV2 } from './propertyMigration';
    import DataViewHelper from './dataView/DataViewHelper';
    import LandingPageHandler from './dom/LandingPageHandler';

    export class Visual implements IVisual {
        // The root element for the entire visual
            private visualContainer: HTMLElement;
        // Visual host services
            private host: IVisualHost;
        // Parsed visual settings
            private settings: VisualSettings;
        // Handle rendering events
            private events: IVisualEventService;
        // Handle localisation of visual text
            private localisationManager: ILocalizationManager;
        // Keeps our view model managed
            private viewModelHandler: ViewModelHandler;
        // Manages drawing stuff in our visual
            private chartHelper: ChartHelper;
        // Handles landing page
            private landingPageHandler: LandingPageHandler;

        // Runs when the visual is initialised
            constructor(options: VisualConstructorOptions) {
                this.host = options.host;
                this.visualContainer = options.element;

                try {

                    this.viewModelHandler = new ViewModelHandler(this.host);
                    this.localisationManager = this.host.createLocalizationManager();
                    this.chartHelper = new ChartHelper(this.visualContainer);
                    this.landingPageHandler = new LandingPageHandler(this.chartHelper.landingContainer, this.localisationManager);
                    this.chartHelper.host = this.host;
                    this.chartHelper.selectionManager = this.host.createSelectionManager();
                    this.chartHelper.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
                    this.events = this.host.eventService;
                    Debugger.LOG('Visual constructor ran successfully :)');

                } catch (e) {

                    // Signal that we've encountered an error
                        Debugger.HEADING('Rendering failed');
                        Debugger.LOG(e);

                }
            }

        // Runs when data roles added or something changes
            public update(options: VisualUpdateOptions) {

                // Handle main update flow
                    try {

                        // Signal we've begun rendering
                            this.events.renderingStarted(options);
                            this.chartHelper.clearChart();
                            Debugger.CLEAR();
                            Debugger.HEADING('Visual update');
                            Debugger.LOG(`Update type: ${options.type}`);
                            Debugger.LOG('Edit Mode', options.editMode, options.editMode ? '(Editor On)' : '(Editor Off)');

                        // Parse the settings for use in the visual
                            Debugger.LOG('Parsing settings...');
                            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0], this.host);
                            this.viewModelHandler.settings = this.chartHelper.settings = this.settings;
                            Debugger.LOG('Settings', this.settings);
                            Debugger.FOOTER();

                        // Initialise view model and test
                            switch (options.type) {
                                case VisualUpdateType.Data:
                                case VisualUpdateType.All: {
                                    Debugger.LOG('Data changed. We need to re-map from data view...');
                                    this.viewModelHandler.validateDataViewMapping(options);
                                    if (this.viewModelHandler.viewModel.dataViewIsValid) {
                                        this.viewModelHandler.mapDataView();
                                        this.viewModelHandler.populateLegend();
                                    }
                                    break;
                                }
                                default: {
                                    Debugger.LOG('No need to re-map data. Skipping over...');
                                }
                            }
                            this.chartHelper.viewModel = this.viewModelHandler.viewModel;

                        // Test viewport
                            if (    options.viewport.width < visualConstants.visual.minPx
                                ||  options.viewport.height < visualConstants.visual.minPx
                            ) {
                                Debugger.LOG('Visual is too small to render!');
                                this.chartHelper.renderLegend();
                                this.chartHelper.displayMinimised(this.landingPageHandler);
                                this.events.renderingFinished(options);
                                return;
                            }

                        // If we're good to go, let's plot stuff
                            if (this.viewModelHandler.viewModel.dataViewIsValid) {
                                Debugger.FOOTER();
                                Debugger.LOG('Drawing Chart');
                                Debugger.LOG('Passing initial viewport...');
                                this.viewModelHandler.viewModel.initialViewport = this.viewModelHandler.viewModel.viewport = options.viewport;
                                this.chartHelper.renderLegend();
                                this.landingPageHandler.handleLandingPage(options, this.host);
                                this.viewModelHandler.calculateInitialViewport();
                                this.viewModelHandler.initialiseAxes();
                                this.viewModelHandler.resolveAxisTitles();
                                this.viewModelHandler.resolveVisualViewport();
                                this.viewModelHandler.resolveChartArea();
                                this.chartHelper.addMasterAxisContainers();
                                this.chartHelper.sizeContainer();
                                this.chartHelper.addCanvas();
                                this.chartHelper.renderMasterAxes();
                                this.chartHelper.renderSmallMultiples();
                            } else {
                                Debugger.LOG('View model is not valid!');
                                this.chartHelper.renderLegend();
                                this.landingPageHandler.handleLandingPage(options, this.host);
                            }

                        // Signal that we've finished rendering
                            this.events.renderingFinished(options);
                            Debugger.LOG('Finished rendering');
                            Debugger.LOG('View Model', this.viewModelHandler.viewModel);
                            Debugger.FOOTER();
                            return;

                    } catch (e) {

                        // Signal that we've encountered an error
                            this.events.renderingFailed(options, e);
                            Debugger.HEADING('Rendering failed');
                            Debugger.LOG('View Model', this.viewModelHandler.viewModel);
                            Debugger.LOG(e);

                    }

            }

            private static parseSettings(dataView: DataView, host: IVisualHost): VisualSettings {

                if (!dataView) {
                    return;
                }

                let objects = dataView && dataView.metadata && dataView.metadata.objects;

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
                        Debugger.LOG('v2 object schema unconfirmed. Existing v1 properties will be migrated.');
                        DataViewHelper.MIGRATE_OBJECT_PROPERTIES(dataView, host, objectMigrationV1ToV2, 2);
                    } else {
                        Debugger.LOG('Object schema is already on v2. No need to set up.');
                    }

                    return VisualSettings.parse(dataView);
            }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         */
            public enumerateObjectInstances(
                options: EnumerateVisualObjectInstancesOptions
            ): VisualObjectInstanceEnumeration {
                let instances = (
                        <VisualObjectInstanceEnumerationObject>VisualSettings.enumerateObjectInstances(
                            this.settings || VisualSettings.getDefault(),
                            options
                        )
                    ).instances,
                    objectName = options.objectName,
                    enumerationObject: VisualObjectInstanceEnumerationObject = {
                        containers: [],
                        instances: instances,
                    };
                Debugger.FOOTER();
                Debugger.LOG(`Object Enumeration: ${objectName}`);

                // We try where possible to use the standard method signature to process the instance, but there are some exceptions...
                    switch (objectName) {
                        case 'yAxis': {
                            enumerationObject = this.settings.yAxis.processEnumerationObject(
                                enumerationObject,
                                {
                                    numberFormat: this.viewModelHandler.viewModel.yAxis.numberFormat,
                                    axisLabelPlacement: this.settings.features.axisLabelPlacement
                                }
                            );
                            break;
                        }
                        case 'xAxis': {
                            enumerationObject = this.settings.xAxis.processEnumerationObject(
                                enumerationObject,
                                {
                                    axisLabelPlacement: this.settings.features.axisLabelPlacement
                                }
                            );
                            break;
                        }
                        case 'heading': {
                            enumerationObject = this.settings.heading.processEnumerationObject(
                                enumerationObject,
                                {
                                    zebraStripe: this.settings.smallMultiple.zebraStripe
                                }
                            )
                            break;
                        }
                        case 'lines': {
                            enumerationObject = this.settings.lines.processEnumerationObject(
                                enumerationObject,
                                {
                                    measures: this.viewModelHandler.viewModel.measureMetadata
                                }
                            )
                            break;
                        }
                        default: {
                            // Check to see if the class has our method for processing business logic and run it if so
                                if (typeof this.settings[`${objectName}`].processEnumerationObject === 'function') {
                                    Debugger.LOG('processEnumerationObject found. Executing...');
                                    enumerationObject = this.settings[`${objectName}`].processEnumerationObject(enumerationObject);
                                } else {
                                    Debugger.LOG('Couldn\'t find class processEnumerationObject function.');
                                }
                            break;
                        }
                    }

                Debugger.LOG('Enumeration Object', enumerationObject);
                return enumerationObject;

            }
    }