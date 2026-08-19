import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { selectData, selectIsDirty, slice } from '../store';

const DESKTOP_META = { breakpoint: 'desktop', state: null } as const;

function updateDisplayProp( id: string ) {
	dispatch(
		slice.actions.updateProps( {
			id,
			meta: DESKTOP_META,
			props: { display: 'block' },
		} )
	);
}

describe( 'defaultStyles store', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	it( 'should normalize array payloads from load and allow updateProps', () => {
		dispatch(
			slice.actions.load( {
				data: [] as never,
			} )
		);

		expect( selectData( getState() ) ).toEqual( {} );

		updateDisplayProp( 'h1' );

		const style = selectData( getState() ).h1;

		expect( style ).toBeDefined();
		expect( style?.variants ).toHaveLength( 1 );
		expect( style?.variants[ 0 ]?.props ).toEqual( { display: 'block' } );
		expect( selectIsDirty( getState() ) ).toBe( true );
	} );

	it( 'should allow updateProps after loading an empty object map', () => {
		dispatch(
			slice.actions.load( {
				data: {},
			} )
		);

		updateDisplayProp( 'h1' );

		const style = selectData( getState() ).h1;

		expect( style ).toBeDefined();
		expect( style?.variants ).toHaveLength( 1 );
		expect( style?.variants[ 0 ]?.props ).toEqual( { display: 'block' } );
		expect( selectIsDirty( getState() ) ).toBe( true );
	} );
} );
