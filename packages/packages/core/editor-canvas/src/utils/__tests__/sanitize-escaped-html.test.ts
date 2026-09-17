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

	it( 'strips javascript href from links', () => {
		// Arrange.
		const value = '<a href="javascript:alert(1)">click</a>';

		// Act.
		const result = sanitizeEscapedHtml( value );

		// Assert.
		expect( result ).not.toContain( 'javascript:' );
		expect( result ).toContain( 'click' );
	} );

	it( 'strips data href from links', () => {
		// Arrange.
		const value = '<a href="data:text/html,<script>alert(1)</script>">click</a>';

		// Act.
		const result = sanitizeEscapedHtml( value );

		// Assert.
		expect( result ).not.toMatch( /<a\s+href=/i );
		expect( result ).toContain( 'click' );
	} );

	it( 'preserves non-operational attributes', () => {
		// Arrange.
		const value =
			'<span id="e-1" class="foo bar" style="color: red;" title="t" lang="en" dir="ltr" role="text" data-x="1" aria-label="label">world</span>';

		// Act.
		const result = sanitizeEscapedHtml( value );

		// Assert.
		expect( result ).toContain( 'id="e-1"' );
		expect( result ).toContain( 'class="foo bar"' );
		expect( result ).toContain( 'style="color: red;"' );
		expect( result ).toContain( 'title="t"' );
		expect( result ).toContain( 'lang="en"' );
		expect( result ).toContain( 'dir="ltr"' );
		expect( result ).toContain( 'role="text"' );
		expect( result ).toContain( 'data-x="1"' );
		expect( result ).toContain( 'aria-label="label"' );
		expect( result ).toContain( 'world' );
	} );

	it( 'strips functional event-handler attributes', () => {
		// Arrange.
		const value = '<span id="e-1" onclick="evil()" onmouseover="evil()">world</span>';

		// Act.
		const result = sanitizeEscapedHtml( value );

		// Assert.
		expect( result ).toContain( 'id="e-1"' );
		expect( result ).not.toContain( 'onclick' );
		expect( result ).not.toContain( 'onmouseover' );
		expect( result ).toContain( 'world' );
	} );
} );
