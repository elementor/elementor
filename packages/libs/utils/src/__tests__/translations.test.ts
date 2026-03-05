import { createTranslate } from '../translations';

const MOCK_TRANSLATIONS: Record< string, string > = {
	'test.simple': 'Hello World',
	'test.with_positional': 'Hello %1$s and %2$s',
	'test.with_sequential': 'Hello %s, welcome to %s',
	'test.mixed': '%1$s has %s items',
	'test.empty_value': '',
};

const CONFIG_KEY = 'e-test-module';

function setTranslations( translations: Record< string, string > | undefined ) {
	window.elementorAppConfig = {
		[ CONFIG_KEY ]: { translations },
	} as typeof window.elementorAppConfig;
}

describe( 'createTranslate', () => {
	afterEach( () => {
		window.elementorAppConfig = undefined;
	} );

	describe( 'key lookup', () => {
		it( 'should return the translated string for a known key', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'test.simple' ) ).toBe( 'Hello World' );
		} );

		it( 'should return the key itself when translation is missing', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'nonexistent.key' ) ).toBe( 'nonexistent.key' );
		} );

		it( 'should return the key when translations object is empty', () => {
			setTranslations( {} );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'any.key' ) ).toBe( 'any.key' );
		} );

		it( 'should return the key when translations is undefined', () => {
			setTranslations( undefined );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'any.key' ) ).toBe( 'any.key' );
		} );

		it( 'should return the key when elementorAppConfig is undefined', () => {
			window.elementorAppConfig = undefined;
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'any.key' ) ).toBe( 'any.key' );
		} );

		it( 'should return the key when the value is an empty string', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'test.empty_value' ) ).toBe( 'test.empty_value' );
		} );
	} );

	describe( 'placeholder replacement', () => {
		it( 'should replace positional placeholders (%1$s, %2$s)', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'test.with_positional', 'Alice', 'Bob' ) ).toBe( 'Hello Alice and Bob' );
		} );

		it( 'should replace sequential %s placeholders in order', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'test.with_sequential', 'Alice', 'Elementor' ) ).toBe( 'Hello Alice, welcome to Elementor' );
		} );

		it( 'should not modify the string when no args are provided', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'test.with_positional' ) ).toBe( 'Hello %1$s and %2$s' );
		} );

		it( 'should leave unreplaced placeholders when fewer args are given', () => {
			setTranslations( MOCK_TRANSLATIONS );
			const t = createTranslate( { configKey: CONFIG_KEY } );

			expect( t( 'test.with_positional', 'Alice' ) ).toBe( 'Hello Alice and %2$s' );
		} );
	} );

	describe( 'default translations fallback', () => {
		it( 'should use default translations when no remote translations are available', () => {
			window.elementorAppConfig = undefined;
			const t = createTranslate( {
				configKey: CONFIG_KEY,
				defaultStrings: { 'fallback.key': 'Fallback Value' },
			} );

			expect( t( 'fallback.key' ) ).toBe( 'Fallback Value' );
		} );

		it( 'should let remote translations override defaults', () => {
			setTranslations( { 'fallback.key': 'Remote Value' } );
			const t = createTranslate( {
				configKey: CONFIG_KEY,
				defaultStrings: { 'fallback.key': 'Default Value' },
			} );

			expect( t( 'fallback.key' ) ).toBe( 'Remote Value' );
		} );
	} );
} );
