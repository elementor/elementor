import { decodeResourceVariable } from '../resources';

describe( 'decodeResourceVariable', () => {
	beforeEach( () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	describe( 'successful decoding', () => {
		it( 'should decode a URI-encoded string', () => {
			const encoded = 'hello%20world';
			const result = decodeResourceVariable( encoded );
			expect( result ).toBe( 'hello world' );
		} );

		it( 'should decode special characters', () => {
			const encoded = 'test%2Fpath%3Fquery%3Dvalue';
			const result = decodeResourceVariable( encoded );
			expect( result ).toBe( 'test/path?query=value' );
		} );

		it( 'should return the same string if already decoded', () => {
			const decoded = 'already-decoded-string';
			const result = decodeResourceVariable( decoded );
			expect( result ).toBe( decoded );
		} );

		it( 'should handle empty string', () => {
			const result = decodeResourceVariable( '' );
			expect( result ).toBe( '' );
		} );

		it( 'should handle string with no encoding', () => {
			const plain = 'simple-text';
			const result = decodeResourceVariable( plain );
			expect( result ).toBe( plain );
		} );
	} );

	describe( 'middle dot character removal', () => {
		it( 'should remove middle dot characters from decoded string', () => {
			const input = 'test·value';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'testvalue' );
		} );

		it( 'should remove multiple middle dots', () => {
			const input = 'test·multiple·dots·here';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'testmultipledotshere' );
		} );

		it( 'should remove middle dots after decoding', () => {
			const encoded = encodeURIComponent( 'test·value' );
			const result = decodeResourceVariable( encoded );
			expect( result ).toBe( 'testvalue' );
		} );

		it( 'should handle consecutive middle dots', () => {
			const input = 'test···value';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'testvalue' );
		} );
	} );

	describe( 'error handling', () => {
		it( 'should return original value when decoding fails', () => {
			const malformed = '%E0%A4%A';
			const result = decodeResourceVariable( malformed );
			expect( result ).toBe( malformed );
		} );

		it( 'should handle invalid URI sequences', () => {
			const invalid = '%%%';
			const result = decodeResourceVariable( invalid );
			expect( result ).toBe( invalid );
		} );

		it( 'should handle incomplete percent encoding', () => {
			const incomplete = 'test%2';
			const result = decodeResourceVariable( incomplete );
			expect( result ).toBe( incomplete );
		} );

		it( 'should not throw error on malformed input', () => {
			const malformed = '%';
			expect( () => decodeResourceVariable( malformed ) ).not.toThrow();
		} );
	} );

	describe( 'curly brace removal', () => {
		it( 'should remove leading and trailing curly braces', () => {
			const input = '{d9fb6fb}';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'd9fb6fb' );
		} );

		it( 'should remove only leading curly brace', () => {
			const input = '{abc123';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'abc123' );
		} );

		it( 'should remove only trailing curly brace', () => {
			const input = 'abc123}';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'abc123' );
		} );

		it( 'should preserve curly braces in the middle of string', () => {
			const input = 'ab{c}123';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'ab{c}123' );
		} );

		it( 'should remove outer curly braces but preserve inner ones', () => {
			const input = '{ab{c}123}';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'ab{c}123' );
		} );

		it( 'should handle empty curly braces', () => {
			const input = '{}';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( '' );
		} );

		it( 'should handle just opening brace', () => {
			const input = '{';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( '' );
		} );

		it( 'should handle just closing brace', () => {
			const input = '}';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( '' );
		} );

		it( 'should handle element ID with curly braces and URL encoding', () => {
			const input = encodeURIComponent( '{element123}' );
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'element123' );
		} );

		it( 'should remove curly braces and middle dots together', () => {
			const input = '{test·value}';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'testvalue' );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle strings with only middle dots', () => {
			const input = '···';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( '' );
		} );

		it( 'should handle unicode characters', () => {
			const unicode = encodeURIComponent( 'emoji🎨test' );
			const result = decodeResourceVariable( unicode );
			expect( result ).toBe( 'emoji🎨test' );
		} );

		it( 'should handle mixed encoded and plain text', () => {
			const mixed = 'plain%20text·with·dots';
			const result = decodeResourceVariable( mixed );
			expect( result ).toBe( 'plain textwithdots' );
		} );

		it( 'should handle element IDs with special characters', () => {
			const elementId = encodeURIComponent( 'element·123·456' );
			const result = decodeResourceVariable( elementId );
			expect( result ).toBe( 'element123456' );
		} );

		it( 'should preserve regular dots but remove middle dots', () => {
			const input = 'file.name·with·middle·dots.ext';
			const result = decodeResourceVariable( input );
			expect( result ).toBe( 'file.namewithmiddledots.ext' );
		} );
	} );
} );
