import { sanitizeEscapedHtml } from '../sanitize-escaped-html';

const TEST_ALLOWED_HTML_WRAPPER_TAGS = [ 'a', 'div', 'span', 'strong' ];

describe( 'sanitizeEscapedHtml', () => {
	beforeEach( () => {
		window.elementorCommon = {
			config: {
				allowedHTMLWrapperTags: TEST_ALLOWED_HTML_WRAPPER_TAGS,
			},
		};
	} );

	afterEach( () => {
		delete window.elementorCommon;
	} );

	it( 'returns an empty string for nullish values', () => {
		// Arrange & Act & Assert.
		expect( sanitizeEscapedHtml( null ) ).toBe( '' );
		expect( sanitizeEscapedHtml( '' ) ).toBe( '' );
	} );

	it( 'keeps allowed tags and strips disallowed tags', () => {
		// Arrange.
		const value = 'Hello <script>alert(1)</script><strong>world</strong>';

		// Act.
		const result = sanitizeEscapedHtml( value );

		// Assert.
		expect( result ).toBe( 'Hello <strong>world</strong>' );
	} );

	it( 'fails closed when the localized allowlist is missing', () => {
		// Arrange.
		delete window.elementorCommon;
		const value = '<strong>world</strong>';

		// Act.
		const result = sanitizeEscapedHtml( value );

		// Assert.
		expect( result ).toBe( 'world' );
	} );
} );
