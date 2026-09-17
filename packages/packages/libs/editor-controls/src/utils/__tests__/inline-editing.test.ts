import { extractInlineHtmlContent } from '../inline-editing';

describe( 'extractInlineHtmlContent', () => {
	it( 'should extract escaped-html string values', () => {
		// Arrange.
		const propValue = { $$type: 'escaped-html', value: 'Hello' };

		// Act.
		const result = extractInlineHtmlContent( propValue );

		// Assert.
		expect( result ).toBe( 'Hello' );
	} );

	it( 'should fall back to html-v3 content for unmigrated values', () => {
		// Arrange.
		const propValue = {
			$$type: 'html-v3',
			value: {
				content: { $$type: 'string', value: 'Legacy' },
				children: [],
			},
		};

		// Act.
		const result = extractInlineHtmlContent( propValue );

		// Assert.
		expect( result ).toBe( 'Legacy' );
	} );

	it( 'should return empty string for missing values', () => {
		// Arrange.
		const propValue = null;

		// Act.
		const result = extractInlineHtmlContent( propValue );

		// Assert.
		expect( result ).toBe( '' );
	} );
} );
