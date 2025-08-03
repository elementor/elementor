import {
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';


export type ComponentsStyles = Record< StyleDefinitionID, StyleDefinition >;

export type ComponentsStylesState = {
	data: ComponentsStyles;
	initialData: {
		frontend: ComponentsStyles;
		preview: ComponentsStyles;
	};
};

const initialState: ComponentsStylesState = {
	data: {},
	initialData: {
		frontend: {},
		preview: {},
	},
};

export type StateWithComponentsStyles = SliceState< typeof slice >;

// Slice
const SLICE_NAME = 'componentsStyles';

export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load(
			state,
			{
				payload: { frontend, preview },
			}: PayloadAction< {
				frontend: ComponentsStyles;
				preview: ComponentsStyles;
			} >
		) {
			state.initialData.frontend = frontend;
			state.initialData.preview = preview;
			state.data = preview;
		},
	},
} );

export const selectData = ( state: StateWithComponentsStyles ) => state[ SLICE_NAME ].data;

export const selectInitialData = ( state: StateWithComponentsStyles ) => state[ SLICE_NAME ].initialData;

export const selectClasses = createSelector( selectData, ( items ) =>
	Object.values( items )
);

export const selectClass = ( state: StateWithComponentsStyles, id: StyleDefinitionID ) =>
	state[ SLICE_NAME ].data[ id ] ?? null;

export const selectEmptyCssClass = createSelector( selectData, ( items ) =>
	Object.values( items ).filter( ( cssClass ) => cssClass.variants.length === 0 )
);
