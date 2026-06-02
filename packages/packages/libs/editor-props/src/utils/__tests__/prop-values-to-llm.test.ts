import { initLlmDialect } from '../../llm-dialect/init';
import { type PropType, type TransformablePropValue } from '../../types';
import { propValuesFromLlm } from '../prop-values-from-llm';
import { propValuesToLlm } from '../prop-values-to-llm';
import { STUBS, TAGS } from '../test-utils/stubs';

const LABEL_DYNAMIC_OBJECT_PROP_TYPE = {
	kind: 'object',
	key: 'object',
	shape: {
		label: {
			kind: 'union',
			prop_types: {
				string: { kind: 'string', key: 'string', settings: {}, meta: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
			settings: {},
			meta: {},
		},
	},
	settings: {},
	meta: {},
} as unknown as PropType;

const IMAGE_SRC_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		'image-src': {
			kind: 'object',
			key: 'image-src',
			shape: {
				url: {
					kind: 'union',
					prop_types: {
						url: { kind: 'string', key: 'url', settings: {}, meta: {} },
						dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'url' ] } },
					},
					settings: {},
					meta: {},
				},
			},
			settings: {},
			meta: {},
		},
		dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'image' ] } },
	},
	settings: {},
	meta: {},
} as unknown as PropType;

describe( 'propValuesToLlm', () => {
	beforeAll( () => {
		initLlmDialect( { dynamicTags: TAGS.tags } );
	} );

	it( 'should convert dynamic PropValue to bindTo dialect with fallback', () => {
		// Arrange
		const propValue = {
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
		};

		// Act
		const llmValue = propValuesToLlm( propValue, { propType: STUBS.dynamicString } );

		// Assert
		expect( llmValue ).toEqual( {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );

	it( 'should convert dynamic PropValue without fallback using empty static union branch', () => {
		// Arrange
		const propValue = {
			$$type: 'dynamic',
			value: {
				name: 'post-title',
			},
		};

		// Act
		const llmValue = propValuesToLlm( propValue, { propType: STUBS.dynamicString } ) as TransformablePropValue<
			'string',
			unknown
		>;

		// Assert
		expect( llmValue ).toMatchObject( {
			$$type: 'string',
			bindTo: 'post-title',
			allowBind: true,
		} );
		expect( llmValue.value ).toBeFalsy();
	} );

	it( 'should round-trip bindTo dialect through fromLlm and toLlm', () => {
		// Arrange
		const llmValue = {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
		};

		// Act
		const canonical = propValuesFromLlm( llmValue, { propType: STUBS.dynamicString } );
		const roundTrip = propValuesToLlm( canonical, { propType: STUBS.dynamicString } );

		// Assert
		expect( roundTrip ).toEqual( {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );

	it( 'should round-trip image-src dynamic through toLlm and fromLlm', () => {
		// Arrange
		const canonicalSrc = {
			$$type: 'dynamic',
			value: {
				name: 'post-featured-image',
				group: 'post',
				settings: {
					label: 'Featured Image',
					fallback: {
						$$type: 'image',
						value: {
							src: {
								$$type: 'image-src',
								value: {
									url: {
										$$type: 'url',
										value: 'https://example.com/image.jpg',
									},
									alt: null,
								},
							},
							size: {
								$$type: 'string',
								value: 'full',
							},
						},
					},
				},
			},
		} as TransformablePropValue< 'dynamic', Record< string, unknown > >;

		// Act
		const llmValue = propValuesToLlm( canonicalSrc, { propType: IMAGE_SRC_UNION_PROP_TYPE } );
		const roundTrip = propValuesFromLlm( llmValue, { propType: IMAGE_SRC_UNION_PROP_TYPE } );

		// Assert
		expect( llmValue ).toEqual( {
			$$type: 'image-src',
			value: {
				url: {
					$$type: 'url',
					value: 'https://example.com/image.jpg',
				},
				alt: null,
			},
			bindTo: 'post-featured-image',
			allowBind: true,
		} );
		expect( roundTrip ).toEqual( canonicalSrc );
	} );

	it( 'should convert dynamic string fallback to html-v3 dialect when prop type is html-v3 union', () => {
		// Arrange
		const titlePropType = {
			kind: 'union',
			prop_types: {
				'html-v3': { kind: 'object', key: 'html-v3', shape: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;
		const propValue = {
			$$type: 'dynamic',
			value: {
				name: 'post-date',
				group: 'post',
				settings: {
					label: 'Post Date',
					fallback: {
						$$type: 'string',
						value: 'Hello',
					},
				},
			},
		};

		// Act
		const llmValue = propValuesToLlm( propValue, { propType: titlePropType } );

		// Assert
		expect( llmValue ).toEqual( {
			$$type: 'html-v3',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
			bindTo: 'post-date',
			allowBind: true,
		} );
	} );

	it( 'should apply dialect conversion recursively inside object props', () => {
		// Arrange
		const propValue = {
			$$type: 'object',
			value: {
				label: {
					$$type: 'dynamic',
					value: {
						name: 'post-title',
						settings: {
							fallback: {
								$$type: 'string',
								value: 'Default',
							},
						},
					},
				},
			},
		};

		// Act
		const llmValue = propValuesToLlm( propValue, {
			propType: LABEL_DYNAMIC_OBJECT_PROP_TYPE,
		} ) as TransformablePropValue< 'object', Record< string, unknown > >;

		// Assert
		expect( llmValue.value.label ).toEqual( {
			$$type: 'string',
			value: 'Default',
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );
} );
