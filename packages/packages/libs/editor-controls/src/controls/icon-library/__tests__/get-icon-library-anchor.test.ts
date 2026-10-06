import { getIconLibraryAnchor } from '../get-icon-library-anchor';

const CONTROL_LEFT = 72;
const CONTROL_TOP = 40;
const CONTROL_WIDTH = 268;
const ACTION_GROUP_TOP = 156;

describe( 'getIconLibraryAnchor', () => {
	it( 'uses the control left and width, and the action group top', () => {
		// Arrange.
		const containerRect = { top: CONTROL_TOP, left: CONTROL_LEFT, width: CONTROL_WIDTH };
		const buttonGroupRect = { top: ACTION_GROUP_TOP };

		// Act.
		const anchor = getIconLibraryAnchor( containerRect, buttonGroupRect );

		// Assert.
		expect( anchor ).toEqual( {
			top: ACTION_GROUP_TOP,
			left: CONTROL_LEFT,
			width: CONTROL_WIDTH,
		} );
	} );

	it( 'falls back to the control top when the action group is missing', () => {
		// Arrange.
		const containerRect = { top: CONTROL_TOP, left: CONTROL_LEFT, width: CONTROL_WIDTH };

		// Act.
		const anchor = getIconLibraryAnchor( containerRect, null );

		// Assert.
		expect( anchor ).toEqual( {
			top: CONTROL_TOP,
			left: CONTROL_LEFT,
			width: CONTROL_WIDTH,
		} );
	} );

	it( 'returns null when the control cannot be measured', () => {
		// Arrange.
		// Act.
		const missing = getIconLibraryAnchor( null, { top: ACTION_GROUP_TOP } );
		const zeroWidth = getIconLibraryAnchor( { top: CONTROL_TOP, left: CONTROL_LEFT, width: 0 }, null );

		// Assert.
		expect( missing ).toBeNull();
		expect( zeroWidth ).toBeNull();
	} );
} );
