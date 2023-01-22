import { openRoute, runCommand } from '../';

describe( '@elementor/v1-adapters/dispatchers', () => {
	beforeEach( () => {
		( window as any ).$e = {
			run: jest.fn(),
			route: jest.fn(),
		};
	} );

	afterEach( () => {
		delete ( window as any ).$e;
	} );

	it( 'should run a V1 command that returns Promise', () => {
		// Arrange.
		const command = 'editor/documents/open',
			args = { test: 'arg' };

		( window as any ).$e.run.mockReturnValue( Promise.resolve( 'result' ) );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( ( window as any ).$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should run a V1 command that returns jQuery.Deferred object', () => {
		// Arrange.
		const command = 'editor/documents/open',
			args = { test: 'arg' };

		( window as any ).$e.run.mockReturnValue( makeJQueryDeferred( 'result' ) );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( ( window as any ).$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should run a V1 command that returns a plain value', () => {
		// Arrange.
		const command = 'editor/documents/open',
			args = { test: 'arg' };

		( window as any ).$e.run.mockReturnValue( 'result' );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( ( window as any ).$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should reject when trying to run a V1 command and `$e.run()` is unavailable', () => {
		// Arrange.
		delete ( window as any ).$e.run;

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
		expect( ( window as any ).$e.route ).toHaveBeenCalledWith( route );
		expect( result ).toEqual( Promise.resolve() );
	} );

	it( 'should reject when failing to open a V1 route', () => {
		// Arrange.
		const route = 'test/route';

		( window as any ).$e.route.mockImplementation( ( r: string ) => {
			throw `Cannot find ${ r }`;
		} );

		// Act.
		expect( () => openRoute( route ) )
			.rejects
			.toEqual( 'Cannot find test/route' );
	} );

	it( 'should reject when trying to open a V1 route and `$e.route()` is unavailable', () => {
		// Arrange.
		delete ( window as any ).$e.route;

		// Act & Assert.
		expect( () => openRoute( 'test/route' ) )
			.rejects
			.toEqual( '`$e.route()` is not available' );
	} );
} );

function makeJQueryDeferred( value: any ) {
	return {
		then: () => value,
		promise: () => value,
		fail: () => {
			throw 'Error';
		},
	};
}
