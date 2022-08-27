export interface IMigrationObject {
    source?: IMigrationObjectProperty;
    destination: IMigrationObjectProperty;
    objectCase: EMigrationObjectPropertyCase;
}

export interface IMigrationObjectProperty {
    object: string;
    property: string;
}

export enum EMigrationObjectPropertyCase {
    Standard = 0,
    Colour = 10
}

export const objectMigrationV1ToV2: IMigrationObject[] = [
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'spacingBetweenColumns'
        },
        destination: {
            object: 'layout',
            property: 'spacingBetweenColumns'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'spacingBetweenRows'
        },
        destination: {
            object: 'layout',
            property: 'spacingBetweenRows'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'maximumMultiplesPerRow'
        },
        destination: {
            object: 'layout',
            property: 'numberOfColumns'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'showMultipleLabel'
        },
        destination: {
            object: 'heading',
            property: 'show'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Colour,
        source: {
            object: 'smallMultiple',
            property: 'fontColor'
        },
        destination: {
            object: 'heading',
            property: 'fontColour'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Colour,
        source: {
            object: 'smallMultiple',
            property: 'fontColorAlternate'
        },
        destination: {
            object: 'heading',
            property: 'fontColourAlternate'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'labelPosition'
        },
        destination: {
            object: 'heading',
            property: 'labelPosition'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'labelAlignment'
        },
        destination: {
            object: 'heading',
            property: 'labelAlignment'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'fontSize'
        },
        destination: {
            object: 'heading',
            property: 'fontSize'
        }
    },
    {
        objectCase: EMigrationObjectPropertyCase.Standard,
        source: {
            object: 'smallMultiple',
            property: 'fontFamily'
        },
        destination: {
            object: 'heading',
            property: 'fontFamily'
        }
    }
];
