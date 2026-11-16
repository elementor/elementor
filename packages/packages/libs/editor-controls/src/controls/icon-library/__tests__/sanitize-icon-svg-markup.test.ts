import { sanitizeIconSvgMarkup } from '../sanitize-icon-svg-markup';

describe( 'sanitizeIconSvgMarkup', () => {
	it( 'keeps path markup and strips scripts', () => {
		const markup =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><path d="M0 0H10V10H0Z" fill="currentColor"></path></svg>';

		expect( sanitizeIconSvgMarkup( markup ) ).toContain( 'M0 0H10V10H0Z' );
		expect( sanitizeIconSvgMarkup( markup ) ).not.toContain( 'script' );
	} );

	it( 'ignores non-string values', () => {
		expect( sanitizeIconSvgMarkup( { html: '<svg></svg>' } ) ).toBe( '' );
	} );
} );
