import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
	StoreProvider,
	useSelector,
	useDispatch,
	registerSlice,
	registerMiddleware,
	createStore,
	dispatch,
	resetStore,
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
		resetStore();
	} );

	it( 'should verify the initial state of the slice', () => {
		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		expect( result.current ).toBe( 1 );
	} );

	it( 'should update the state value of the slice', () => {
		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 3 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 3 );
	} );

	it( 'should register a middleware that blocks the state update by not running next(action)', () => {
		registerMiddleware( () => () => () => {} );

		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 1 );
	} );

	it( 'should register a middleware that does not intefer with the state update', () => {
		registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			next( action );
		} );

		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 4 );
	} );

	it( 'should dispatch an action without using the useDispatch hook', () => {
		registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			next( action );
		} );

		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			dispatch( { type: 'slice/setValue', payload: 6 } );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 6 );
	} );

	it( 'should collect actions that are dispatched before the store exist, and should run them when the store instance is created', () => {
		dispatch( { type: 'slice/setValue', payload: 7 } );

		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		expect( result.current ).toBe( 7 );
	} );

	it( 'should create a single instance of the store that when exists the createStore function should return it', () => {
		const firstStore = createStore();
		const secondStore = createStore();

		expect( firstStore ).toEqual( secondStore );
	} );
} );
