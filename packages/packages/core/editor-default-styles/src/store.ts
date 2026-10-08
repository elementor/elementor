import { mergeProps, type Props } from '@elementor/editor-props';
import {
	type CustomCss,
	getNonEmptyVariants,
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

type DefaultStylesState = {
	data: Record< StyleDefinitionID, StyleDefinition >;
	initialData: Record< StyleDefinitionID, StyleDefinition >;
	isDirty: boolean;
};

const initialState: DefaultStylesState = {
	data: {},
	initialData: {},
	isDirty: false,
};

export type StateWithDefaultStyles = SliceState< typeof slice >;

const SLICE_NAME = 'defaultStyles';

export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		load(
			state,
			{
				payload: { data },
			}: PayloadAction< {
				data: Record< StyleDefinitionID, StyleDefinition >;
			} >
		) {
			const normalizedData = Array.isArray( data ) ? {} : data;

			state.initialData = structuredClone( normalizedData );
			state.data = structuredClone( normalizedData );
			state.isDirty = false;
		},

		update( state, { payload }: PayloadAction< { style: UpdateActionPayload } > ) {
			state.data[ payload.style.id ] = {
				...state.data[ payload.style.id ],
				...payload.style,
			} as StyleDefinition;
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
				mode?: 'merge' | 'replace';
			} >
		) {
			const style = state.data[ payload.id ] ?? {
				id: payload.id,
				label: payload.id,
				type: 'class' as const,
				variants: [],
			};

			const variant = getVariantByMeta( style, payload.meta );

			let customCss = ( 'custom_css' in payload ? payload.custom_css : variant?.custom_css ) ?? null;
			customCss = customCss?.raw ? customCss : null;

			const payloadProps = JSON.parse( JSON.stringify( payload.props ) ) as Props;
			const mode = payload.mode ?? 'merge';

			if ( variant ) {
				const variantProps = extractVariantProps( mode, variant );
				variant.props = mergeProps( variantProps, payloadProps );
				variant.custom_css = customCss;
			} else {
				style.variants.push( {
					meta: payload.meta,
					props: mergeProps( {}, payloadProps ),
					custom_css: customCss,
				} );
			}

			style.variants = getNonEmptyVariants( style );

			state.data[ payload.id ] = style;
			state.isDirty = true;
		},

		reset( state ) {
			state.data = state.initialData;
			state.isDirty = false;
		},

		commit( state ) {
			state.initialData = state.data;
			state.isDirty = false;
		},

		deleteTag( state, { payload }: PayloadAction< StyleDefinitionID > ) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete state.data[ payload ];
			state.isDirty = true;
		},
	},
} );

function extractVariantProps( mode: string, variant: StyleDefinitionVariant ) {
	if ( 'replace' === mode ) {
		return {};
	}
	return JSON.parse( JSON.stringify( variant.props ) ) as Props;
}

export const selectData = createSelector(
	( state: StateWithDefaultStyles ) => state.defaultStyles.data,
	( data ) => data
);

export const selectIsDirty = createSelector(
	( state: StateWithDefaultStyles ) => state.defaultStyles.isDirty,
	( isDirty ) => isDirty
);

export const selectInitialData = createSelector(
	( state: StateWithDefaultStyles ) => state.defaultStyles.initialData,
	( initialData ) => initialData
);

export const selectTagStyle = createSelector(
	[ selectData, ( _state: StateWithDefaultStyles, id: StyleDefinitionID ) => id ],
	( data, id ) => data[ id ]
);
