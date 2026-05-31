import { initLlmDialect } from '../../llm-dialect/init';
import { STUBS, TAGS } from '../test-utils/stubs';
import { propValuesFromLlm } from '../prop-values-from-llm';
import { propValuesToLlm } from '../prop-values-to-llm';

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
		const llmValue = propValuesToLlm( propValue );

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
		const llmValue = propValuesToLlm( propValue, { propType: STUBS.dynamicString } );

		// Assert
		expect( llmValue ).toEqual( {
			$$type: 'string',
			value: '',
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );

	it( 'should round-trip bindTo dialect through fromLlm and toLlm', () => {
		// Arrange
		const llmValue = {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
		};

		// Act
		const canonical = propValuesFromLlm( llmValue );
		const roundTrip = propValuesToLlm( canonical );

		// Assert
		expect( roundTrip ).toEqual( {
			$$type: 'string',
			value: 'Hello',
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );

	it( 'should convert dynamic string fallback to html-v3 dialect when prop type is html-v3 union', () => {
		// Arrange
		const titlePropType = {
			kind: 'union',
			prop_types: {
				'html-v3': { kind: 'object', key: 'html-v3', shape: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
		};
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
		const llmValue = propValuesToLlm( propValue );

		// Assert
		expect( llmValue.value.label ).toEqual( {
			$$type: 'string',
			value: 'Default',
			bindTo: 'post-title',
			allowBind: true,
		} );
	} );

	it( 'should normalize flat size values to flat LLM dialect', () => {
		// Arrange
		const propValue = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		};

		// Act
		const llmValue = propValuesToLlm( propValue );

		// Assert
		expect( llmValue ).toEqual( propValue );
	} );

	it( 'should normalize nested PropType size values to flat LLM dialect', () => {
		// Arrange
		const propValue = {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'px' },
				size: { $$type: 'number', value: 16 },
			},
		};
		const flatSize = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		};

		// Act
		const llmValue = propValuesToLlm( propValue );

		// Assert
		expect( llmValue ).toEqual( flatSize );
	} );

	it( 'should normalize flat and nested size values inside object props', () => {
		// Arrange
		const dimensionsPropType = {
			kind: 'object',
			key: 'dimensions',
			shape: {
				top: {
					kind: 'object',
					key: 'size',
					shape: {
						unit: { kind: 'string', key: 'string', settings: {} },
						size: {
							kind: 'union',
							prop_types: {
								number: { kind: 'number', key: 'number', settings: {} },
								string: { kind: 'string', key: 'string', settings: {} },
							},
						},
					},
				},
				left: {
					kind: 'object',
					key: 'size',
					shape: {
						unit: { kind: 'string', key: 'string', settings: {} },
						size: {
							kind: 'union',
							prop_types: {
								number: { kind: 'number', key: 'number', settings: {} },
								string: { kind: 'string', key: 'string', settings: {} },
							},
						},
					},
				},
			},
		};
		const propValue = {
			$$type: 'dimensions',
			value: {
				top: {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 8,
					},
				},
				left: {
					$$type: 'size',
					value: {
						unit: { $$type: 'string', value: 'rem' },
						size: { $$type: 'number', value: 2 },
					},
				},
			},
		};
		const flatTopSize = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 8,
			},
		};
		const flatLeftSize = {
			$$type: 'size',
			value: {
				unit: 'rem',
				size: 2,
			},
		};

		// Act
		const llmValue = propValuesToLlm( propValue, { propType: dimensionsPropType } );

		// Assert
		expect( llmValue.value.top ).toEqual( flatTopSize );
		expect( llmValue.value.left ).toEqual( flatLeftSize );
	} );

	it( 'should be idempotent when propToLlm receives already flat size', () => {
		// Arrange
		const flatSize = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		};

		// Act
		const llmValue = propValuesToLlm( flatSize );

		// Assert
		expect( llmValue ).toEqual( flatSize );
		expect( propValuesToLlm( llmValue ) ).toEqual( flatSize );
	} );

	it( 'should round-trip size through fromLlm and toLlm', () => {
		// Arrange
		const llmValue = {
			$$type: 'size',
			value: {
				unit: 'rem',
				size: 2,
			},
		};

		// Act
		const canonical = propValuesFromLlm( llmValue );
		const roundTrip = propValuesToLlm( canonical );

		// Assert
		expect( roundTrip ).toEqual( llmValue );
	} );
} );
