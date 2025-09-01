/* eslint-disable testing-library/render-result-naming-convention */
import { createDomRenderer } from '../create-dom-renderer';

describe( 'createDomRenderer', () => {
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
} );
