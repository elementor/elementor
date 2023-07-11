import { sync } from '../index';
import { openRoute } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	...jest.requireActual( '@elementor/v1-adapters' ),
	openRoute: jest.fn(),
} ) );

describe( '@elementor/top-bar - Sync', () => {
	it( 'should redirect old hamburger menu to the default elements panel', () => {
		// Arrange.
		sync();

		// Act.
		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route: 'panel/menu',
			},
		} ) );

		// Assert.
		expect( openRoute ).toHaveBeenCalledWith( 'panel/elements/categories' );

		// Act - Change to non-related route.
		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route: 'some/other/route',
			},
		} ) );

		// Assert - Should not be called again.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
	} );
} );
