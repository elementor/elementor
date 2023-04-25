import { isRouteActive, getCurrentEditMode } from '../';

type ExtendedWindow = Window & {
	$e: {
		routes: {
			isPartOf: jest.Mock;
		}
	},
	elementor: {
		channels: {
			dataEditMode: {
				request: jest.Mock;
			}
		}
	}
}

describe( '@elementor/v1-adapters - Readers', () => {
	let eIsPartOf: jest.Mock,
		eGetEditMode: jest.Mock;

	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.$e = {
			routes: {
				isPartOf: jest.fn(),
			},
		};

		extendedWindow.elementor = {
			channels: {
				dataEditMode: {
					request: jest.fn(),
				},
			},
		};

		eIsPartOf = extendedWindow.$e.routes.isPartOf;
		eGetEditMode = extendedWindow.elementor.channels.dataEditMode.request;
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

	it( 'should return the current edit mode', () => {
		// Arrange.
		const editMode = 'edit';

		eGetEditMode.mockReturnValue( editMode );

		// Act.
		const result = getCurrentEditMode();

		// Assert.
		expect( result ).toEqual( editMode );
		expect( eGetEditMode ).toHaveBeenCalledTimes( 1 );
	} );
} );
