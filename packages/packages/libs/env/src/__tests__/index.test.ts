import { __resetEnv, initEnv, InvalidEnvError, parseEnv } from '../index';

describe( '@elementor/env', () => {
	it( 'should warn for non existing env key', () => {
		// Arrange.
		const mockConsoleWarn = jest.fn();
		window.console.warn = mockConsoleWarn;
		__resetEnv();

		// Act.
		const { env } = parseEnv( 'unknown-key' );

		// Assert.
		expect( env ).toEqual( {} );
		expect( mockConsoleWarn ).toHaveBeenCalled();
	} );

	it( 'should warn when the returned value is not an object', () => {
		// Arrange.
		const mockConsoleWarn = jest.fn();
		window.console.warn = mockConsoleWarn;
		initEnv( {
			key: 'not-an-object' as unknown as object, // Emulate runtime error.
		} );

		// Act.
		const { env } = parseEnv( 'key' );

		// Assert.
		expect( env ).toEqual( {} );
		expect( mockConsoleWarn ).toHaveBeenCalled();
	} );

	it( 'should validate the env data when passing a parsing function', () => {
		// Arrange
		const mockConsoleWarn = jest.fn();
		window.console.warn = mockConsoleWarn;
		initEnv( {
			validEnv: {
				test: 'value',
			},
			invalidEnv: {
				test: 'value',
			},
		} );

		// Act.
		const { env: validEnv } = parseEnv( 'validEnv', ( envData ) => {
			return envData as {
				test: string;
			};
		} );

		const { env: invalidEnv } = parseEnv( 'invalidEnv', () => {
			throw new InvalidEnvError( 'error' );
		} );

		// Assert.
		expect( validEnv ).toEqual( { test: 'value' } );
		expect( invalidEnv ).toEqual( {} );
		expect( mockConsoleWarn ).toHaveBeenCalledWith( 'invalidEnv - error' );
	} );

	it( 'should support a standalone validation', () => {
		// Arrange
		const mockConsoleWarn = jest.fn();
		window.console.warn = mockConsoleWarn;
		initEnv( {} );

		// Act.
		const { validateEnv } = parseEnv( 'unknown-key' );

		validateEnv();

		// Assert.
		expect( mockConsoleWarn ).toHaveBeenCalled();
	} );

	it( 'should support iterating over the env properties', () => {
		// Arrange
		initEnv( {
			key: {
				test: 'value',
			},
		} );

		// Act.
		const { env } = parseEnv( 'key' );

		// Assert.
		expect( Object.keys( env ) ).toEqual( [ 'test' ] );
	} );

	it( 'should throw any non-env errors from the parsing function', () => {
		// Arrange
		initEnv( {
			key: {
				test: 'value',
			},
		} );

		// Act.
		const { validateEnv } = parseEnv( 'key', () => {
			throw new Error( 'custom-error' );
		} );

		// Assert.
		expect( () => {
			validateEnv();
		} ).toThrowError( 'custom-error' );
	} );
} );
