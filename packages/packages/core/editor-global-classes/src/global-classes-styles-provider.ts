import { generateId } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';
import {
	__dispatch as dispatch,
	__getState as getState,
	__subscribeWithSelector as subscribeWithSelector,
} from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { getCapabilities } from './capabilities';
import { GlobalClassLabelAlreadyExistsError } from './errors';
import { selectClass, selectGlobalClasses, selectOrderedClasses, slice, type StateWithGlobalClasses } from './store';

const MAX_CLASSES = 50;

export const GLOBAL_CLASSES_PROVIDER_KEY = 'global-classes';

export const globalClassesStylesProvider = createStylesProvider( {
	key: GLOBAL_CLASSES_PROVIDER_KEY,
	priority: 30,
	limit: MAX_CLASSES,
	labels: {
		singular: __( 'class', 'elementor' ),
		plural: __( 'classes', 'elementor' ),
	},
	subscribe: ( cb ) => subscribeWithSelector( ( state: StateWithGlobalClasses ) => state.globalClasses, cb ),
	capabilities: getCapabilities(),
	actions: {
		all: () => selectOrderedClasses( getState() ),
		get: ( id ) => selectClass( getState(), id ),
		resolveCssName: ( id: string ) => {
			return selectClass( getState(), id )?.label ?? id;
		},
		create: ( label ) => {
			const classes = selectGlobalClasses( getState() );

			const existingLabels = Object.values( classes ).map( ( style ) => style.label );

			if ( existingLabels.includes( label ) ) {
				throw new GlobalClassLabelAlreadyExistsError( { context: { label } } );
			}

			const existingIds = Object.keys( classes );
			const id = generateId( 'g-', existingIds );

			dispatch(
				slice.actions.add( {
					id,
					type: 'class',
					label,
					variants: [],
				} )
			);

			return id;
		},
		update: ( payload ) => {
			dispatch(
				slice.actions.update( {
					style: payload,
				} )
			);
		},
		delete: ( id ) => {
			dispatch( slice.actions.delete( id ) );
		},
		updateProps: ( args ) => {
			dispatch(
				slice.actions.updateProps( {
					id: args.id,
					meta: args.meta,
					props: args.props,
				} )
			);
		},
	},
} );
