import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
	createStore,
	getStore,
	registerSlice,
	registerMiddleware,
	dispatch,
	deleteStore,
	StoreProvider,
	useSelector,
	useDispatch,
	Dispatch,
	AnyAction,
} from '../index';

interface SliceStateRoot {
	slice: {
		value?: number;
	}
}

interface Config {
	initialValue?: SliceStateRoot['slice']['value'];
}

const createStoreEntities = ( { initialValue = 1 }: Config = {} ) => {
	const slice = registerSlice( {
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

	const store = createStore();

	const wrapper: React.FC = ( { children } ) => (
		<StoreProvider store={ store }>
			{ children }
		</StoreProvider>
	);

	return {
		slice,
		store,
		wrapper,
	};
};

describe( '@elementor/store', () => {
	afterEach( () => {
		deleteStore();
	} );

	it( 'should set an initial state of a slice', () => {
		// Arrange.
		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		// Assert.
		expect( result.current ).toBe( 1 );
	} );

	it( 'should update the state value of the slice', () => {
		// Arrange.
		const { slice, wrapper } = createStoreEntities();

		// Act.
		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 3 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 3 );
	} );

	it( 'should throw an error when trying to register a slice with the same name more than once', () => {
		// Arrange.
		registerSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		// Assert.
		expect( () => {
			registerSlice( {
				name: 'slice',
				initialState: {
					value: 1,
				},
				reducers: {},
			} );
		} ).toThrow( 'Slice with name "slice" already exists.' );
	} );

	it( 'should throw an error when trying to re-create the store', () => {
		// Arrange.
		registerSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		createStore();

		// Assert.
		expect( () => createStore() ).toThrow( 'The store instance already exists.' );
	} );

	it( 'should register a middleware that blocks the state update by not running next(action)', () => {
		// Arrange.
		registerMiddleware( () => () => () => {} );

		const { slice, wrapper } = createStoreEntities();

		// Act.
		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 1 );
	} );

	it( 'should register a middleware that does not interfere with the state update', () => {
		// Arrange.
		registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			next( action );
		} );

		const { slice, wrapper } = createStoreEntities();

		// Act.
		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 4 );
	} );

	it( 'should dispatch an action without using hooks', () => {
		// Arrange.
		registerSlice( {
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

		const store = createStore();

		// Act.
		store.dispatch( { type: 'slice/setValue', payload: 6 } );

		const stateResult = store.getState().slice.value;

		// Assert.
		expect( stateResult ).toBe( 6 );
	} );

	it( 'should collect actions that are dispatched before the store exist, and run them when the store instance is created', () => {
		// Act.
		dispatch( { type: 'slice/setValue', payload: 7 } );

		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		// Assert.
		expect( result.current ).toBe( 7 );
	} );

	it( 'should delete the store instance', () => {
		// Arrange.
		const { store } = createStoreEntities();

		let instance = getStore();

		// Assert.
		expect( instance ).toEqual( store );

		// Act.
		deleteStore();

		instance = getStore();

		// Assert.
		expect( instance ).toBeNull();
	} );

	it( 'should delete the registered slices', () => {
		// Arrange.
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		createStoreEntities();

		// Act.
		deleteStore();

		// Arrange.
		const store = createStore();

		const wrapper: React.FC = ( { children } ) => (
			<StoreProvider store={ store }>
				{ children }
			</StoreProvider>
		);

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice ), { wrapper } );

		// Assert.
		expect( result.current ).toBeUndefined();

		// Redux sends an error to the console when no reducer is found.
		// eslint-disable-next-line no-console
		expect( console.error ).toHaveBeenCalled();
	} );

	it( 'should delete the registered middlewares', () => {
		// Arrange.
		// Registering a middleware that blocks the state update by not running next(action).
		registerMiddleware( () => () => () => {} );

		createStoreEntities();

		// Act.
		deleteStore();

		const { slice, wrapper } = createStoreEntities( );

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 8 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 8 );
	} );
} );
