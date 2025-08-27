import {
	type AnyAction,
	combineReducers,
	configureStore,
	type EnhancedStore,
	type Middleware,
	type ReducersMapObject,
	type Slice,
	type StoreEnhancer,
	type ThunkMiddleware,
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

export {
	createSelector as __createSelector,
	createSlice as __createSlice,
	createAsyncThunk as __createAsyncThunk,
	createAction as __createAction,
} from '@reduxjs/toolkit';

export { useSelector as __useSelector, useDispatch as __useDispatch, Provider as __StoreProvider } from 'react-redux';

/**
 * Usage:
 *
 * const mySlice = addSlice( ... );
 *
 * type MySliceState = SliceState<typeof mySlice>;
 *
 * const value = useSelector( ( state: MySliceState ) => state.mySlice.value );
 */
export type SliceState< S extends Slice > = {
	[ key in S[ 'name' ] ]: ReturnType< S[ 'getInitialState' ] >;
};

// The `configureStore` function from Redux Toolkit infers its actions from the `reducers`
// key of the initialization object. This is fine when creating the store statically, but
// breaks in our case since we create the store dynamically, which means that TypeScript
// can't infer the types. Therefore, we force the store to accept any actions using a
// generic store type.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStore< State = any > = EnhancedStore<
	State,
	AnyAction,
	[ ThunkMiddleware< State, AnyAction > ],
	[ StoreEnhancer ]
>;

interface SlicesMap {
	[ key: Slice[ 'name' ] ]: Slice;
}

let instance: AnyStore | null = null;
let slices: SlicesMap = {};
const pendingActions: AnyAction[] = [];
const middlewares = new Set< Middleware >();

const getReducers = () => {
	const reducers = Object.entries( slices ).reduce( ( reducersData: ReducersMapObject, [ name, slice ] ) => {
		reducersData[ name ] = slice.reducer;

		return reducersData;
	}, {} );

	return combineReducers( reducers );
};

function registerSlice( slice: Slice ) {
	if ( slices[ slice.name ] ) {
		throw new Error( `Slice with name "${ slice.name }" already exists.` );
	}

	slices[ slice.name ] = slice;
}

const addMiddleware = ( middleware: Middleware ) => {
	middlewares.add( middleware );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- See the comment above about `AnyStore`
const dispatch = ( action: any ) => {
	if ( ! instance ) {
		pendingActions.push( action );

		return;
	}

	return instance.dispatch( action );
};

const getState = () => {
	if ( ! instance ) {
		throw new Error( 'The store instance does not exist.' );
	}

	return instance.getState();
};

const subscribe = ( listener: () => void ) => {
	if ( ! instance ) {
		throw new Error( 'The store instance does not exist.' );
	}

	return instance.subscribe( listener );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subscribeWithSelector = < T >( selector: ( state: any ) => T, listener: ( selectedState: T ) => void ) => {
	let prevState = selector( getState() );

	return subscribe( () => {
		const nextState = selector( getState() );

		if ( prevState === nextState ) {
			return;
		}

		prevState = nextState;

		listener( nextState );
	} );
};

const createStore = () => {
	if ( instance ) {
		throw new Error( 'The store instance already exists.' );
	}

	instance = configureStore( {
		reducer: getReducers(),
		middleware: ( getDefaultMiddleware ) => {
			return [ ...getDefaultMiddleware(), ...Array.from( middlewares ) ];
		},
	} );

	if ( pendingActions.length ) {
		pendingActions.forEach( ( action ) => dispatch( action ) );
		pendingActions.length = 0;
	}

	return instance as AnyStore;
};

const getStore = () => {
	return instance;
};

const deleteStore = () => {
	instance = null;
	slices = {};
	pendingActions.length = 0;
	middlewares.clear();
};

export {
	registerSlice as __registerSlice,
	addMiddleware as __addMiddleware,
	dispatch as __dispatch,
	getState as __getState,
	subscribe as __subscribe,
	subscribeWithSelector as __subscribeWithSelector,
	createStore as __createStore,
	getStore as __getStore,
	deleteStore as __deleteStore,
};
