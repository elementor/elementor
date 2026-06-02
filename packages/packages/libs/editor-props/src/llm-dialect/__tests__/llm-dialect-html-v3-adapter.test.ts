import { type AnyTransformable, type PropType } from '../../types';
import { htmlV3LlmDialectAdapter } from '../adapters/html-v3';

const TITLE_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		'html-v3': { kind: 'object', key: 'html-v3', shape: {} },
		dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
	},
	settings: {},
	meta: {},
} as unknown as PropType;

const STRING_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		string: { kind: 'string', key: 'string', settings: {} },
		dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
	},
	settings: {},
	meta: {},
} as unknown as PropType;

const HTML_V3_OBJECT_PROP_TYPE = {
	kind: 'object',
	key: 'html-v3',
	shape: {},
	settings: {},
	meta: {},
} as unknown as PropType;

const htmlV3UnionCtx = ( propType: PropType = TITLE_UNION_PROP_TYPE ) => ( { propType } );

const dynamicWithHtmlV3Fallback = {
	$$type: 'dynamic',
	value: {
		name: 'post-title',
		settings: {
			fallback: {
				$$type: 'html-v3',
				value: {
					content: { $$type: 'string', value: 'Hello' },
					children: [],
				},
			},
		},
	},
} as AnyTransformable;

const dynamicWithStringFallback = {
	$$type: 'dynamic',
	value: {
		name: 'post-date',
		settings: {
			fallback: {
				$$type: 'string',
				value: 'Hello',
			},
		},
	},
} as AnyTransformable;

const stringWithBindTo = {
	$$type: 'string',
	value: 'Hello',
	bindTo: 'post-date',
	allowBind: true,
} as AnyTransformable;

const htmlV3Wire = {
	$$type: 'html-v3',
	value: {
		content: { $$type: 'string', value: 'Hello' },
	},
} as AnyTransformable;

