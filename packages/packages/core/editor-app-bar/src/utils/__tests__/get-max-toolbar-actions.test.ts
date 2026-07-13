import { DEFAULT_MAX_TOOLBAR_ACTIONS } from '../../contexts/app-bar-size-context';
import { getMaxToolbarActions } from '../get-max-toolbar-actions';

describe( 'getMaxToolbarActions', () => {
	it( 'should return the default (widest) values when the width has not been measured yet', () => {
		expect( getMaxToolbarActions( 0 ) ).toEqual( DEFAULT_MAX_TOOLBAR_ACTIONS );
	} );

	it( 'should return the default values on wide containers', () => {
		expect( getMaxToolbarActions( 1400 ) ).toEqual( DEFAULT_MAX_TOOLBAR_ACTIONS );
	} );

	it( 'should return fewer inline actions on medium containers', () => {
		expect( getMaxToolbarActions( 1000 ) ).toEqual( { tools: 3, utilities: 2 } );
	} );

	it( 'should return the minimum inline actions on narrow containers', () => {
		expect( getMaxToolbarActions( 400 ) ).toEqual( { tools: 1, utilities: 1 } );
	} );

	it( 'should shrink further as the container gets narrower', () => {
		const wide = getMaxToolbarActions( 1400 );
		const medium = getMaxToolbarActions( 1000 );
		const narrow = getMaxToolbarActions( 400 );

		expect( medium.tools ).toBeLessThan( wide.tools );
		expect( medium.utilities ).toBeLessThan( wide.utilities );
		expect( narrow.tools ).toBeLessThanOrEqual( medium.tools );
		expect( narrow.utilities ).toBeLessThanOrEqual( medium.utilities );
	} );
} );
