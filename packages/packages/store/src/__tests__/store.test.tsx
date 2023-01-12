import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
	createStoreService,
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

const createStoreEntities = ( storeService: ReturnType<typeof createStoreService>, { initialValue = 1 }: Config = {} ) => {
	const slice = storeService.registerSlice( {
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

	const store = storeService.createStore();

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
	it( 'should set an initial state of a slice', () => {
		// Arrange.
		const storeService = createStoreService();

		const { wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		// Assert.
		expect( result.current ).toBe( 1 );
	} );

	it( 'should update the state value of the slice', () => {
		// Arrange.
		const storeService = createStoreService();

		const { slice, wrapper } = createStoreEntities( storeService );

		// Act.
		const { result } = renderHook( () => {
			const dispatch = useDispatch();

			dispatch( slice.actions.setValue( 3 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 3 );
	} );

	it( 'should throw an error when trying to register a slice with the same name more than once', () => {
		// Arrange.
		const storeService = createStoreService();

		storeService.registerSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		// Assert.
		expect( () => {
			storeService.registerSlice( {
				name: 'slice',
				initialState: {
					value: 1,
				},
				reducers: {},
			} );
		} ).toThrow( 'Slice with name "slice" already exists.' );
	} );

	it( 'should throw an error when trying to re-create the store on the same storeService instance', () => {
		// Arrange.
		const storeService = createStoreService();

		storeService.registerSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		storeService.createStore();

		// Assert.
		expect( () => storeService.createStore() ).toThrow( 'The store instance already exists.' );
	} );

	it( 'should register a middleware that blocks the state update by not running next(action)', () => {
		// Arrange.
		const storeService = createStoreService();

		storeService.registerMiddleware( () => () => () => {} );

		const { slice, wrapper } = createStoreEntities( storeService );

		// Act.
		const { result } = renderHook( () => {
			const dispatch = useDispatch();

			dispatch( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 1 );
	} );

	it( 'should register a middleware that does not interfere with the state update', () => {
		// Arrange.
		const storeService = createStoreService();

		storeService.registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			next( action );
		} );

		const { slice, wrapper } = createStoreEntities( storeService );

		// Act.
		const { result } = renderHook( () => {
			const dispatch = useDispatch();

			dispatch( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 4 );
	} );

	it( 'should dispatch an action without using hooks', () => {
		// Arrange.
		const storeService = createStoreService();

		storeService.registerSlice( {
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

		const store = storeService.createStore();

		// Act.
		store.dispatch( { type: 'slice/setValue', payload: 6 } );

		const stateResult = store.getState().slice.value;

		// Assert.
		expect( stateResult ).toBe( 6 );
	} );

	it( 'should collect actions that are dispatched before the store exist, and run them when the store instance is created', () => {
		// Arrange.
		const storeService = createStoreService();

		// Act.
		storeService.dispatch( { type: 'slice/setValue', payload: 7 } );

		const { wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		// Assert.
		expect( result.current ).toBe( 7 );
	} );

	it( 'should delete the store instance', () => {
		// Arrange.
		const storeService = createStoreService();

		const store = storeService.createStore();

		let instance = storeService.getStore();

		// Assert.
		expect( instance ).toEqual( store );

		// Act.
		storeService.deleteStore();

		instance = storeService.getStore();

		// Assert.
		expect( instance ).toBeNull();

		expect( store.getState() ).toBeNull();
	} );

	it( 'should delete the registered slices', () => {
		// Arrange.
		const storeService = createStoreService();

		createStoreEntities( storeService );

		// Act.
		storeService.deleteStore();

		// Arrange.
		const store = storeService.createStore();

		const wrapper: React.FC = ( { children } ) => (
			<StoreProvider store={ store }>
				{ children }
			</StoreProvider>
		);

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice ), { wrapper } );

		// Assert.
		expect( result.current ).toBeUndefined();
	} );

	it( 'should delete the registered middlewares', () => {
		// Arrange.
		const storeService = createStoreService();

		// Registering a middleware that blocks the state update by not running next(action).
		storeService.registerMiddleware( () => () => () => {} );

		createStoreEntities( storeService );

		// Act.
		storeService.deleteStore();

		const { slice, wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => {
			const dispatch = useDispatch();

			dispatch( slice.actions.setValue( 8 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 8 );
	} );
} );
