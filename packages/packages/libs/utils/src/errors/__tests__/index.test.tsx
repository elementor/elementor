import { createError } from '../create-error';
import { ElementorError } from '../elementor-error';
import { ensureError } from '../ensure-error';

describe( 'createError', () => {
	it( 'should return an error class with the correct code and message', () => {
		type CustomErrorContext = {
			customField: string;
		};

		// Arrange.
		const code = 'test-error';
		const message = 'This is a test error';
		const CustomError = createError< CustomErrorContext >( { code, message } );

		// Act.
		const error = new CustomError( {
			cause: new Error( 'internal' ),
			context: { customField: 'customValue' },
		} );

		// Assert.
		expect( error ).toBeInstanceOf( ElementorError );

		expect( error.code ).toBe( code );
		expect( error.message ).toBe( message );
		expect( error.context ).toEqual( { customField: 'customValue' } );
		expect( error.cause ).toEqual( new Error( 'internal' ) );
	} );
} );

describe( 'ensureError', () => {
	it( 'should return the same error instance when the input is an error', () => {
		// Arrange.
		const TestError = createError( { code: 'test-error', message: 'This is a test error' } );
		const error = new TestError();

		// Act.
		const result = ensureError( error );

		// Assert.
		expect( result ).toBe( error );
	} );

	it( 'should return an error with the stringified input in the error message when the input is not an error', () => {
		// Arrange.
		const errorObject = { message: 'test error' };
		const expectedMessage = JSON.stringify( errorObject );

		// Act.
		const result = ensureError( errorObject );

		// Assert.
		expect( result ).toBeInstanceOf( Error );
		expect( result.message ).toContain( expectedMessage );
	} );

	it( "should return an error when the input can't be stringified", () => {
		// Arrange.
		const errorObject = { circular: {} };
		errorObject.circular = errorObject;

		// Act.
		const result = ensureError( errorObject );

		// Assert.
		expect( result ).toBeInstanceOf( Error );
		expect( result.cause ).toBeInstanceOf( TypeError );
	} );
} );
