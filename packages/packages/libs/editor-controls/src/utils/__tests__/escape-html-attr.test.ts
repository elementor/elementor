import { escapeHtmlAttr } from '../escape-html-attr';

describe( 'escapeHtmlAttr', () => {
	it( 'should return unchanged string when no special characters are present', () => {
		// Arrange
		const input = 'Hello World 123 ABC xyz';

		// Act
		const result = escapeHtmlAttr( input );

		// Assert
		expect( result ).toBe( 'Hello World 123 ABC xyz' );
	} );

	it( 'should escape all special characters', () => {
		// Arrange
		const input = 'Test & <script> "quotes" \'single\' > end';

		// Act
		const result = escapeHtmlAttr( input );

		// Assert
		expect( result ).toBe( 'Test &amp; &lt;script&gt; &quot;quotes&quot; &#39;single&#39; &gt; end' );
	} );

	it( 'should handle edge cases correctly', () => {
		// Arrange & Act & Assert
		expect( escapeHtmlAttr( '' ) ).toBe( '' );
		expect( escapeHtmlAttr( '&<>\'"' ) ).toBe( '&amp;&lt;&gt;&#39;&quot;' );
	} );
} );
