// Power BI API references
import powerbiVisualsApi from 'powerbi-visuals-api';
import powerbi = powerbiVisualsApi;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import Fill = powerbi.Fill;

// Internal dependencies
import VisualSettings from '../settings/VisualSettings';
import Debugger from '../debug/Debugger';
import { IMigrationObject, EMigrationObjectPropertyCase } from '../propertyMigration';

/**
 * Provides means to assist with the Power BI `dataView`.
 */
export default class DataViewHelper {
    /**
     * Gets property value for a particular metadata column.
     *
     * @param column        Desired column to retireve objects from
     * @param objectName    Name of desired object.
     * @param propertyName  Name of desired property.
     * @param defaultValue  Default value of desired property.
     */
    static GET_METADATA_OBJECT_VALUE<T>(
        column: DataViewMetadataColumn,
        objectName: string,
        propertyName: string,
        defaultValue: T
    ): T {
        let objects = column.objects;
        if (objects) {
            let object = objects[objectName];
            if (object) {
                let property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }
        return defaultValue;
    }

    /**
     * For the supplied details, performs a mapping of source objects/properties to destinations
     *
     * @param dataView          Data view to search for objects/properties
     * @param host              Host services to use for object persistence
     * @param migrationList     Source/desintation mappings
     * @param targetVersion     Version number to apply to metadata to confirm migration has been applied
     */
    static MIGRATE_OBJECT_PROPERTIES(
        dataView: DataView,
        host: IVisualHost,
        migrationList: IMigrationObject[],
        targetVersion: number
    ) {
        Debugger.LOG('Performing property migration');
        Debugger.LOG('Target version', targetVersion);

        // We'll use this to accumulate changes to make to the object instances
        let changes: powerbi.VisualObjectInstancesToPersist = {
            replace: [],
            remove: []
        };

        // Step over our objects/properties, test and add changes accordingly
        migrationList.map((m, mi) => {
            Debugger.LOG(`Checking if migration needed for legacy object: ${m.source.object}.${m.source.property}...`);
            if (
                dataView.metadata &&
                dataView.metadata.objects &&
                dataView.metadata.objects.hasOwnProperty(`${m.source.object}`) &&
                dataView.metadata.objects[m.source.object].hasOwnProperty(`${m.source.property}`) &&
                dataView.metadata.objects[m.source.object][m.source.property] !==
                    VisualSettings.getDefault()[m.source.object][m.source.property]
            ) {
                Debugger.LOG(
                    `Adding migration ${m.source.object}.${m.source.property} to ${m.destination.object}.${m.destination.property} to changes...`
                );

                // Placeholder objects and results if already created for our source/destination
                let replace = DataViewHelper.newVisualObjectInstance(m.destination.object),
                    repi = changes.replace.filter(c => c.objectName === m.destination.object),
                    remove = DataViewHelper.newVisualObjectInstance(m.source.object),
                    remi = changes.remove.filter(c => c.objectName === m.source.object);

                /**
                 *  Add/update appropriate object for destination. Note that colours behave differently to the standard enumeration push
                 *  (where we would supply the entire `Fill` object). For these cases, we extract the hex code and supply just that, otherwise
                 *  the properties pane generates an error.
                 */
                if (!repi.length) {
                    switch (m.objectCase) {
                        case EMigrationObjectPropertyCase.Colour: {
                            replace.properties[m.destination.property] =
                                dataView.metadata.objects[m.source.object][m.source.property]['solid']['color'];
                            break;
                        }
                        default: {
                            replace.properties[m.destination.property] =
                                dataView.metadata.objects[m.source.object][m.source.property];
                            break;
                        }
                    }
                    changes.replace.push(replace);
                } else {
                    repi[0].properties[m.destination.property] =
                        dataView.metadata.objects[m.source.object][m.source.property];
                }

                // Add/update appropriate object for source
                if (!remi.length) {
                    remove.properties[m.source.property] = null;
                    changes.remove.push(remove);
                } else {
                    remi[0].properties[m.source.property] = null;
                }
            } else {
                Debugger.LOG(`Property doesn't need to be migrated. Skipping...`);
            }
        });

        /**
         *  In v2 we introduce a 'width' layout mode, but before this we relied on maximumMultiplesPerRow to manage this, so we need to manually
         *  override if maximumMultiplesPerRow is still set, so as not to confuse the end-user. We've also moved the measure-based colouring into
         *  the newer Line Styling menu, which consolidates shapes and colours in a single place.
         */
        if (targetVersion === 2) {
            changes.replace.map(c => {
                if (c.properties.numberOfColumns) {
                    Debugger.LOG("Hard setting horizontal grid mode to 'column'...");
                    c.properties.horizontalGrid = 'column';
                    Debugger.LOG("Hard setting vertical grid mode to 'fit'...");
                    c.properties.verticalGrid = 'fit';
                }
            });
            changes = DataViewHelper.migrateColourValues(dataView, changes);
        }

        // Add in target version
        changes.replace.push({
            objectName: 'features',
            selector: null,
            properties: {
                objectVersion: targetVersion
            }
        });

        if (changes.remove.length || changes.replace.length) {
            Debugger.LOG('Changes to make', changes);
            host.persistProperties(changes);
        } else {
            Debugger.LOG('No migrations to apply!');
        }
    }

    /**
     * Migrates colour properties from the legacy property menu to the new measure-based one.
     * @param dataView  - the `DataView` to process
     * @param changes
     */
    private static migrateColourValues(dataView: powerbi.DataView, changes: powerbi.VisualObjectInstancesToPersist) {
        Debugger.LOG('Migrating data colours...');
        dataView.metadata.columns
            .filter(c => c.roles.values && c.objects && c.objects.colorSelector && c.objects.colorSelector.fill)
            .map(m => {
                changes.replace.push({
                    objectName: 'lines',
                    selector: {
                        metadata: m.queryName
                    },
                    properties: {
                        stroke: (<Fill>m.objects.colorSelector.fill).solid.color
                    }
                });
                changes.remove.push({
                    objectName: 'colorSelector',
                    selector: {
                        metadata: m.queryName
                    },
                    properties: {
                        fill: null
                    }
                });
            });
        return changes;
    }

    /**
     * Creates a new template `VisualObjectInstance` for the specified `IMigrationObject`
     * @param objectName - name of the object to template
     */
    private static newVisualObjectInstance(objectName: string): powerbi.VisualObjectInstance {
        return {
            objectName: objectName,
            selector: null,
            properties: {}
        };
    }
}
