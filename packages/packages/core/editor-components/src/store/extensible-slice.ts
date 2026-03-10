import type { V1Document } from '@elementor/editor-documents';
import {
	__createAction as createAction,
	__createSlice as createSlice,
	__dispatch as dispatch,
	type AnyAction,
	type PayloadAction,
} from '@elementor/store';

import type { ComponentId, OverridableProps, PublishedComponent, UnpublishedComponent } from '../types';
import { type ComponentsState, initialState, type SanitizeAttributes, SLICE_NAME } from './store-types';
import { loadComponents } from './thunks';

type GetComponentResponse = PublishedComponent[];

type ComponentsReducer< P > = ( state: ComponentsState, action: PayloadAction< P > ) => void;

const extraReducersMap = new Map< string, ComponentsReducer< unknown > >();

export function registerComponentsReducer< P >(
	actionType: `components/${ string }`,
	reducer: ComponentsReducer< P >
) {
	extraReducersMap.set( actionType, reducer as ComponentsReducer< unknown > );
}

export function createComponentsAction< P >( name: string ) {
	const actionType = `${ SLICE_NAME }/${ name }` as const;
	const action = createAction< P >( actionType );

	return {
		action,
		register( reducer: ComponentsReducer< P > ) {
			registerComponentsReducer( actionType, reducer );
		},
		dispatch( payload: P ) {
			dispatch( action( payload ) );
		},
	};
}

export function __resetExtraReducers() {
	extraReducersMap.clear();
}

const baseSlice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		add: ( state, { payload }: PayloadAction< PublishedComponent | PublishedComponent[] > ) => {
			if ( Array.isArray( payload ) ) {
				state.data = [ ...payload, ...state.data ];
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
		removeUnpublished: ( state, { payload }: PayloadAction< string | string[] > ) => {
			const uidsToRemove = Array.isArray( payload ) ? payload : [ payload ];
			state.unpublishedData = state.unpublishedData.filter(
				( component ) => ! uidsToRemove.includes( component.uid )
			);
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
		removeCreatedThisSession: ( state, { payload }: PayloadAction< string > ) => {
			state.createdThisSession = state.createdThisSession.filter( ( uid ) => uid !== payload );
		},
		archive: ( state, { payload }: PayloadAction< number > ) => {
			const component = state.data.find( ( comp ) => comp.id === payload );

			if ( component ) {
				component.isArchived = true;
				state.archivedThisSession.push( payload );
			}
		},
		setCurrentComponentId: ( state, { payload }: PayloadAction< V1Document[ 'id' ] | null > ) => {
			state.currentComponentId = payload;
		},
		setPath: ( state, { payload }: PayloadAction< ComponentsState[ 'path' ] > ) => {
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
		rename: ( state, { payload }: PayloadAction< { componentUid: string; name: string } > ) => {
			const component = state.data.find( ( comp ) => comp.uid === payload.componentUid );

			if ( ! component ) {
				return;
			}
			if ( component.id ) {
				state.updatedComponentNames[ component.id ] = payload.name;
			}
			component.name = payload.name;
		},
		cleanUpdatedComponentNames: ( state ) => {
			state.updatedComponentNames = {};
		},
		updateComponentSanitizedAttribute: (
			state,
			{
				payload: { componentId, attribute },
			}: PayloadAction< { componentId: ComponentId; attribute: SanitizeAttributes } >
		) => {
			if ( ! state.sanitized[ componentId ] ) {
				state.sanitized[ componentId ] = {};
			}

			state.sanitized[ componentId ][ attribute ] = true;
		},
		resetSanitizedComponents: ( state ) => {
			state.sanitized = {};
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

export const slice: typeof baseSlice = {
	...baseSlice,
	reducer( state: ComponentsState | undefined, action: AnyAction ) {
		const nextState = baseSlice.reducer( state, action );

		const extraReducer = extraReducersMap.get( action.type );

		if ( ! extraReducer || ! nextState ) {
			return nextState;
		}

		const clonedState = structuredClone( nextState );
		extraReducer( clonedState, action as PayloadAction< unknown > );

		return clonedState;
	},
};
