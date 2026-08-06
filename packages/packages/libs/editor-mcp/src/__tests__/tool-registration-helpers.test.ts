import { McpAppDisplayMode } from '../angie-annotations';
import { buildToolMeta, toCallToolResult } from '../tool-registration-helpers';

describe( 'buildToolMeta', () => {
	it( 'includes ui metadata when provided', () => {
		// Arrange
		const ui = {
			resourceUri: 'ui://elementor/suggested-actions',
			displayMode: McpAppDisplayMode.Inline,
		};

		// Act
		const meta = buildToolMeta( { ui } );

		// Assert
		expect( meta.ui ).toEqual( ui );
	} );

	it( 'omits ui metadata when not provided', () => {
		// Act
		const meta = buildToolMeta( {} );

		// Assert
		expect( meta ).not.toHaveProperty( 'ui' );
	} );
} );

describe( 'toCallToolResult', () => {
	it( 'includes structuredContent for object results', () => {
		// Arrange
		const result = { actions: [ { label: 'Next', prompt: 'Do next step' } ] };

		// Act
		const callResult = toCallToolResult( result );

		// Assert
		expect( callResult.structuredContent ).toEqual( result );
		expect( callResult.content[ 0 ].text ).toBe( JSON.stringify( result ) );
	} );

	it( 'omits structuredContent for string results', () => {
		// Arrange
		const result = 'done';

		// Act
		const callResult = toCallToolResult( result );

		// Assert
		expect( callResult.structuredContent ).toBeUndefined();
		expect( callResult.content[ 0 ].text ).toBe( 'done' );
	} );
} );
