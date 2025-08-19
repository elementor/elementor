import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';

import {
	__addMiddleware,
	__createAsyncThunk,
	__createSlice,
	__createStore,
	__deleteStore,
	__dispatch,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
	__subscribeWithSelector,
	__useDispatch as useDispatch,
	__useSelector as useSelector,
	type AnyAction,
	type Dispatch,
} from '../index';

interface SliceStateRoot {
	slice: {
		value?: number;
	};
}

interface Config {
	initialValue?: SliceStateRoot[ 'slice' ][ 'value' ];
}

const createStoreEntities = ( { initialValue = 1 }: Config = {} ) => {
	const slice = __createSlice( {
		name: 'slice',
		initialState: {
			value: initialValue,
		},
		reducers: {
			setValue: ( state, action ) => {
				state.value = action.payload;
			},
		},
	} );

	__registerSlice( slice );

	const store = __createStore();

	const wrapper = ( { children }: PropsWithChildren ) => <StoreProvider store={ store }>{ children }</StoreProvider>;

	return {
		slice,
		store,
		wrapper,
	};
};

describe( '@elementor/store', () => {
	it( 'should set an initial state of a slice', () => {
		// Arrange.
		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), {
			wrapper,
		} );

		// Assert.
		expect( result.current ).toBe( 1 );
	} );

	it( 'should update the state value of the slice', () => {
		// Arrange.
		const { slice, wrapper } = createStoreEntities();

		// Act.
		const { result } = renderHook(
			() => {
				const dispatchAction = useDispatch();

				dispatchAction( slice.actions.setValue( 3 ) );

				return useSelector( ( state: SliceStateRoot ) => state.slice.value );
			},
			{ wrapper }
		);

		// Assert.
		expect( result.current ).toBe( 3 );
	} );

	it( 'should subscribe to state changes using a selector', () => {
		// Arrange.
		const slice1 = __createSlice( {
			name: 'slice1',
			initialState: {
				value: 0,
			},
			reducers: {
				increment: ( state ) => {
					state.value++;
				},
			},
		} );

		const slice2 = __createSlice( {
			name: 'slice2',
			initialState: {
				value: 0,
			},
			reducers: {
				increment: ( state ) => {
					state.value++;
				},
			},
		} );

		__registerSlice( slice1 );
		__registerSlice( slice2 );

		__createStore();

		const subscriber = jest.fn();

		type State = Record< 'slice1' | 'slice2', { value: number } >;

		const unsubscribe = __subscribeWithSelector( ( state: State ) => state.slice2, subscriber );

		// Act.
		__dispatch( slice1.actions.increment() );

		// Assert.
		expect( subscriber ).not.toHaveBeenCalled();

		// Act.
		__dispatch( slice2.actions.increment() );

		// Assert.
		expect( subscriber ).toHaveBeenCalledTimes( 1 );
		expect( subscriber ).toHaveBeenCalledWith( { value: 1 } );

		// Reset.
		subscriber.mockClear();

		// Act.
		unsubscribe();

		__dispatch( slice2.actions.increment() );

		// Assert.
		expect( subscriber ).not.toHaveBeenCalled();
	} );

	it( 'should throw an error when trying to add a slice with the same name more than once', () => {
		// Arrange.
		const slice = __createSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		__registerSlice( slice );

		// Assert.
		expect( () => {
			__registerSlice( slice );
		} ).toThrow( 'Slice with name "slice" already exists.' );
	} );

	it( 'should throw an error when trying to re-create the store', () => {
		// Arrange.
		const slice = __createSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		__registerSlice( slice );

		__createStore();

		// Assert.
		expect( () => __createStore() ).toThrow( 'The store instance already exists.' );
	} );

	it( 'should add a middleware that blocks the state update by not running next(action)', () => {
		// Arrange.
		__addMiddleware( () => () => () => {
			return null;
		} );

		const { slice, wrapper } = createStoreEntities();

		// Act.
		const { result } = renderHook(
			() => {
				const dispatchAction = useDispatch();

				dispatchAction( slice.actions.setValue( 4 ) );

				return useSelector( ( state: SliceStateRoot ) => state.slice.value );
			},
			{ wrapper }
		);

		// Assert.
		expect( result.current ).toBe( 1 );
	} );

	it( 'should add a middleware that does not interfere with the state update', () => {
		// Arrange.
		const middlewareNextAction = jest.fn();

		__addMiddleware( () => ( next: Dispatch< AnyAction > ) => ( action: AnyAction ) => {
			middlewareNextAction( action );

			next( action );
		} );

		const { slice, wrapper } = createStoreEntities();

		// Act.
		const { result } = renderHook(
			() => {
				const dispatchAction = useDispatch();

				dispatchAction( slice.actions.setValue( 4 ) );

				return useSelector( ( state: SliceStateRoot ) => state.slice.value );
			},
			{ wrapper }
		);

		// Assert.
		expect( result.current ).toBe( 4 );

		expect( middlewareNextAction ).toHaveBeenCalledWith( slice.actions.setValue( 4 ) );
	} );

	it( 'should dispatch an action without using hooks', () => {
		// Arrange.
		const slice = __createSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {
				setValue: ( state, action ) => {
					state.value = action.payload;
				},
			},
		} );

		__registerSlice( slice );

		const store = __createStore();

		// Act.
		store.dispatch( slice.actions.setValue( 6 ) );

		const stateResult = store.getState().slice.value;

		// Assert.
		expect( stateResult ).toBe( 6 );
	} );

	it( 'should collect actions that are dispatched before the store exist, and run them when the store instance is created', () => {
		// Act.
		__dispatch( { type: 'slice/setValue', payload: 7 } );

		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), {
			wrapper,
		} );

		// Assert.
		expect( result.current ).toBe( 7 );
	} );

	it( 'should delete the store instance', () => {
		// Arrange.
		const { store } = createStoreEntities();

		let instance = __getStore();

		// Assert.
		expect( instance ).toEqual( store );

		// Act.
		__deleteStore();

		instance = __getStore();

		// Assert.
		expect( instance ).toBeNull();
	} );

	it( 'should delete the added slices', () => {
		// Arrange.
		createStoreEntities();

		// Act.
		__deleteStore();

		// Arrange.
		const store = __createStore();

		const wrapper = ( { children }: PropsWithChildren ) => (
			<StoreProvider store={ store }>{ children }</StoreProvider>
		);

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice ), { wrapper } );

		// Assert.
		expect( result.current ).toBeUndefined();
		expect( console ).toHaveErrored();
	} );

	it( 'should delete the added middlewares', () => {
		// Arrange.
		// Registering a middleware that blocks the state update by not running next(action).
		__addMiddleware( () => () => () => {
			return null;
		} );

		createStoreEntities();

		// Act.
		__deleteStore();

		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook(
			() => {
				const dispatchAction = useDispatch();

				dispatchAction( slice.actions.setValue( 8 ) );

				return useSelector( ( state: SliceStateRoot ) => state.slice.value );
			},
			{ wrapper }
		);

		// Assert.
		expect( result.current ).toBe( 8 );
	} );

	it( 'should support dispatching async actions', async () => {
		// Arrange.
		const incrementBy = __createAsyncThunk( 'value/incrementBy', async ( value: number ) => {
			return value;
		} );

		const slice = __createSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {
				increment: ( state ) => {
					state.value += 1;
				},
			},
			extraReducers: ( builder ) => {
				builder.addCase( incrementBy.fulfilled, ( state, action ) => {
					state.value += action.payload;
				} );
			},
		} );

		__registerSlice( slice );

		const store = __createStore();

		// Act.
		jest.useFakeTimers();

		store.dispatch( incrementBy( 2 ) );

		// Regular reducer usage to ensure it works properly.
		store.dispatch( slice.actions.increment() );

		await jest.runAllTimersAsync();

		// Assert.
		expect( store.getState().slice.value ).toBe( 4 );
	} );
} );
