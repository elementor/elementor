import { sanitizeUrl } from 'elementor-editor-utils/helpers';

describe( 'elementor.helpers.sanitizeUrl', () => {
	test( 'should not affect valid URL', () => {
		expect( sanitizeUrl( 'https://example.com/?param=1' ) )
			.toBe( 'https://example.com/?param=1' );

		expect( sanitizeUrl( 'https://127.0.0.1/?page=homepage' ) )
			.toBe( 'https://127.0.0.1/?page=homepage' );

		expect( sanitizeUrl( 'https://mail.google.com/' ) )
			.toBe( 'https://mail.google.com/' );
	} );

	test( 'should translate URL containing unicode letters', () => {
		expect( sanitizeUrl( 'https://t.me/?page=garçon' ) )
			.toBe( 'https://t.me/?page=gar%C3%A7on' );
	} );

	test( 'should transform " character to prevent attribute leaks during html-rendering', () => {
		expect( sanitizeUrl( 'https://ex.com/?hack=22" style="display:block;"' ) )
			.toBe( 'https://ex.com/?hack=22%22%20style=%22display:block;%22' );
	} );

	test( 'should not allow injecting script tags', () => {
		expect( sanitizeUrl( '"><script>alert( "my-script" );</script>' ) )
			.toBe( '%22%3E%3Cscript%3Ealert(%20%22my-script%22%20);%3C/script%3E' );
	} );
} );
