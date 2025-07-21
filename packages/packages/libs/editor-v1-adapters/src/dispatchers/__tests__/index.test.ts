import { openRoute, registerRoute, runCommand, runCommandSync } from '../dispatchers';
import { type ExtendedWindow } from '../types';

// Make all properties required for easier mocking & spying.
type EWindow = ExtendedWindow & {
	$e: RequiredDeep< ExtendedWindow[ '$e' ] >;
};

type RequiredDeep< T > = {
	[ P in keyof T ]-?: RequiredDeep< T[ P ] >;
};

describe( 'dispatchers', () => {
	const eWindow = window as unknown as EWindow;

	beforeEach( () => {
		eWindow.$e = {
			run: jest.fn(),
			internal: jest.fn(),
			route: jest.fn(),
			routes: {
				register: jest.fn(),
			},
		};
	} );

	it( 'should run a sync V1 command', () => {
		// Arrange.
		const command = 'editor/documents/open';
		const args = { test: 'arg' };

		jest.mocked( eWindow.$e.run ).mockReturnValue( 'result' );

		// Act.
		const result = runCommandSync( command, args );

		// Assert.
		expect( eWindow.$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toBe( 'result' );
	} );

	it( 'should run a sync V1 internal command', () => {
		// Arrange.
		const command = 'editor/documents/open';
		const args = { test: 'arg' };

		jest.mocked( eWindow.$e.internal ).mockReturnValue( 'result' );

		// Act.
		const result = runCommandSync( command, args, { internal: true } );

		// Assert.
		expect( eWindow.$e.internal ).toHaveBeenCalledWith( command, args );
		expect( result ).toBe( 'result' );
	} );

	it( 'should run an async V1 command that returns Promise', () => {
		// Arrange.
		const command = 'editor/documents/open';
		const args = { test: 'arg' };

		jest.mocked( eWindow.$e.run ).mockReturnValue( Promise.resolve( 'result' ) );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( eWindow.$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should run an internal async V1 command that returns Promise', () => {
		// Arrange.
		const command = 'editor/documents/open';
		const args = { test: 'arg' };

		jest.mocked( eWindow.$e.internal ).mockReturnValue( Promise.resolve( 'result' ) );

		// Act.
		const result = runCommand( command, args, { internal: true } );

		// Assert.
		expect( eWindow.$e.internal ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should throw when trying to run an async V1 and `$e.run` is unavailable', () => {
		// Arrange.
		delete ( window as { $e?: unknown } ).$e;

		// Act & Assert.
		expect( () => runCommand( 'test' ) ).rejects.toEqual( new Error( `\`$e.run()\` is not available` ) );
	} );

	it( 'should run an async V1 command that returns jQuery.Deferred object', () => {
		// Arrange.
		const command = 'editor/documents/open';
		const args = { test: 'arg' };

		jest.mocked( eWindow.$e.run ).mockReturnValue( makeJQueryDeferred( 'result' ) );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( eWindow.$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should run an async V1 command that returns a plain value', () => {
		// Arrange.
		const command = 'editor/documents/open';
		const args = { test: 'arg' };

		jest.mocked( eWindow.$e.run ).mockReturnValue( 'result' );

		// Act.
		const result = runCommand( command, args );

		// Assert.
		expect( eWindow.$e.run ).toHaveBeenCalledWith( command, args );
		expect( result ).toEqual( Promise.resolve( 'result' ) );
	} );

	it( 'should open a V1 route', () => {
		// Arrange.
		const route = 'test/route';

		// Act.
		const result = openRoute( route );

		// Assert.
		expect( eWindow.$e.route ).toHaveBeenCalledWith( route );
		expect( result ).toEqual( Promise.resolve() );
	} );

	it( 'should reject when failing to open a V1 route', () => {
		// Arrange.
		const route = 'test/route';

		jest.mocked( eWindow.$e.route ).mockImplementation( ( r: string ) => {
			throw `Cannot find ${ r }`;
		} );

		// Act.
		expect( () => eWindow.$e.route( route ) ).toThrow( 'Cannot find test/route' );
	} );

	it.each( [
		[ 'test/route', [ 'test', 'route' ] ],
		[ 'test/test2/route', [ 'test/test2', 'route' ] ],
	] )( 'should register the route `%s` in v1', ( route, params ) => {
		// Act.
		registerRoute( route );

		// Assert.
		expect( eWindow.$e.routes.register ).toHaveBeenCalledWith( ...params, expect.any( Function ) );
	} );

	it( 'should throw if trying to register invalid route', () => {
		// Act & Assert.
		expect( () => registerRoute( 'test' ) ).rejects.toEqual( '`test` is an invalid route' );
	} );

	it.each( [
		[ '$e.route()', () => openRoute( 'test/route' ) ],
		[ '$e.routes.register()', () => registerRoute( 'test/route' ) ],
	] )( 'should throw when trying to use V1 and `%s` is unavailable', ( v1Method, action ) => {
		// Arrange.
		delete ( window as { $e?: unknown } ).$e;

		// Act & Assert.
		expect( () => action() ).rejects.toEqual( `\`${ v1Method }\` is not available` );
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
