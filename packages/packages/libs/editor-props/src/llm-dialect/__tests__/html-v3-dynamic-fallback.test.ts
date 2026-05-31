import {
	dynamicFallbackToHtmlV3,
	htmlV3ToDynamicFallback,
	isHtmlV3UnionPropType,
} from '../html-v3-dynamic-fallback';

describe( 'html-v3 dynamic fallback conversion', () => {
	it( 'should flatten html-v3 fallback to string for canonical dynamic storage', () => {
		// Arrange
		const htmlV3Fallback = {
			$$type: 'html-v3',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
		};

		// Act
		const canonicalFallback = htmlV3ToDynamicFallback( htmlV3Fallback );

		// Assert
		expect( canonicalFallback ).toEqual( {
			$$type: 'string',
			value: 'Hello',
		} );
	} );

	it( 'should expand string fallback to html-v3 for LLM dialect output', () => {
		// Arrange
		const stringFallback = {
			$$type: 'string',
			value: 'Hello',
		};

		// Act
		const dialectFallback = dynamicFallbackToHtmlV3( stringFallback );

		// Assert
		expect( dialectFallback ).toEqual( {
			$$type: 'html-v3',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
		} );
	} );

	it( 'should detect html-v3 union prop types', () => {
		// Arrange
		const titlePropType = {
			kind: 'union',
			prop_types: {
				'html-v3': { kind: 'object', key: 'html-v3', shape: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
		};

		// Act
		const isHtmlV3Union = isHtmlV3UnionPropType( titlePropType );

		// Assert
		expect( isHtmlV3Union ).toBe( true );
	} );
} );
