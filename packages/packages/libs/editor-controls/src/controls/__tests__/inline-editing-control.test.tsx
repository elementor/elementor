import { htmlV3PropTypeUtil, parseHtmlChildren, stringPropTypeUtil } from '@elementor/editor-props';

describe( 'InlineEditingControl html-v3 value updates', () => {
	it( 'should clear children when plain text replaces formatted content', () => {
		// Arrange.
		const staleChildren = [
			{
				id: 'e-old-child',
				type: 'strong',
				content: 'old',
			},
		];
		const previousValue = htmlV3PropTypeUtil.create( {
			content: stringPropTypeUtil.create( 'Hello <strong id="e-old-child">old</strong>' ),
			children: staleChildren,
		} );

		// Act.
		const parsed = parseHtmlChildren( 'New plain text' );
		const nextValue = htmlV3PropTypeUtil.create( {
			content: parsed.content ? stringPropTypeUtil.create( parsed.content ) : null,
			children: parsed.children,
		} );

		// Assert.
		expect( previousValue.value.children ).toEqual( staleChildren );
		expect( nextValue.value.children ).toEqual( [] );
		expect( stringPropTypeUtil.extract( nextValue.value.content ) ).toBe( 'New plain text' );
	} );
} );
