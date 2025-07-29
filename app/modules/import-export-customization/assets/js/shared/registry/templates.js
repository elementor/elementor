class TemplateRegistry {
    constructor() {
        this.templateTypes = new Map();
    }

    register( templateType ) {
        if ( ! templateType.key || ! templateType.title ) {
            throw new Error( 'Template type must have key and title' );
        }

        this.templateTypes.set( templateType.key, {
            key: templateType.key,
            title: templateType.title,
            description: templateType.description || '',
            useParentDefault: templateType.useParentDefault !== false,
            getInitialState: templateType.getInitialState || null,
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

            if ( templateType.getInitialState ) {
                state[ templateType.key ] = templateType.getInitialState( includes, parentInitialState );
                return;
            }

            // Default: simple object with enabled property
            const enabled = templateType.useParentDefault ? parentInitialState : false;
            state[ templateType.key ] = { enabled };
        } );

        return state;
    }
}

export const templateRegistry = new TemplateRegistry();
