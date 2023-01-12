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

export { useSelector, useDispatch, Provider as StoreProvider } from 'react-redux';

/**
 * Usage:
 *
 * const mySlice = storeService.registerSlice( ... );
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

class StoreService {
	private instance: Store | null = null;
	private slices: SlicesMap = {};
	private pendingActions: AnyAction[] = [];
	private middlewares = new Set<Middleware>();

	private getReducers() {
		const reducers = Object.entries( this.slices ).reduce( ( reducersData: ReducersMapObject, [ name, slice ] ) => {
			reducersData[ name ] = slice.reducer;

			return reducersData;
		}, {} );

		return combineReducers( reducers );
	}

	registerSlice( sliceConfig: CreateSliceOptions ) {
		const slice = createSlice( sliceConfig );

		if ( this.slices[ slice.name ] ) {
			throw new Error( `Slice with name "${ slice.name }" already exists.` );
		}

		this.slices[ slice.name ] = slice;

		return slice;
	}

	registerMiddleware( middleware: Middleware ) {
		this.middlewares.add( middleware );
	}

	dispatch( action: AnyAction ) {
		if ( ! this.instance ) {
			this.pendingActions.push( action );

			return;
		}

		return this.instance.dispatch( action );
	}

	createStore() {
		if ( this.instance ) {
			throw new Error( 'The store instance already exists.' );
		}

		this.instance = configureStore( {
			reducer: this.getReducers(),
			middleware: Array.from( this.middlewares ),
		} );

		if ( this.pendingActions.length ) {
			this.pendingActions.forEach( ( action ) => this.dispatch( action ) );
			this.pendingActions = [];
		}

		return this.instance;
	}

	getStore() {
		return this.instance;
	}

	deleteStore() {
		// Cleaning all the reducers in case that there is a reference to the store.
		this.instance?.replaceReducer( () => null );
		this.instance = null;
		this.slices = {};
		this.pendingActions = [];
		this.middlewares.clear();
	}
}

export const createStoreService = () => {
	return new StoreService();
};
