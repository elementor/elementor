import { mergeProps, type Props } from '@elementor/editor-props';
import {
	type CustomCss,
	getVariantByMeta,
	type StyleDefinition,
	type StyleDefinitionID,
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
	items: Record< StyleDefinitionID, StyleDefinition >;
	order: StyleDefinitionID[];
};

type GlobalClassesState = {
	data: GlobalClasses;
	initialData: {
		frontend: GlobalClasses;
		preview: GlobalClasses;
	};
	isDirty: boolean;
};

const localHistory = SnapshotHistory.get< GlobalClasses >( 'global-classes' );

const initialState: GlobalClassesState = {
	data: { items: {}, order: [] },
	initialData: {
		frontend: { items: {}, order: [] },
		preview: { items: {}, order: [] },
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
				payload: { frontend, preview },
			}: PayloadAction< {
				frontend: GlobalClasses;
				preview: GlobalClasses;
			} >
		) {
			state.initialData.frontend = frontend;
			state.initialData.preview = preview;
			state.data = preview;

			state.isDirty = false;
		},

		add( state, { payload }: PayloadAction< StyleDefinition > ) {
			localHistory.next( state.data );
			state.data.items[ payload.id ] = payload;
			state.data.order.unshift( payload.id );

			state.isDirty = true;
		},

		delete( state, { payload }: PayloadAction< StyleDefinitionID > ) {
			localHistory.next( state.data );
			state.data.items = Object.fromEntries(
				Object.entries( state.data.items ).filter( ( [ id ] ) => id !== payload )
			);

			state.data.order = state.data.order.filter( ( id ) => id !== payload );

			state.isDirty = true;
		},

		setOrder( state, { payload }: PayloadAction< StyleDefinitionID[] > ) {
			localHistory.next( state.data );
			state.data.order = payload;

			state.isDirty = true;
		},

		update( state, { payload }: PayloadAction< { style: UpdateActionPayload } > ) {
			localHistory.next( state.data );
			const style = state.data.items[ payload.style.id ];

			const mergedData = {
				...style,
				...payload.style,
			};

			state.data.items[ payload.style.id ] = mergedData;

			state.isDirty = true;
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
				variant.props = mergeProps( variant.props, payload.props );
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
	},
} );

const getNonEmptyVariants = ( style: StyleDefinition ) => {
	return style.variants.filter(
		( { props, custom_css: customCss }: StyleDefinitionVariant ) => Object.keys( props ).length || customCss?.raw
	);
};

// Selectors
export const selectData = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].data;

export const selectFrontendInitialData = ( state: SliceState< typeof slice > ) =>
	state[ SLICE_NAME ].initialData.frontend;

export const selectPreviewInitialData = ( state: SliceState< typeof slice > ) =>
	state[ SLICE_NAME ].initialData.preview;

export const selectOrder = createSelector( selectData, ( { order } ) => order );

export const selectGlobalClasses = createSelector( selectData, ( { items } ) => items );

export const selectIsDirty = ( state: SliceState< typeof slice > ) => state[ SLICE_NAME ].isDirty;

export const selectOrderedClasses = createSelector( selectGlobalClasses, selectOrder, ( items, order ) =>
	order.map( ( id ) => items[ id ] )
);

export const selectClass = ( state: SliceState< typeof slice >, id: StyleDefinitionID ) =>
	state[ SLICE_NAME ].data.items[ id ] ?? null;
