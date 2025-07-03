import { isRouteActive } from '../index';

type ExtendedWindow = Window & {
	$e: {
		routes: {
			isPartOf: jest.Mock;
		};
	};
};

describe( '@elementor/editor-v1-adapters - Readers', () => {
	let eIsPartOf: jest.Mock;

	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.$e = {
			routes: {
				isPartOf: jest.fn(),
			},
		};

		eIsPartOf = extendedWindow.$e.routes.isPartOf;
	} );

	it( 'should determine if a route is active', () => {
		// Arrange.
		const route = 'test/route';

		eIsPartOf.mockReturnValue( true );

		// Act.
		const result = isRouteActive( route );

		// Assert.
		expect( result ).toEqual( true );
		expect( eIsPartOf ).toHaveBeenCalledTimes( 1 );
		expect( eIsPartOf ).toHaveBeenCalledWith( route );
	} );
} );
