import { generateId, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';
import {
	__dispatch as dispatch,
	__getState as getState,
	__subscribeWithSelector as subscribeWithSelector,
} from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { getCapabilities } from './capabilities';
import { GlobalClassLabelAlreadyExistsError, GlobalClassTrackingError } from './errors';
import { loadExistingClasses } from './load-existing-classes';
import {
	placeholderDefinition,
	selectClass,
	selectClassLabels,
	selectData,
	selectIsLoadedClass,
	selectOrderedClasses,
	slice,
	type StateWithGlobalClasses,
} from './store';
import { trackGlobalClasses, type TrackingEvent } from './utils/tracking';

const MAX_CLASSES = 100;

export const GLOBAL_CLASSES_PROVIDER_KEY = 'global-classes';
const PREGENERATED_LINK_PATTERN = /^global-([0-9]+-)?(preview|frontend)-[a-zA-Z_-]+-css$/;

export const globalClassesStylesProvider = createStylesProvider( {
	key: GLOBAL_CLASSES_PROVIDER_KEY,
	priority: 30,
	limit: MAX_CLASSES,
	isPregeneratedLink: ( { id } ) => PREGENERATED_LINK_PATTERN.test( id ),
	labels: {
		singular: __( 'class', 'elementor' ),
		plural: __( 'classes', 'elementor' ),
	},
	subscribe: ( cb ) => subscribeWithStates( cb ),
	capabilities: getCapabilities(),
	actions: {
		all: () => selectOrderedClasses( getState() ),
		get: ( id ) => {
			const isLoaded = selectIsLoadedClass( getState(), id );
			const style = selectClass( getState(), id );

			if ( isLoaded ) {
				return style;
			}

			// we populate the style with a placeholder until fully loaded
			// to avoid crashing the editing panel
			loadExistingClasses( [ id ] );

			return placeholderDefinition( id, style?.label ?? id );
		},
		resolveCssName: ( id: string ) => {
			const state = getState();
			const loaded = selectClass( state, id );
			if ( loaded ) {
				return loaded.label;
			}
			const fromIndex = selectClassLabels( state )[ id ];
			return fromIndex ?? id;
		},
		create: ( label, variants: StyleDefinitionVariant[] = [] ) => {
			const existingClasses = Object.entries( selectClassLabels( getState() ) );
			const existingLabels = existingClasses.map( ( [ , classLabel ] ) => classLabel );

			if ( existingLabels.includes( label ) ) {
				throw new GlobalClassLabelAlreadyExistsError( { context: { label } } );
			}

			const existingIds = existingClasses.map( ( [ id ] ) => id );
			const id = generateId( 'g-', existingIds );

			dispatch(
				slice.actions.add( {
					id,
					type: 'class',
					label,
					variants,
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
					mode: args.mode,
				} )
			);
		},
		updateCustomCss: ( args ) => {
			dispatch(
				slice.actions.updateProps( {
					id: args.id,
					meta: args.meta,
					custom_css: args.custom_css,
					props: {},
				} )
			);
		},
		tracking: ( data: { event: string; [ key: string ]: unknown } ) => {
			trackGlobalClasses( data as TrackingEvent ).catch( ( error ) => {
				throw new GlobalClassTrackingError( { cause: error } );
			} );
		},
	},
} );

const subscribeWithStates = (
	cb: ( previous: Record< string, StyleDefinition >, current: Record< string, StyleDefinition > ) => void
) => {
	let previousState = selectData( getState() );

	return subscribeWithSelector(
		( state: StateWithGlobalClasses ) => state.globalClasses,
		( currentState ) => {
			cb( previousState.items, currentState.data.items );
			previousState = currentState.data;
		}
	);
};
