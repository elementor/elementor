import { t } from '../translations';

const MOCK_STRINGS: Record< string, string > = {
	'test.simple': 'Hello World',
	'test.with_positional': 'Hello %1$s and %2$s',
	'test.with_sequential': 'Hello %s, welcome to %s',
	'test.mixed': '%1$s has %s items',
	'test.empty_value': '',
};

function setStrings( strings: Record< string, string > | undefined ) {
	window.elementorAppConfig = {
		'e-onboarding': {
			strings,
		},
	} as typeof window.elementorAppConfig;
}

describe( 't()', () => {
	afterEach( () => {
		window.elementorAppConfig = undefined;
	} );

	describe( 'key lookup', () => {
		it( 'should return the translated string for a known key', () => {
			setStrings( MOCK_STRINGS );

			expect( t( 'test.simple' ) ).toBe( 'Hello World' );
		} );

		it( 'should return the key itself when translation is missing', () => {
			setStrings( MOCK_STRINGS );

			expect( t( 'nonexistent.key' ) ).toBe( 'nonexistent.key' );
		} );

		it( 'should return the key when strings object is empty', () => {
			setStrings( {} );

			expect( t( 'any.key' ) ).toBe( 'any.key' );
		} );

		it( 'should return the key when strings is undefined', () => {
			setStrings( undefined );

			expect( t( 'any.key' ) ).toBe( 'any.key' );
		} );

		it( 'should return the key when elementorAppConfig is undefined', () => {
			window.elementorAppConfig = undefined;

			expect( t( 'any.key' ) ).toBe( 'any.key' );
		} );

		it( 'should return the key when the value is an empty string', () => {
			setStrings( MOCK_STRINGS );

			expect( t( 'test.empty_value' ) ).toBe( 'test.empty_value' );
		} );
	} );

	describe( 'placeholder replacement', () => {
		beforeEach( () => {
			setStrings( MOCK_STRINGS );
		} );

		it( 'should replace positional placeholders (%1$s, %2$s)', () => {
			expect( t( 'test.with_positional', 'Alice', 'Bob' ) ).toBe( 'Hello Alice and Bob' );
		} );

		it( 'should replace sequential %s placeholders in order', () => {
			expect( t( 'test.with_sequential', 'Alice', 'Elementor' ) ).toBe( 'Hello Alice, welcome to Elementor' );
		} );

		it( 'should not modify the string when no args are provided', () => {
			expect( t( 'test.with_positional' ) ).toBe( 'Hello %1$s and %2$s' );
		} );

		it( 'should leave unreplaced placeholders when fewer args are given', () => {
			expect( t( 'test.with_positional', 'Alice' ) ).toBe( 'Hello Alice and %2$s' );
		} );
	} );
} );
