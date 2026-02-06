import { parseHtmlChildren } from '../parse-html-children';

describe( 'parseHtmlChildren', () => {
	describe( 'empty and null inputs', () => {
		test( 'should return empty children for empty string', () => {
			// Arrange & Act.
			const result = parseHtmlChildren( '' );

			// Assert.
			expect( result.content ).toBe( '' );
			expect( result.children ).toEqual( [] );
		} );
	} );

	describe( 'plain text without elements', () => {
		test( 'should return no children for plain text', () => {
			// Arrange.
			const html = 'Hello world';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toEqual( [] );
			expect( result.content ).toBe( 'Hello world' );
		} );
	} );

	describe( 'single inline element', () => {
		test( 'should extract a strong element', () => {
			// Arrange.
			const html = 'Hello <strong>world</strong>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toHaveLength( 1 );
			expect( result.children[ 0 ].type ).toBe( 'strong' );
			expect( result.children[ 0 ].content ).toBe( 'world' );
			expect( result.children[ 0 ].id ).toMatch( /^e-/ );
		} );

		test( 'should preserve existing id attribute', () => {
			// Arrange.
			const html = 'Hello <span id="my-id">world</span>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toHaveLength( 1 );
			expect( result.children[ 0 ].id ).toBe( 'my-id' );
			expect( result.children[ 0 ].type ).toBe( 'span' );
		} );

		test( 'should generate id for element without one and update content', () => {
			// Arrange.
			const html = 'Hello <em>world</em>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toHaveLength( 1 );
			expect( result.children[ 0 ].id ).toMatch( /^e-/ );

			// Content should be updated with the generated id.
			expect( result.content ).toContain( `id="${ result.children[ 0 ].id }"` );
		} );
	} );

	describe( 'multiple sibling elements', () => {
		test( 'should extract all sibling inline elements in order', () => {
			// Arrange.
			const html = '<b>bold</b> and <i>italic</i>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toHaveLength( 2 );
			expect( result.children[ 0 ].type ).toBe( 'b' );
			expect( result.children[ 1 ].type ).toBe( 'i' );
		} );
	} );

	describe( 'nested elements', () => {
		test( 'should extract nested children recursively', () => {
			// Arrange.
			const html = 'Hi <span id="outer">name is <span id="inner">asaf</span></span>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toHaveLength( 1 );
			expect( result.children[ 0 ].id ).toBe( 'outer' );
			expect( result.children[ 0 ].type ).toBe( 'span' );
			const nestedChildren = result.children[ 0 ].children ?? [];
			expect( nestedChildren ).toHaveLength( 1 );
			expect( nestedChildren[ 0 ].id ).toBe( 'inner' );
			expect( nestedChildren[ 0 ].content ).toBe( 'asaf' );
		} );
	} );

	describe( 'non-inline elements', () => {
		test( 'should skip non-inline elements but traverse their children', () => {
			// Arrange.
			const html = '<div><strong>bold inside div</strong></div>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children ).toHaveLength( 1 );
			expect( result.children[ 0 ].type ).toBe( 'strong' );
		} );
	} );

	describe( 'content field', () => {
		test( 'should not include content for element with no text', () => {
			// Arrange.
			const html = '<span id="empty"></span>';

			// Act.
			const result = parseHtmlChildren( html );

			// Assert.
			expect( result.children[ 0 ].content ).toBeUndefined();
		} );
	} );

	describe( 'all tracked inline element types', () => {
		const inlineTypes = [ 'span', 'b', 'strong', 'i', 'em', 'u', 'a', 'del', 'sup', 'sub', 's' ];

		inlineTypes.forEach( ( tag ) => {
			test( `should track <${ tag }> elements`, () => {
				// Arrange.
				const html = `<${ tag }>text</${ tag }>`;

				// Act.
				const result = parseHtmlChildren( html );

				// Assert.
				expect( result.children ).toHaveLength( 1 );
				expect( result.children[ 0 ].type ).toBe( tag );
				expect( result.children[ 0 ].id ).toMatch( /^e-/ );
			} );
		} );
	} );
} );