describe( 'llm-dialect-html-v3-adapter', () => {
	describe( 'matches', () => {
		it( 'should match every prop type context', () => {
			// Arrange
			// Act
			const matchesUnion = htmlV3LlmDialectAdapter.matches( htmlV3UnionCtx() );
			const matchesString = htmlV3LlmDialectAdapter.matches( htmlV3UnionCtx( STRING_UNION_PROP_TYPE ) );

			// Assert
			expect( matchesUnion ).toBe( true );
			expect( matchesString ).toBe( true );
		} );
	} );

	describe( 'toPropValue', () => {
		it( 'should flatten html-v3 fallback to string in html-v3 union context', () => {
			// Arrange
			// Act
			const canonical = htmlV3LlmDialectAdapter.toPropValue?.( dynamicWithHtmlV3Fallback, htmlV3UnionCtx() );

			// Assert
			expect( canonical ).toEqual( {
				$$type: 'dynamic',
				value: {
					name: 'post-title',
					settings: {
						fallback: {
							$$type: 'string',
							value: 'Hello',
						},
					},
				},
			} );
		} );

		it( 'should leave dynamic with string fallback unchanged in html-v3 union context', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toPropValue?.( dynamicWithStringFallback, htmlV3UnionCtx() );

			// Assert
			expect( unchanged ).toBe( dynamicWithStringFallback );
		} );

		it( 'should leave dynamic with html-v3 fallback unchanged outside html-v3 union context', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toPropValue?.(
				dynamicWithHtmlV3Fallback,
				htmlV3UnionCtx( STRING_UNION_PROP_TYPE )
			);

			// Assert
			expect( unchanged ).toBe( dynamicWithHtmlV3Fallback );
		} );

		it( 'should leave plain html-v3 wire unchanged', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toPropValue?.( htmlV3Wire, htmlV3UnionCtx() );

			// Assert
			expect( unchanged ).toBe( htmlV3Wire );
		} );

		it( 'should leave non-dynamic values unchanged', () => {
			// Arrange
			const stringValue = { $$type: 'string', value: 'Hello' } as AnyTransformable;

			// Act
			const unchanged = htmlV3LlmDialectAdapter.toPropValue?.( stringValue, htmlV3UnionCtx() );

			// Assert
			expect( unchanged ).toBe( stringValue );
		} );

		it( 'should not return null for non-matching values', () => {
			// Arrange
			// Act
			const result = htmlV3LlmDialectAdapter.toPropValue?.( htmlV3Wire, htmlV3UnionCtx() );

			// Assert
			expect( result ).not.toBeNull();
		} );

		it( 'should coerce non-string html-v3 fallback to empty string fallback', () => {
			// Arrange
			const dynamicWithNumberContent = {
				$$type: 'dynamic',
				value: {
					name: 'post-title',
					settings: {
						fallback: {
							$$type: 'html-v3',
							value: {
								content: { $$type: 'number', value: 1 },
								children: [],
							},
						},
					},
				},
			} as AnyTransformable;

			// Act
			const canonical = htmlV3LlmDialectAdapter.toPropValue?.( dynamicWithNumberContent, htmlV3UnionCtx() );

			// Assert
			expect( canonical ).toEqual( {
				$$type: 'dynamic',
				value: {
					name: 'post-title',
					settings: {
						fallback: {
							$$type: 'string',
							value: null,
						},
					},
				},
			} );
		} );
	} );

	describe( 'toDialectValue', () => {
		it( 'should expand dynamic string fallback to html-v3 wire in html-v3 union context', () => {
			// Arrange
			// Act
			const dialect = htmlV3LlmDialectAdapter.toDialectValue?.( dynamicWithStringFallback, htmlV3UnionCtx() );

			// Assert
			expect( dialect ).toEqual( {
				$$type: 'html-v3',
				value: {
					content: { $$type: 'string', value: 'Hello' },
					children: [],
				},
			} );
		} );

		it( 'should expand string bindTo wire to html-v3 after dynamic decorates fallback', () => {
			// Arrange
			// Act
			const dialect = htmlV3LlmDialectAdapter.toDialectValue?.( stringWithBindTo, htmlV3UnionCtx() );

			// Assert
			expect( dialect ).toEqual( {
				$$type: 'html-v3',
				value: {
					content: { $$type: 'string', value: 'Hello' },
					children: [],
				},
				bindTo: 'post-date',
				allowBind: true,
			} );
		} );

		it( 'should leave string without bindTo unchanged in html-v3 union context', () => {
			// Arrange
			const plainString = { $$type: 'string', value: 'Hello' } as AnyTransformable;

			// Act
			const unchanged = htmlV3LlmDialectAdapter.toDialectValue?.( plainString, htmlV3UnionCtx() );

			// Assert
			expect( unchanged ).toBe( plainString );
		} );

		it( 'should leave string bindTo wire unchanged outside html-v3 union context', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toDialectValue?.(
				stringWithBindTo,
				htmlV3UnionCtx( STRING_UNION_PROP_TYPE )
			);

			// Assert
			expect( unchanged ).toBe( stringWithBindTo );
		} );

		it( 'should leave dynamic with html-v3 fallback unchanged', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toDialectValue?.( dynamicWithHtmlV3Fallback, htmlV3UnionCtx() );

			// Assert
			expect( unchanged ).toBe( dynamicWithHtmlV3Fallback );
		} );

		it( 'should leave plain html-v3 wire unchanged', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toDialectValue?.( htmlV3Wire, htmlV3UnionCtx() );

			// Assert
			expect( unchanged ).toBe( htmlV3Wire );
		} );

		it( 'should leave dynamic unchanged outside html-v3 union context', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toDialectValue?.(
				dynamicWithStringFallback,
				htmlV3UnionCtx( STRING_UNION_PROP_TYPE )
			);

			// Assert
			expect( unchanged ).toBe( dynamicWithStringFallback );
		} );

		it( 'should leave dynamic unchanged for standalone html-v3 object prop type', () => {
			// Arrange
			// Act
			const unchanged = htmlV3LlmDialectAdapter.toDialectValue?.(
				dynamicWithStringFallback,
				htmlV3UnionCtx( HTML_V3_OBJECT_PROP_TYPE )
			);

			// Assert
			expect( unchanged ).toBe( dynamicWithStringFallback );
		} );
	} );

	describe( 'toDialectSchema', () => {
		const HTML_V3_PARENT_PROP_TYPE = { kind: 'object', key: 'html-v3' } as unknown as PropType;
		const contentSchemaWithBind = {
			type: 'string',
			allowBind: true,
			properties: {
				bindTo: { type: 'string' },
			},
		} as unknown as Parameters< NonNullable< typeof htmlV3LlmDialectAdapter.toDialectSchema > >[ 0 ];

		it( 'should strip bindTo and allowBind from html-v3 content schema', () => {
			// Arrange
			// Act
			const schema = htmlV3LlmDialectAdapter.toDialectSchema?.( contentSchemaWithBind, {
				propType: STRING_UNION_PROP_TYPE,
				parentPropType: HTML_V3_PARENT_PROP_TYPE,
				shapeKey: 'content',
			} );

			// Assert
			expect( schema ).toEqual( { type: 'string', properties: {} } );
		} );

		it( 'should leave schema unchanged when not html-v3 content', () => {
			// Arrange
			// Act
			const schema = htmlV3LlmDialectAdapter.toDialectSchema?.( contentSchemaWithBind, {
				propType: STRING_UNION_PROP_TYPE,
				parentPropType: HTML_V3_PARENT_PROP_TYPE,
				shapeKey: 'children',
			} );

			// Assert
			expect( schema ).toBe( contentSchemaWithBind );
		} );
	} );

	describe( 'round-trip', () => {
		it( 'should round-trip flattened dynamic fallback through expand', () => {
			// Arrange
			// Act
			const canonical = htmlV3LlmDialectAdapter.toPropValue?.( dynamicWithHtmlV3Fallback, htmlV3UnionCtx() );
			const dialect = htmlV3LlmDialectAdapter.toDialectValue?.( canonical as AnyTransformable, htmlV3UnionCtx() );

			// Assert
			expect( dialect ).toEqual( {
				$$type: 'html-v3',
				value: {
					content: { $$type: 'string', value: 'Hello' },
					children: [],
				},
			} );
		} );
	} );
} );
