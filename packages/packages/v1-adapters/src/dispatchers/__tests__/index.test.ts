import { getCurrentEditMode, isRouteActive, openRoute, runCommand } from '../';

type ExtendedWindow = Window & {
	$e: {
		run: jest.Mock;
		route: jest.Mock;
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

describe( '@elementor/v1-adapters/dispatchers', () => {
	let eRun: jest.Mock,
		eRoute: jest.Mock,
		eIsPartOf: jest.Mock,
		eGetEditMode: jest.Mock;

	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.$e = {
			run: jest.fn(),
			route: jest.fn(),
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

		eRun = extendedWindow.$e.run;
		eRoute = extendedWindow.$e.route;
		eIsPartOf = extendedWindow.$e.routes.isPartOf;
		eGetEditMode = extendedWindow.elementor.channels.dataEditMode.request;
	} );

	afterEach( () => {
		delete ( window as unknown as { $e?: unknown } ).$e;
		delete ( window as unknown as { elementor?: unknown } ).elementor;
	} );

	it( 'should run a V1 command that returns Promise', () => {
		// Arrange.
		const command = 'editor/documents/open',
			args = { test: 'arg' };

		eRun.mockReturnValue( Promise.resolve( 'result' ) );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( eRun ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should run a V1 command that returns jQuery.Deferred object', () => {
		// Arrange.
		const command = 'editor/documents/open',
			args = { test: 'arg' };

		eRun.mockReturnValue( makeJQueryDeferred( 'result' ) );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( eRun ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should run a V1 command that returns a plain value', () => {
		// Arrange.
		const command = 'editor/documents/open',
			args = { test: 'arg' };

		eRun.mockReturnValue( 'result' );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( eRun ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should reject when trying to run a V1 command and `$e.run()` is unavailable', () => {
		// Arrange.
		delete ( window as { $e?: unknown } ).$e;

		// Act & Assert.
		expect( () => runCommand( 'editor/documents/open' ) )
			.rejects
			.toEqual( '`$e.run()` is not available' );
	} );

	it( 'should open a V1 route', () => {
		// Arrange.
		const route = 'test/route';

		// Act.
		const result = openRoute( route );

		// Assert.
		expect( eRoute ).toHaveBeenCalledWith( route );
		expect( result ).toEqual( Promise.resolve() );
	} );

	it( 'should reject when failing to open a V1 route', () => {
		// Arrange.
		const route = 'test/route';

		eRoute.mockImplementation( ( r: string ) => {
			throw `Cannot find ${ r }`;
		} );

		// Act.
		expect( () => openRoute( route ) )
			.rejects
			.toEqual( 'Cannot find test/route' );
	} );

	it( 'should reject when trying to open a V1 route and `$e.route()` is unavailable', () => {
		// Arrange.
		delete ( window as { $e?: unknown } ).$e;

		// Act & Assert.
		expect( () => openRoute( 'test/route' ) )
			.rejects
			.toEqual( '`$e.route()` is not available' );
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

function makeJQueryDeferred( value: unknown ) {
	return {
		then: () => value,
		promise: () => value,
		fail: () => {
			throw 'Error';
		},
	};
}
