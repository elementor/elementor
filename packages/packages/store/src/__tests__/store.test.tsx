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
	it( 'should verify the initial state of the slice', () => {
		const storeService = createStoreService();

		const { wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		expect( result.current ).toBe( 1 );
	} );

	it( 'should update the state value of the slice', () => {
		const storeService = createStoreService();

		const { slice, wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 3 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 3 );
	} );

	it( 'should register a middleware that blocks the state update by not running next(action)', () => {
		const storeService = createStoreService();

		storeService.registerMiddleware( () => () => () => {} );

		const { slice, wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 1 );
	} );

	it( 'should register a middleware that does not intefer with the state update', () => {
		const storeService = createStoreService();

		storeService.registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			next( action );
		} );

		const { slice, wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => {
			const dispatchAction = useDispatch();

			dispatchAction( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 4 );
	} );

	it( 'should dispatch an action without using the useDispatch hook', () => {
		const storeService = createStoreService();

		storeService.registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			next( action );
		} );

		const { wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => {
			storeService.dispatch( { type: 'slice/setValue', payload: 6 } );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 6 );
	} );

	it( 'should collect actions that are dispatched before the store exist, and should run them when the store instance is created', () => {
		const storeService = createStoreService();

		storeService.dispatch( { type: 'slice/setValue', payload: 7 } );

		const { wrapper } = createStoreEntities( storeService );

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		expect( result.current ).toBe( 7 );
	} );

	it( 'should reset the store instance', () => {
		const storeService = createStoreService();

		const store = storeService.createStore();

		let instance = storeService.getStore();

		expect( instance ).toEqual( store );

		storeService.resetStore();

		instance = storeService.getStore();

		expect( instance ).toBeNull();
	} );
} );
