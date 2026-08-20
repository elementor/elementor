/* eslint-disable testing-library/render-result-naming-convention */
import { createDomRenderer } from '../create-dom-renderer';

const TEST_ALLOWED_HTML_WRAPPER_TAGS = [ 'a', 'div', 'form', 'span' ];

describe( 'createDomRenderer', () => {
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

	it.each( [
		{
			title: 'basic string',
			template: 'Hello {{ name }}',
			context: { name: 'StyleShit' },
			expected: 'Hello StyleShit',
		},
		{
			title: 'allowed html tags',
			template: `<{{ tag | e( 'html_tag' ) }}></{{ tag | e( 'html_tag' ) }}>`,
			context: { tag: 'a' },
			expected: '<a></a>',
		},
		{
			title: 'allowed form html tag',
			template: `<{{ tag | e( 'html_tag' ) }}></{{ tag | e( 'html_tag' ) }}>`,
			context: { tag: 'form' },
			expected: '<form></form>',
		},
		{
			title: 'disallowed html tags',
			template: `<{{ tag | e( 'html_tag' ) }}></{{ tag | e( 'html_tag' ) }}>`,
			context: { tag: 'script' },
			expected: '<div></div>',
		},
		{
			title: 'allowed html tag with uppercase casing',
			template: `<{{ tag | e( 'html_tag' ) }}></{{ tag | e( 'html_tag' ) }}>`,
			context: { tag: 'DIV' },
			expected: '<DIV></DIV>',
		},
		{
			title: 'allowed url (http)',
			template: `{{ url | e( 'full_url' ) }}`,
			context: { url: 'http://localhost/test-page' },
			expected: 'http://localhost/test-page',
		},
		{
			title: 'allowed url (https)',
			template: `{{ url | e( 'full_url' ) }}`,
			context: { url: 'https://localhost/test-page' },
			expected: 'https://localhost/test-page',
		},
		{
			title: 'allowed url (tel)',
			template: `{{ url | e( 'full_url' ) }}`,
			context: { url: 'tel:050-1234567' },
			expected: 'tel:050-1234567',
		},
		{
			title: 'allowed url (mailto)',
			template: `{{ url | e( 'full_url' ) }}`,
			context: { url: 'mailto:user@example.com' },
			expected: 'mailto:user@example.com',
		},
		{
			title: 'disallowed url',
			template: `{{ url | e( 'full_url' ) }}`,
			context: { url: 'javascript:alert(123)' },
			expected: '',
		},
	] )( 'should render template with $title', async ( { template, context, expected } ) => {
		// Arrange.
		const domRenderer = createDomRenderer();

		domRenderer.register( 'test-template', template );

		// Act.
		const result = await domRenderer.render( 'test-template', context );

		// Assert.
		expect( result ).toBe( expected );
	} );

	it( 'should validate a tag added via localized config', async () => {
		// Arrange.
		window.elementorCommon = {
			config: {
				allowedHTMLWrapperTags: [ ...TEST_ALLOWED_HTML_WRAPPER_TAGS, 'custom-tag' ],
			},
		};
		const domRenderer = createDomRenderer();
		const template = `<{{ tag | e( 'html_tag' ) }}></{{ tag | e( 'html_tag' ) }}>`;

		domRenderer.register( 'test-template', template );

		// Act.
		const result = await domRenderer.render( 'test-template', { tag: 'custom-tag' } );

		// Assert.
		expect( result ).toBe( '<custom-tag></custom-tag>' );
	} );

	it.each( [
		{ title: 'null tag', tag: null },
		{ title: 'undefined tag', tag: undefined },
		{ title: 'empty tag', tag: '' },
	] )( 'should render div when html_tag input is $title', async ( { tag } ) => {
		const domRenderer = createDomRenderer();
		const template = `<{{ tag | default( 'div' ) | e( 'html_tag' ) }}></{{ tag | default( 'div' ) | e( 'html_tag' ) }}>`;

		domRenderer.register( 'test-template', template );

		const result = await domRenderer.render( 'test-template', { tag } );

		expect( result ).toBe( '<div></div>' );
	} );

	it( 'should fail closed to div when the localized config is missing, even for an otherwise-safe tag', async () => {
		// Arrange.
		delete window.elementorCommon;
		const domRenderer = createDomRenderer();
		const template = `<{{ tag | e( 'html_tag' ) }}></{{ tag | e( 'html_tag' ) }}>`;

		domRenderer.register( 'test-template', template );

		// Act.
		const result = await domRenderer.render( 'test-template', { tag: 'a' } );

		// Assert.
		expect( result ).toBe( '<div></div>' );
	} );
} );
