/* eslint-disable testing-library/render-result-naming-convention */
import { createDomRenderer, DEFAULT_ALLOWED_HTML_WRAPPER_TAGS } from '../create-dom-renderer';

describe( 'createDomRenderer', () => {
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
				allowedHTMLWrapperTags: [ ...DEFAULT_ALLOWED_HTML_WRAPPER_TAGS, 'custom-tag' ],
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
} );
