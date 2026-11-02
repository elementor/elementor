import helpers, { sanitizeUrl, validateHTMLTag } from 'elementor-editor-utils/helpers';

const TEST_ALLOWED_HTML_WRAPPER_TAGS = [ 'a', 'div', 'form', 'span' ];

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

describe( 'elementor.helpers.validateHTMLTag', () => {
	beforeEach( () => {
		global.elementorCommon = {
			config: {
				allowedHTMLWrapperTags: TEST_ALLOWED_HTML_WRAPPER_TAGS,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorCommon;
	} );

	test( 'should return the tag when it is in the localized allowed list', () => {
		expect( validateHTMLTag( 'form' ) ).toBe( 'form' );
		expect( validateHTMLTag( 'script' ) ).toBe( 'div' );
	} );

	test( 'should return the tag when it is added via localized config', () => {
		global.elementorCommon.config.allowedHTMLWrapperTags = [ ...TEST_ALLOWED_HTML_WRAPPER_TAGS, 'custom-tag' ];

		expect( validateHTMLTag( 'custom-tag' ) ).toBe( 'custom-tag' );
	} );

	test( 'should fail closed to div when the localized config is missing, even for an otherwise-safe tag', () => {
		delete global.elementorCommon;

		expect( validateHTMLTag( 'a' ) ).toBe( 'div' );
	} );
} );

describe( 'elementor.helpers.sanitizeInlineSvg', () => {
	test( 'returns empty string for empty input', () => {
		expect( helpers.sanitizeInlineSvg( '' ) ).toBe( '' );
	} );

	test( 'keeps a simple svg root', () => {
		const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
		const result = helpers.sanitizeInlineSvg( svg );

		expect( result.toLowerCase() ).toContain( '<svg' );
		expect( result.toLowerCase() ).toContain( 'rect' );
	} );

	test( 'strips script and event handlers from svg markup', () => {
		const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect onload="alert(1)" width="1" height="1"/></svg>';
		const result = helpers.sanitizeInlineSvg( svg );

		expect( result.toLowerCase() ).not.toContain( 'script' );
		expect( result.toLowerCase() ).not.toContain( 'onload' );
		expect( result.toLowerCase() ).not.toContain( 'alert' );
	} );

	test( 'rejects html that is not an svg document', () => {
		expect( helpers.sanitizeInlineSvg( '<img src=x onerror=alert(1)>' ) ).toBe( '' );
	} );
} );

describe( 'elementor.helpers.fetchInlineSvg', () => {
	const originalFetch = global.fetch;

	beforeEach( () => {
		global.fetch = jest.fn();
		delete global.elementor;
	} );

	afterEach( () => {
		global.fetch = originalFetch;
		delete global.elementor;
	} );

	test( 'does not fetch data urls', ( done ) => {
		helpers.fetchInlineSvg( 'data:text/html,%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', ( data ) => {
			expect( data ).toBe( '' );
			expect( global.fetch ).not.toHaveBeenCalled();
			done();
		} );
	} );

	test( 'does not fetch off-site https urls', ( done ) => {
		helpers.fetchInlineSvg( 'https://evil.example/icon.svg', ( data ) => {
			expect( data ).toBe( '' );
			expect( global.fetch ).not.toHaveBeenCalled();
			done();
		} );
	} );

	test( 'sanitizes same-origin svg responses', ( done ) => {
		const svgUrl = `${ window.location.origin }/wp-content/uploads/icon.svg`;
		global.fetch.mockResolvedValue( {
			ok: true,
			text: () => Promise.resolve( '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle r="1"/></svg>' ),
		} );

		helpers.fetchInlineSvg( svgUrl, ( data ) => {
			expect( global.fetch ).toHaveBeenCalledWith( svgUrl, { credentials: 'same-origin' } );
			expect( data.toLowerCase() ).toContain( '<svg' );
			expect( data.toLowerCase() ).not.toContain( 'script' );
			expect( data.toLowerCase() ).not.toContain( 'alert' );
			done();
		} );
	} );

	test( 'allows the configured uploads origin', ( done ) => {
		const uploadsOrigin = 'https://cdn.example.com';
		global.elementor = {
			config: {
				urls: {
					upload: `${ uploadsOrigin }/wp-content/uploads/`,
				},
			},
		};
		const svgUrl = `${ uploadsOrigin }/wp-content/uploads/icon.svg`;
		global.fetch.mockResolvedValue( {
			ok: true,
			text: () => Promise.resolve( '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>' ),
		} );

		helpers.fetchInlineSvg( svgUrl, ( data ) => {
			expect( global.fetch ).toHaveBeenCalledWith( svgUrl, { credentials: 'same-origin' } );
			expect( data.toLowerCase() ).toContain( '<svg' );
			done();
		} );
	} );
} );
