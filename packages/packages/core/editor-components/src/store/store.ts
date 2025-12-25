import { type V1Document } from '@elementor/editor-documents';
import {
	__createSelector as createSelector,
	__createSlice as createSlice,
	__useSelector as useSelector,
	type PayloadAction,
	type SliceState,
} from '@elementor/store';

import {
	type Component,
	type ComponentId,
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
	archivedData: PublishedComponent[];
	path: ComponentsPathItem[];
	currentComponentId: V1Document[ 'id' ] | null;
};

export type ComponentsSlice = SliceState< typeof slice >;

export type ComponentsPathItem = {
	instanceId?: string;
	componentId: V1Document[ 'id' ];
};

export const initialState: ComponentsState = {
	data: [],
	unpublishedData: [],
	loadStatus: 'idle',
	styles: {},
	createdThisSession: [],
	archivedData: [],
	path: [],
	currentComponentId: null,
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
		archive: ( state, { payload }: PayloadAction< number > ) => {
			state.data = state.data.filter( ( component ) => {
				const isArchived = component.id === payload;
				if ( isArchived ) {
					state.archivedData.push( component );
				}

				return ! isArchived;
			} );
		},
		setCurrentComponentId: ( state, { payload }: PayloadAction< V1Document[ 'id' ] | null > ) => {
			state.currentComponentId = payload;
		},
		setPath: ( state, { payload }: PayloadAction< ComponentsPathItem[] > ) => {
			state.path = payload;
		},
		setOverridableProps: (
			state,
			{ payload }: PayloadAction< { componentId: ComponentId; overridableProps: OverridableProps } >
		) => {
			const component = state.data.find( ( comp ) => comp.id === payload.componentId );

			if ( ! component ) {
				return;
			}

			component.overridableProps = payload.overridableProps;
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
const selectArchivedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].archivedData;
const selectLoadStatus = ( state: ComponentsSlice ) => state[ SLICE_NAME ].loadStatus;
const selectStylesDefinitions = ( state: ComponentsSlice ) => state[ SLICE_NAME ].styles ?? {};
const selectUnpublishedData = ( state: ComponentsSlice ) => state[ SLICE_NAME ].unpublishedData;
const getCreatedThisSession = ( state: ComponentsSlice ) => state[ SLICE_NAME ].createdThisSession;
const getPath = ( state: ComponentsSlice ) => state[ SLICE_NAME ].path;
const getCurrentComponentId = ( state: ComponentsSlice ) => state[ SLICE_NAME ].currentComponentId;
export const selectComponent = ( state: ComponentsSlice, componentId: ComponentId ) =>
	state[ SLICE_NAME ].data.find( ( component ) => component.id === componentId );
export const useComponent = ( componentId: ComponentId | null ) => {
	return useSelector( ( state: ComponentsSlice ) => ( componentId ? selectComponent( state, componentId ) : null ) );
};

export const selectComponents = createSelector(
	selectData,
	selectUnpublishedData,
	( data: PublishedComponent[], unpublishedData: UnpublishedComponent[] ) => [
		...unpublishedData.map( ( item ) => ( {
			uid: item.uid,
			name: item.name,
			overridableProps: item.overridableProps,
		} ) ),
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

const DEFAULT_OVERRIDABLE_PROPS: OverridableProps = {
	props: {},
	groups: {
		items: {},
		order: [],
	},
};

export const selectOverridableProps = createSelector(
	selectComponent,
	( component: PublishedComponent | undefined ) => {
		if ( ! component ) {
			return undefined;
		}

		return component.overridableProps ?? DEFAULT_OVERRIDABLE_PROPS;
	}
);
export const useOverridableProps = ( componentId: ComponentId | null ) => {
	return useSelector( ( state: ComponentsSlice ) =>
		componentId ? selectOverridableProps( state, componentId ) : null
	);
};
export const selectIsOverridablePropsLoaded = createSelector(
	selectComponent,
	( component: PublishedComponent | undefined ) => {
		return !! component?.overridableProps;
	}
);
export const selectPath = createSelector( getPath, ( path ) => path );

export const selectCurrentComponentId = createSelector(
	getCurrentComponentId,
	( currentComponentId ) => currentComponentId
);

export const useCurrentComponentId = () => {
	return useSelector( selectCurrentComponentId );
};

export const selectArchivedComponents = createSelector(
	selectArchivedData,
	( archivedData: PublishedComponent[] ) => archivedData
);
