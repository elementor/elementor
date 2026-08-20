import { DEFAULT_MAX_TOOLBAR_ACTIONS, MIN_APP_BAR_WIDTH } from '../../constants';
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

	it( "should return the minimum inline actions at the app bar's min-width floor", () => {
		expect( getMaxToolbarActions( MIN_APP_BAR_WIDTH ) ).toEqual( { tools: 1, utilities: 0 } );
	} );

	it( "should fully collapse the utilities menu below the min-width floor, since its primary action button has a fixed minimum width and can't shrink further", () => {
		expect( getMaxToolbarActions( MIN_APP_BAR_WIDTH - 1 ) ).toEqual( { tools: 0, utilities: 0 } );
	} );

	it( 'should shrink further as the container gets narrower', () => {
		const wide = getMaxToolbarActions( 1400 );
		const medium = getMaxToolbarActions( 1000 );
		const atFloor = getMaxToolbarActions( MIN_APP_BAR_WIDTH );

		expect( medium.tools ).toBeLessThan( wide.tools );
		expect( medium.utilities ).toBeLessThan( wide.utilities );
		expect( atFloor.tools ).toBeLessThanOrEqual( medium.tools );
		expect( atFloor.utilities ).toBeLessThanOrEqual( medium.utilities );
	} );
} );
