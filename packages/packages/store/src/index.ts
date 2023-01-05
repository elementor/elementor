import {
	createSlice,
	ReducersMapObject,
	configureStore,
	combineReducers,
	ThunkMiddleware,
	Store,
	Slice,
} from '@reduxjs/toolkit';

export { createSlice } from '@reduxjs/toolkit';

export type { Slice, CreateSliceOptions, PayloadAction, Store, Dispatch, AnyAction } from '@reduxjs/toolkit';

export { useSelector, useDispatch, Provider as StoreProvider } from 'react-redux';

interface SlicesMap {
	[key: Slice['name']]: Slice;
}

let instance: Store | null = null;

const middlewares: ThunkMiddleware[] = [];

const slices: SlicesMap = {};

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
	middlewares.push( middleware );
};

export const createStore = () => {
	instance = configureStore( {
		reducer: getReducers(),
		middleware: middlewares,
	} );

	return instance;
};
