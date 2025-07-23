class TemplateRegistry {
    constructor() {
        this.templateTypes = new Map();
    }

    register( templateType ) {
        if ( ! templateType.key || ! templateType.title ) {
            throw new Error(' Template type must have key and title' );
        }

        this.templateTypes.set( templateType.key, {
            key: templateType.key,
            title: templateType.title,
            description: templateType.description || '',
            useParentDefault: templateType.useParentDefault !== false,
            getDefaultValue: templateType.getDefaultValue || null,
            component: templateType.component || null,
            order: templateType.order || 10,
            isAvailable: templateType.isAvailable || ( () => true ),
            ...templateType,
        } );
    }

    getAll() {
        return Array.from( this.templateTypes.values() )
            .filter( ( type ) => type.isAvailable() )
            .sort( ( a, b ) => a.order - b.order );
    }

    get( key ) {
        return this.templateTypes.get( key );
    }

    getState( includes, customization, parentInitialState ) {
        const state = {};

        this.getAll().forEach( ( templateType ) => {
            if ( customization?.templates?.[ templateType.key ] !== undefined ) {
                state[ templateType.key ] = customization.templates[ templateType.key ];
                return;
            }

            if ( templateType.getDefaultValue ) {
                state[ templateType.key ] = templateType.getDefaultValue( includes, parentInitialState );
                return;
            }

            if ( templateType.useParentDefault ) {
                state[ templateType.key ] = parentInitialState;
                return;
            }

            state[ templateType.key ] = false;
        } );

        return state;
    }
}

export const templateRegistry = new TemplateRegistry();
