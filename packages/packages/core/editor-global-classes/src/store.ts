import { type Props } from '@elementor/editor-props';
import {
	type CustomCss,
	getVariantByMeta,
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionsMap,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import { type UpdateActionPayload } from '@elementor/editor-styles-repository';
import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import type { ApiContext } from './api';
import { GlobalClassNotFoundError } from './errors';
import { SnapshotHistory } from './utils/snapshot-history';

export type GlobalClasses = {
	items: StyleDefinitionsMap;
	order: StyleDefinitionID[];
};

// The optimistic-concurrency token the server returned with the last index read for
// each context. A save sends it back so the server can reject (409) a save that was
// based on a stale snapshot instead of silently overwriting newer classes.
export type GlobalClassesVersion = number;

type GlobalClassesState = {
	data: GlobalClasses;
	classLabels: Record< StyleDefinitionID, string >;
	initialData: {
		frontend: GlobalClasses;
		preview: GlobalClasses;
	};
	version: {
		frontend: number;
		preview: number;
	};
	isDirty: boolean;
};

export type ModifiedLabels = {
	[ id: string ]: {
		original: string;
		modified: string;
	};
};

const localHistory = SnapshotHistory.get< GlobalClasses >( 'global-classes' );

const initialState: GlobalClassesState = {
	data: { items: {}, order: [] },
	classLabels: {},
	initialData: {
		frontend: { items: {}, order: [] },
		preview: { items: {}, order: [] },
	},
	version: {
		frontend: 0,
		preview: 0,
	},
	isDirty: false,
};

export type StateWithGlobalClasses = SliceState< typeof slice >;

// Slice
const SLICE_NAME = 'globalClasses';

export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load(
			state,
			{
				payload: { frontend, preview, classLabels, version = { frontend: 0, preview: 0 } },
			}: PayloadAction< {
				frontend: GlobalClasses;
				preview: GlobalClasses;
				classLabels: Record< StyleDefinitionID, string >;
				version?: {
					frontend: number;
					preview: number;
				};
			} >
		) {
			state.initialData.frontend = frontend;
			state.initialData.preview = preview;
			state.data = preview;
			state.classLabels = classLabels;
			state.version = {
				frontend: version.frontend ?? 0,
				preview: version.preview ?? 0,
			};

			state.isDirty = false;
		},

		add( state, { payload }: PayloadAction< StyleDefinition > ) {
			localHistory.next( state.data );
			state.data.items[ payload.id ] = payload;
			state.data.order.unshift( payload.id );
			state.classLabels[ payload.id ] = payload.label;

			state.isDirty = true;
		},

		delete( state, { payload }: PayloadAction< StyleDefinitionID > ) {
			localHistory.next( state.data );
			state.data.items = Object.fromEntries(
				Object.entries( state.data.items ).filter( ( [ id ] ) => id !== payload )
			);

			state.data.order = state.data.order.filter( ( id ) => id !== payload );
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete state.classLabels[ payload ];

			state.isDirty = true;
		},

		setOrder( state, { payload }: PayloadAction< StyleDefinitionID[] > ) {
			localHistory.next( state.data );
			state.data.order = payload;

			state.isDirty = true;
		},

		update( state, { payload }: PayloadAction< { style: UpdateActionPayload } > ) {
			const oldLabel = state.classLabels[ payload.style.id ];
			localHistory.next( state.data );
			const style = state.data.items[ payload.style.id ];

			const mergedData = {
				...style,
				...payload.style,
			};

			if ( oldLabel && payload.style.label && payload.style.label !== oldLabel ) {
				state.classLabels[ payload.style.id ] = payload.style.label;
			}

			state.data.items[ payload.style.id ] = mergedData;

			state.isDirty = true;
		},

		updateMultiple( state, { payload }: PayloadAction< ModifiedLabels > ) {
			localHistory.next( state.data );
			Object.entries( payload ).forEach( ( [ id, { modified } ] ) => {
				state.data.items[ id ].label = modified;
				state.classLabels[ id ] = modified;
			} );

			state.isDirty = false;
		},
		updateProps(
			state,
			{
				payload,
			}: PayloadAction< {
				id: StyleDefinitionID;
				meta: StyleDefinitionVariant[ 'meta' ];
				props: Props;
				custom_css?: CustomCss | null;
				mode?: 'merge' | 'replace';
			} >
		) {
			const style = state.data.items[ payload.id ];

			if ( ! style ) {
				throw new GlobalClassNotFoundError( { context: { styleId: payload.id } } );
			}

			localHistory.next( state.data );

			const variant = getVariantByMeta( style, payload.meta );
			let customCss = ( 'custom_css' in payload ? payload.custom_css : variant?.custom_css ) ?? null;
			customCss = customCss?.raw ? customCss : null;

			if ( variant ) {
				const payloadProps = JSON.parse( JSON.stringify( payload.props ) ) as Props;
				const mode = payload.mode ?? 'merge';

				if ( mode === 'replace' ) {
					variant.props = payloadProps;
				} else {
					const variantProps = JSON.parse( JSON.stringify( variant.props ) ) as Props;
					variant.props = mergeProps( variantProps, payloadProps );
				}

				variant.custom_css = customCss;

				style.variants = getNonEmptyVariants( style );
			} else {
				style.variants.push( { meta: payload.meta, props: payload.props, custom_css: customCss } );
			}

			state.isDirty = true;
		},

		reset( state, { payload: { context } }: PayloadAction< { context: ApiContext } > ) {
			if ( context === 'frontend' ) {
				localHistory.reset();
				state.initialData.frontend = state.data;

				state.isDirty = false;
			}

			state.initialData.preview = state.data;
		},

		/**
		 * Rebase the working data and the concurrency baseline onto the server state a
		 * save just 409-conflicted against. [server] carries the full item definitions
		 * (post fetch) and the authoritative order (index fetch) for the conflicted
		 * context. The other context keeps the items it already owns (merge instead of
		 * replace) so lazily-loaded class data is not dropped when only a concurrent
		 * order change caused the conflict. The retry then re-diffs and saves against
		 * the fresh baseline.
		 */
		rebaseToServer(
			state,
			{
				payload: { context, server, version = 0 },
			}: PayloadAction< {
				context: ApiContext;
				server: GlobalClasses;
				version?: number;
			} >
		) {
			state.version[ context ] = version;

			const other = context === 'frontend' ? 'preview' : 'frontend';
			state.data = {
				items: {
					...state.initialData[ context ].items,
					...server.items,
				},
				order: server.order,
			};

			state.initialData[ context ] = {
				items: {
					...state.initialData[ context ].items,
					...server.items,
				},
				order: server.order,
			};

			state.initialData[ other ] = {
				...state.initialData[ other ],
				items: {
					...state.initialData[ other ].items,
					...server.items,
				},
				order: server.order,
			};

			for ( const [ id, item ] of Object.entries( server.items ) ) {
				if ( ! ( id in state.classLabels ) ) {
					state.classLabels[ id ] = item.label;
				}
			}

			state.isDirty = true;
		},

		undo( state ) {
			if ( localHistory.isLast() ) {
				localHistory.next( state.data ); // store current before undo
			}
			const data = localHistory.prev();
			if ( data ) {
				state.data = data;
				state.isDirty = true;
			} else {
				state.data = state.initialData.preview;
			}
		},

		resetToInitialState( state, { payload: { context } }: PayloadAction< { context: ApiContext } > ) {
			localHistory.reset();
			state.data = state.initialData[ context ];
			state.isDirty = false;
		},

		redo( state ) {
			const data = localHistory.next();
			if ( localHistory.isLast() ) {
				localHistory.prev();
			}
			if ( data ) {
				state.data = data;
				state.isDirty = true;
			}
		},

		mergeExistingClasses(
			state,
			{
				payload: { preview, frontend },
			}: PayloadAction< { preview: GlobalClasses[ 'items' ]; frontend: GlobalClasses[ 'items' ] } >
		) {
			Object.entries( preview ).forEach( ( [ id, previewClassData ] ) => {
				const frontendClassData = frontend[ id ];

				if ( previewClassData === null || previewClassData === undefined ) {
					return;
				}
				if ( ! ( id in state.data.items ) ) {
					state.data.items[ id ] = previewClassData;
				}
				if ( ! ( id in state.initialData.frontend.items ) ) {
					state.initialData.frontend.items[ id ] = frontendClassData;
				}
				if ( ! ( id in state.initialData.preview.items ) ) {
					state.initialData.preview.items[ id ] = previewClassData;
				}
				if ( ! ( id in state.classLabels ) ) {
					state.classLabels[ id ] = previewClassData.label;
				}
			} );
		},

		setOrderWithoutHistory( state, { payload }: PayloadAction< StyleDefinitionID[] > ) {
			state.data.order = payload;
		},

		updateAfterTemplateImport(
			state,
			{
				payload,
			}: PayloadAction< {
				addedItems: StyleDefinitionsMap;
				addedIdsOrder: StyleDefinitionID[];
				addedClassLabels: Record< StyleDefinitionID, string >;
			} >
		) {
			// Update initial data
			state.initialData.frontend.items = {
				...state.initialData.frontend.items,
				...payload.addedItems,
			};
			state.initialData.frontend.order = [ ...state.initialData.frontend.order, ...payload.addedIdsOrder ];

			state.initialData.preview.items = {
				...state.initialData.preview.items,
				...payload.addedItems,
			};
			state.initialData.preview.order = [ ...state.initialData.preview.order, ...payload.addedIdsOrder ];

			// Update current data
			state.data.items = { ...state.data.items, ...payload.addedItems };
			state.data.order = [ ...state.data.order, ...payload.addedIdsOrder ];

			// Update class labels
			state.classLabels = { ...state.classLabels, ...payload.addedClassLabels };
		},
	},
} );

