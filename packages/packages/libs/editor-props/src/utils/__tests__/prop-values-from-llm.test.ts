import { initLlmDialect } from '../../llm-dialect/init';
import { type PropType, type TransformablePropValue } from '../../types';
import { propValuesFromLlm } from '../prop-values-from-llm';
import { propValuesToLlm } from '../prop-values-to-llm';
import { STUBS, TAGS } from '../test-utils/stubs';
import { validatePropValue } from '../validate-prop-value';

const TITLE_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		'html-v3': { kind: 'object', key: 'html-v3', shape: {} },
		dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
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

const IMAGE_PROP_TYPE = {
	kind: 'object',
	key: 'image',
	shape: {
		src: IMAGE_SRC_UNION_PROP_TYPE,
		size: { kind: 'string', key: 'string', settings: { enum: [ 'full' ] }, meta: {} },
	},
	settings: {},
	meta: {},
} as unknown as PropType;

const IMAGE_PROPERTY_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		image: IMAGE_PROP_TYPE,
		overridable: {
			kind: 'plain',
			key: 'overridable',
			settings: { origin_prop_type: IMAGE_PROP_TYPE },
			meta: {},
		},
	},
	settings: {},
	meta: {},
} as unknown as PropType;

describe( 'propValuesFromLlm', () => {
	beforeAll( () => {
		initLlmDialect( { dynamicTags: TAGS.tags } );
	} );

	it( 'should convert bindTo dialect to dynamic PropValue with fallback', () => {
		// Arrange
		const llmValue = {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, { propType: STUBS.dynamicString } );

		// Assert
		expect( propValue ).toEqual( {
			$$type: 'dynamic',
			value: {
				name: 'post-title',
				group: 'post',
				settings: {
					label: 'Post Title',
					fallback: {
						$$type: 'string',
						value: 'Hello',
					},
				},
			},
		} );
	} );

	it( 'should convert bindTo on html-v3 to dynamic with string fallback', () => {
		// Arrange
		const llmValue = {
			$$type: 'html-v3',
			bindTo: 'post-title',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, { propType: TITLE_PROP_TYPE } );

		// Assert
		expect( propValue ).toEqual( {
			$$type: 'dynamic',
			value: {
				name: 'post-title',
				group: 'post',
				settings: {
					label: 'Post Title',
					fallback: {
						$$type: 'string',
						value: 'Hello',
					},
				},
			},
		} );
	} );

	it( 'should round-trip html-v3 bindTo through toLlm as html-v3 dialect', () => {
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
		const llmValue = {
			$$type: 'html-v3',
			bindTo: 'post-title',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
		};

		// Act
		const canonical = propValuesFromLlm( llmValue, { propType: TITLE_PROP_TYPE } );
		const roundTrip = propValuesToLlm( canonical, { propType: titlePropType } );

		// Assert
		expect( roundTrip ).toEqual( {
			$$type: 'html-v3',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );

	it( 'should enrich bindTo with tag group and label like manual editor selection', () => {
		// Arrange
		const llmValue = {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-date',
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, { propType: STUBS.dynamicString } );

		// Assert
		expect( propValue ).toEqual( {
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
		} );
	} );

	it( 'should convert image src dialect wire with nested bindTo to canonical dynamic', () => {
		// Arrange
		const llmValue = {
			$$type: 'image',
			value: {
				src: {
					$$type: 'image-src',
					value: {
						url: {
							$$type: 'url',
							value: '',
							bindTo: 'post-featured-image',
						},
					},
					bindTo: 'post-featured-image',
				},
				size: {
					$$type: 'string',
					value: 'full',
				},
			},
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, { propType: IMAGE_PROP_TYPE } ) as TransformablePropValue<
			'image',
			Record< string, unknown >
		>;

		// Assert
		expect( propValue.value.src ).toEqual( {
			$$type: 'dynamic',
			value: {
				name: 'post-featured-image',
				group: 'post',
				settings: {
					label: 'Featured Image',
				},
			},
		} );
		expect( propValue.value.src ).not.toHaveProperty( 'bindTo' );
	} );

	it( 'should convert image src bindTo when property propType is a union wrapping image', () => {
		// Arrange
		const llmValue = {
			$$type: 'image',
			value: {
				src: {
					$$type: 'image-src',
					value: {
						url: {
							$$type: 'url',
							value: '',
							bindTo: 'post-featured-image',
						},
					},
					bindTo: 'post-featured-image',
				},
				size: {
					$$type: 'string',
					value: 'full',
				},
			},
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, {
			propType: IMAGE_PROPERTY_UNION_PROP_TYPE,
		} ) as TransformablePropValue< 'image', Record< string, unknown > >;

		// Assert
		expect( ( propValue.value.src as { $$type: string } ).$$type ).toBe( 'dynamic' );
		expect( propValue.value.src ).toEqual( {
			$$type: 'dynamic',
			value: {
				name: 'post-featured-image',
				group: 'post',
				settings: {
					label: 'Featured Image',
				},
			},
		} );
	} );

	it( 'should convert nested bindTo inside object prop value when prop type is provided', () => {
		// Arrange
		const labelPropType = {
			kind: 'union',
			prop_types: {
				string: { kind: 'string', key: 'string', settings: {}, meta: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;
		const objectPropType = {
			kind: 'object',
			key: 'object',
			shape: {
				label: labelPropType,
			},
			settings: {},
			meta: {},
		} as unknown as PropType;
		const llmValue = {
			$$type: 'object',
			value: {
				label: {
					$$type: 'string',
					value: 'Default',
					bindTo: 'post-title',
				},
			},
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, { propType: objectPropType } ) as TransformablePropValue<
			'object',
			Record< string, unknown >
		>;

		// Assert
		expect( propValue.value.label ).toEqual( {
			$$type: 'dynamic',
			value: {
				name: 'post-title',
				group: 'post',
				settings: {
					label: 'Post Title',
					fallback: {
						$$type: 'string',
						value: 'Default',
					},
				},
			},
		} );
	} );

	it( 'should pass canonical validation after bindTo conversion', () => {
		// Arrange
		const llmValue = {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
		};

		// Act
		const propValue = propValuesFromLlm( llmValue, { propType: STUBS.dynamicString } );
		const { valid } = validatePropValue( STUBS.dynamicString, propValue );

		// Assert
		expect( valid ).toBe( true );
	} );

	describe( 'nested bindTo hoisting', () => {
		const HTML_V3_TITLE_PROP_TYPE = {
			kind: 'union',
			prop_types: {
				'html-v3': {
					kind: 'object',
					key: 'html-v3',
					shape: {
						content: {
							kind: 'union',
							prop_types: {
								string: { kind: 'string', key: 'string', settings: {}, meta: {} },
								dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
							},
							settings: {},
							meta: {},
						},
						children: {
							kind: 'array',
							key: 'array',
							item_prop_type: { kind: 'object', key: 'html-v3', shape: {}, settings: {}, meta: {} },
							settings: {},
							meta: {},
						},
					},
					settings: {},
					meta: {},
				},
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;

		it( 'should hoist content-level bindTo on html-v3 to a root dynamic with string fallback', () => {
			// Arrange
			const llmValue = {
				$$type: 'html-v3',
				value: {
					content: {
						$$type: 'string',
						value: 'Welcome to my site',
						bindTo: 'post-title',
					},
					children: [],
				},
			};

			// Act
			const propValue = propValuesFromLlm( llmValue, { propType: HTML_V3_TITLE_PROP_TYPE } );

			// Assert
			expect( propValue ).toEqual( {
				$$type: 'dynamic',
				value: {
					name: 'post-title',
					group: 'post',
					settings: {
						label: 'Post Title',
						fallback: {
							$$type: 'string',
							value: 'Welcome to my site',
						},
					},
				},
			} );
		} );

		it( 'should hoist url-level bindTo inside image-src to a dynamic at the src level', () => {
			// Arrange
			const llmValue = {
				$$type: 'image',
				value: {
					src: {
						$$type: 'image-src',
						value: {
							url: {
								$$type: 'url',
								value: 'https://example.image',
								bindTo: 'post-featured-image',
							},
						},
					},
					size: {
						$$type: 'string',
						value: 'large',
					},
				},
			};

			// Act
			const propValue = propValuesFromLlm( llmValue, { propType: IMAGE_PROP_TYPE } ) as TransformablePropValue<
				'image',
				Record< string, unknown >
			>;

			// Assert
			expect( propValue.value.src ).toEqual( {
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
										id: null,
										url: {
											$$type: 'url',
											value: 'https://example.image',
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
			} );
			expect( propValue.value.size ).toEqual( {
				$$type: 'string',
				value: 'large',
			} );
		} );
	} );
} );
