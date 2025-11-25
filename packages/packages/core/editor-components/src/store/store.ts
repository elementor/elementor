import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import {
	type Component,
	type ComponentId,
	type OverridableProp,
	type OverridablePropGroup,
	type OverridableProps,
	type PublishedComponent,
	type StylesDefinition,
	type UnpublishedComponent,
} from '../types';
import { loadComponents } from './thunks';

type GetComponentResponse = PublishedComponent[];

type Status = 'idle' | 'pending' | 'error';

type ComponentsState = {
	data: PublishedComponent[];
	unpublishedData: UnpublishedComponent[];
	loadStatus: Status;
	styles: StylesDefinition;
	createdThisSession: Component[ 'uid' ][];
};

type ComponentsSlice = SliceState< typeof slice >;

export const initialState: ComponentsState = {
	data: [],
	unpublishedData: [],
	loadStatus: 'idle',
	styles: {},
	createdThisSession: [],
};

export const SLICE_NAME = 'components';
export const slice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		add: ( state, { payload }: PayloadAction< PublishedComponent | PublishedComponent[] > ) => {
			if ( Array.isArray( payload ) ) {
				state.data = [ ...state.data, ...payload ];
			} else {
				state.data.unshift( payload );
			}
		},
		load: ( state, { payload }: PayloadAction< PublishedComponent[] > ) => {
			state.data = payload;
		},
		addUnpublished: ( state, { payload }: PayloadAction< UnpublishedComponent > ) => {
			state.unpublishedData.unshift( payload );
		},
		resetUnpublished: ( state ) => {
			state.unpublishedData = [];
		},
		removeStyles( state, { payload }: PayloadAction< { id: ComponentId } > ) {
			const { [ payload.id ]: _, ...rest } = state.styles;

			state.styles = rest;
		},
		addStyles: ( state, { payload } ) => {
			state.styles = { ...state.styles, ...payload };
		},
		addCreatedThisSession: ( state, { payload }: PayloadAction< string > ) => {
			state.createdThisSession.push( payload );
		},
		addOverridableProp: (
			state,
			{
				payload: { componentId, ...overridableProp },
			}: PayloadAction<
				{ componentId: ComponentId } & Omit< OverridableProp, 'groupId' > & { groupId: string | null }
			>
		) => {
			const component = state.data.find( ( { id } ) => id === componentId );
			const groupId = overridableProp.groupId || generateUniqueId();

			if ( ! component ) {
				return;
			}

			const props = component.overrides?.props ?? {};
			const groups = component.overrides?.groups ?? {
				items: {},
				order: [],
			};

			if ( ! groups.items[ groupId ] ) {
				groups.items[ groupId ] = {
					id: groupId,
					label: __( 'Default', 'elementor' ),
					props: [],
				};

				groups.order.push( groupId );
			}
			const group: OverridablePropGroup = groups.items[ groupId ];

			props[ overridableProp[ 'override-key' ] ] = {
				...overridableProp,
				groupId,
			};

			group.props.push( overridableProp[ 'override-key' ] );

			groups.items[ groupId ] = group;

			component.overrides = {
				props,
				groups,
			};
		},
		removeOverridableProp: (
			state,
			{ payload }: PayloadAction< { componentId: ComponentId; overrideKey: string } >
		) => {
			const component = state.data.find( ( { id } ) => id === payload.componentId );
			const { overrides } = component ?? {};

			if ( ! overrides ) {
				return;
			}

			const { props, groups } = overrides;
			const prop = props[ payload.overrideKey ];

			if ( ! prop ) {
				return;
			}

			const { groupId } = prop;

			const group = groups.items[ groupId ];

			if ( ! group ) {
				return;
			}

			group.props = group.props.filter( ( key ) => key !== payload.overrideKey );

			if ( group.props.length === 0 && Object.keys( groups.items ).length > 1 ) {
				groups.items = Object.fromEntries(
					Object.entries( groups.items ).filter( ( [ id ] ) => id !== groupId )
				);

				groups.order = groups.order.filter( ( id ) => id !== groupId );
			}
		},
		setOverridableProps: (
			state,
			{ payload }: PayloadAction< { componentId: ComponentId; overrides: OverridableProps } >
		) => {
			const component = state.data.find( ( comp ) => comp.id === payload.componentId );

			if ( ! component ) {
				return;
			}
			component.overrides = payload.overrides;
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( loadComponents.fulfilled, ( state, { payload }: PayloadAction< GetComponentResponse > ) => {
			state.data = payload;
			state.loadStatus = 'idle';
		} );
		builder.addCase( loadComponents.pending, ( state ) => {
			state.loadStatus = 'pending';
		} );
		builder.addCase( loadComponents.rejected, ( state ) => {
			state.loadStatus = 'error';
		} );
	},
} );

const selectData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].data;
const selectLoadStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].loadStatus;
const selectStylesDefinitions = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
const selectUnpublishedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].unpublishedData;
const getCreatedThisSession = ( state: ComponentsSlice ) => state[ SLICE_NAME ].createdThisSession;
const selectComponent = ( state: ComponentsSlice, componentId: ComponentId ) =>
	state[ SLICE_NAME ].data.find( ( component ) => component.id === componentId );

export const selectComponents = createSelector(
	selectData,
	selectUnpublishedData,
	( data: PublishedComponent[], unpublishedData: UnpublishedComponent[] ) => [
		...unpublishedData.map( ( item ) => ( { uid: item.uid, name: item.name } ) ),
		...data,
	]
);
export const selectUnpublishedComponents = createSelector(
	selectUnpublishedData,
	( unpublishedData: UnpublishedComponent[] ) => unpublishedData
);
export const selectLoadIsPending = createSelector( selectLoadStatus, ( status ) => status === 'pending' );
export const selectLoadIsError = createSelector( selectLoadStatus, ( status ) => status === 'error' );
export const selectStyles = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
export const selectFlatStyles = createSelector( selectStylesDefinitions, ( data ) => Object.values( data ).flat() );
export const selectCreatedThisSession = createSelector(
	getCreatedThisSession,
	( createdThisSession ) => createdThisSession
);
export const selectOverridableProps = createSelector(
	selectComponent,
	( component: PublishedComponent | undefined ) => component?.overrides
);