const mergeProps = ( current: Props, updates: Props ): Props => {
	// edge case, the server returns an array instead of an object when empty props because of PHP array / object conversion
	const props = Array.isArray( current ) ? {} : current;

	Object.entries( updates ).forEach( ( [ key, value ] ) => {
		if ( value === null || value === undefined ) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete props[ key ];
		} else {
			props[ key ] = value;
		}
	} );

	return props;
};

const getNonEmptyVariants = ( style: StyleDefinition ) => {
	return style.variants.filter(
		( { props, custom_css: customCss }: StyleDefinitionVariant ) => Object.keys( props ).length || customCss?.raw
	);
};

export const placeholderDefinition = ( id: StyleDefinitionID, label: string ): StyleDefinition => ( {
	id,
	type: 'class',
	label,
	variants: [],
} );

// Selectors
export const selectData = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].data;

export const selectClassLabels = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].classLabels;

export const selectFrontendInitialData = ( state: SliceState< typeof slice > ) =>
	state[ SLICE_NAME ].initialData.frontend;

export const selectPreviewInitialData = ( state: SliceState< typeof slice > ) =>
	state[ SLICE_NAME ].initialData.preview;

export const selectVersion = ( state: SliceState< typeof slice >, context: ApiContext ) =>
	state[ SLICE_NAME ].version[ context ];

