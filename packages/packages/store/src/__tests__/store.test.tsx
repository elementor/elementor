import * as React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
	createStore,
	getStore,
	addSlice,
	addMiddleware,
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
	const slice = addSlice( {
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

	it( 'should throw an error when trying to add a slice with the same name more than once', () => {
		// Arrange.
		addSlice( {
			name: 'slice',
			initialState: {
				value: 1,
			},
			reducers: {},
		} );

		// Assert.
		expect( () => {
			addSlice( {
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
		addSlice( {
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

	it( 'should add a middleware that blocks the state update by not running next(action)', () => {
		// Arrange.
		addMiddleware( () => () => () => {
			return null;
		} );

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

	it( 'should add a middleware that does not interfere with the state update', () => {
		// Arrange.
		const middlewareNextAction = jest.fn();

		addMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: AnyAction ) => {
			middlewareNextAction( action );

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

		expect( middlewareNextAction ).toHaveBeenCalledWith( slice.actions.setValue( 4 ) );
	} );

	it( 'should dispatch an action without using hooks', () => {
		// Arrange.
		const slice = addSlice( {
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
		store.dispatch( slice.actions.setValue( 6 ) );

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

	it( 'should delete the added slices', () => {
		// Arrange.
		// Redux sends an error to the console when trying to create a store without slices.
		const spyOnConsoleError = jest.spyOn( console, 'error' ).mockReturnValue( undefined );

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

		expect( spyOnConsoleError ).toHaveBeenCalled();
	} );

	it( 'should delete the added middlewares', () => {
		// Arrange.
		// Registering a middleware that blocks the state update by not running next(action).
		addMiddleware( () => () => () => {
			return null;
		} );

		createStoreEntities();

		// Act.
		deleteStore();

		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 8 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		// Assert.
		expect( result.current ).toBe( 8 );
	} );
} );
