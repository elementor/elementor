import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
	StoreProvider,
	useSelector,
	useDispatch,
	registerSlice,
	registerMiddleware,
	createStore,
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
	it( 'should verify the initial state of the slice', async () => {
		const { wrapper } = createStoreEntities();

		const { result } = renderHook( () => useSelector( ( state: SliceStateRoot ) => state.slice.value ), { wrapper } );

		expect( result.current ).toBe( 1 );
	} );

	it( 'should update the state value of the slice', async () => {
		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			const dispatch = useDispatch();

			dispatch( slice.actions.setValue( 3 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 3 );
	} );

	it( 'should register a middleware that blocks the state update by not running next(action)', async () => {
		registerMiddleware( () => ( next: Dispatch<AnyAction> ) => ( action: any ) => {
			// eslint-disable-next-line no-console
			console.log( 'blocking: ', next, action );
		} );

		const { slice, wrapper } = createStoreEntities();

		const { result } = renderHook( () => {
			const dispatch = useDispatch();

			dispatch( slice.actions.setValue( 4 ) );

			return useSelector( ( state: SliceStateRoot ) => state.slice.value );
		}, { wrapper } );

		expect( result.current ).toBe( 1 );
	} );
} );