export const selectFrontendVersion = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].version.frontend;

export const selectPreviewVersion = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].version.preview;

export const selectOrder = createSelector( selectData, ( { order } ) => order );

export const selectGlobalClasses = createSelector( selectData, ( { items } ) => items );

export const selectIsDirty = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].isDirty;

export const selectOrderedClasses = createSelector( selectData, selectClassLabels, ( { items, order }, classLabels ) =>
	order
		.map( ( id ) => {
			const loaded = items[ id ];
			if ( loaded ) {
				return loaded;
			}
			const label = classLabels[ id ];
			return label !== undefined ? placeholderDefinition( id, label ) : null;
		} )
		.filter( ( s ): s is StyleDefinition => s !== null )
);

export const selectClass = ( state: SliceState< typeof slice >, id: StyleDefinitionID ) =>
	state[ SLICE_NAME ].data.items[ id ] ?? null;

export const selectEmptyCssClass = createSelector( selectData, ( { items } ) =>
	Object.values( items ).filter( ( cssClass ) => ( cssClass.variants?.length ?? 0 ) === 0 )
);

export const selectIsClassFetched = ( state: SliceState< typeof slice >, id: StyleDefinitionID ) =>
	!! state[ SLICE_NAME ].initialData.preview.items[ id ] ||
	!! state[ SLICE_NAME ].initialData.frontend.items[ id ] ||
	false;
