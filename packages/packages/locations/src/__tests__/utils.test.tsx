import { resetFills, getFills } from '../locations';
import { createFillFunction } from '../utils';

describe( '@elementor/locations utils', () => {
	beforeEach( () => {
		resetFills();
	} );

	it( 'should create a valid fill function', () => {
		const addTestFill = createFillFunction( 'test' );

		addTestFill( {
			component: () => <div data-testid="element">First div</div>,
		} );

		addTestFill( {
			component: () => <div data-testid="element">First div</div>,
			priority: 5,
		} );

		const fills = getFills( 'test' );

		expect( fills ).toHaveLength( 2 );
		expect( fills[ 0 ].priority ).toBe( 5 );
		expect( fills[ 1 ].priority ).toBe( 10 );
	} );
} );
