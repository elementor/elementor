import {
	createSlice,
	ReducersMapObject,
	configureStore,
	combineReducers,
	ThunkMiddleware,
	Store,
	Slice,
	AnyAction,
} from '@reduxjs/toolkit';

export type {
	Slice,
	CreateSliceOptions,
	PayloadAction,
	Store,
	Dispatch,
	AnyAction,
	Action,
	MiddlewareAPI,
} from '@reduxjs/toolkit';

export { createSlice } from '@reduxjs/toolkit';

export { useSelector, useDispatch, Provider as StoreProvider } from 'react-redux';

// Usage: SliceState<typeof slice>
export type SliceState<S extends Slice> = {
	[ key in S['name'] ]: ReturnType<S['getInitialState']>;
}

interface SlicesMap {
	[key: Slice['name']]: Slice;
}

let instance: Store | null = null;

const middlewares = new Set<ThunkMiddleware>();

let slices: SlicesMap = {};

let pendingActions: AnyAction[] = [];

const getReducers = () => {
	const reducers = Object.entries( slices ).reduce( ( reducersData: ReducersMapObject, [ name, slice ] ) => {
		reducersData[ name ] = slice.reducer;

		return reducersData;
	}, {} );

	return combineReducers( reducers );
};

// Should be casted into createSlice because this function detects the correct type only when the slice object is passed directly to it.
export const registerSlice = ( ( sliceConfig ) => {
	const slice = createSlice( sliceConfig );

	if ( slices[ slice.name ] ) {
		return slices[ slice.name ];
	}

	slices[ slice.name ] = slice;

	return slice;
} ) as typeof createSlice;

export const registerMiddleware = ( middleware: ThunkMiddleware ) => {
	middlewares.add( middleware );
};

export const createStore = () => {
	if ( ! instance ) {
		instance = configureStore( {
			reducer: getReducers(),
			middleware: Array.from( middlewares ),
		} );

		if ( pendingActions.length ) {
			pendingActions.forEach( ( action ) => instance?.dispatch( action ) );
			pendingActions = [];
		}
	}

	return instance;
};

export const getStore = () => instance;

export const resetStore = () => {
	instance = null;
	slices = {};
	pendingActions = [];
	middlewares.clear();
};

export const dispatch = ( action: AnyAction ) => {
	if ( ! instance ) {
		pendingActions.push( action );

		return;
	}

	return instance.dispatch( action );
};
