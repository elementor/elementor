import {
	createSlice,
	ReducersMapObject,
	configureStore,
	combineReducers,
	Middleware,
	Store,
	Slice,
	AnyAction,
	CreateSliceOptions,
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
	Middleware,
} from '@reduxjs/toolkit';

export { createSelector } from '@reduxjs/toolkit';

export { useSelector, useDispatch, Provider as StoreProvider } from 'react-redux';

/**
 * Usage:
 *
 * const mySlice = addSlice( ... );
 *
 * type MySliceState = SliceState<typeof mySlice>;
 *
 * const value = useSelector( ( state: MySliceState ) => state.mySlice.value );
 */
export type SliceState<S extends Slice> = {
	[ key in S['name'] ]: ReturnType<S['getInitialState']>;
}

interface SlicesMap {
	[key: Slice['name']]: Slice;
}

let instance: Store | null = null;
let slices: SlicesMap = {};
const pendingActions: AnyAction[] = [];
const middlewares = new Set<Middleware>();

const getReducers = () => {
	const reducers = Object.entries( slices ).reduce( ( reducersData: ReducersMapObject, [ name, slice ] ) => {
		reducersData[ name ] = slice.reducer;

		return reducersData;
	}, {} );

	return combineReducers( reducers );
};

export const addSlice = ( ( sliceConfig: CreateSliceOptions ) => {
	if ( slices[ sliceConfig.name ] ) {
		throw new Error( `Slice with name "${ sliceConfig.name }" already exists.` );
	}

	const slice = createSlice( sliceConfig );

	slices[ slice.name ] = slice;

	return slice;
} ) as typeof createSlice;

export const addMiddleware = ( middleware: Middleware ) => {
	middlewares.add( middleware );
};

export const dispatch = ( action: AnyAction ) => {
	if ( ! instance ) {
		pendingActions.push( action );

		return;
	}

	return instance.dispatch( action );
};

export const createStore = () => {
	if ( instance ) {
		throw new Error( 'The store instance already exists.' );
	}

	instance = configureStore( {
		reducer: getReducers(),
		middleware: Array.from( middlewares ),
	} );

	if ( pendingActions.length ) {
		pendingActions.forEach( ( action ) => dispatch( action ) );
		pendingActions.length = 0;
	}

	return instance;
};

export const getStore = () => {
	return instance;
};

export const deleteStore = () => {
	instance = null;
	slices = {};
	pendingActions.length = 0;
	middlewares.clear();
};
