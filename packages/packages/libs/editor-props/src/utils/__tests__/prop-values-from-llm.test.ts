import { initLlmDialect } from '../../llm-dialect/init';
import { STUBS, TAGS } from '../test-utils/stubs';
import { propValuesFromLlm } from '../prop-values-from-llm';
import { propValuesToLlm } from '../prop-values-to-llm';
import { validatePropValue } from '../validate-prop-value';

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
		const propValue = propValuesFromLlm( llmValue );

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
		const propValue = propValuesFromLlm( llmValue, { forceKey: 'html-v3' } );

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
		};
		const llmValue = {
			$$type: 'html-v3',
			bindTo: 'post-title',
			value: {
				content: { $$type: 'string', value: 'Hello' },
				children: [],
			},
		};

		// Act
		const canonical = propValuesFromLlm( llmValue, { forceKey: 'html-v3' } );
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
		const propValue = propValuesFromLlm( llmValue );

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

	it( 'should not convert nested bindTo inside object prop value', () => {
		// Arrange
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
		const propValue = propValuesFromLlm( llmValue );

		// Assert
		expect( propValue.value.label ).toEqual( {
			$$type: 'string',
			value: 'Default',
			bindTo: 'post-title',
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
		const propValue = propValuesFromLlm( llmValue );
		const { valid } = validatePropValue( STUBS.dynamicString, propValue );

		// Assert
		expect( valid ).toBe( true );
	} );

	it( 'should flatten nested size values for canonical storage', () => {
		// Arrange
		const llmValue = {
			$$type: 'size',
			value: {
				unit: { $$type: 'string', value: 'px' },
				size: { $$type: 'number', value: 16 },
			},
		};

		// Act
		const propValue = propValuesFromLlm( llmValue );

		// Assert
		expect( propValue ).toEqual( {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		} );
	} );

	it( 'should flatten nested size values inside object props', () => {
		// Arrange
		const llmValue = {
			$$type: 'dimensions',
			value: {
				top: {
					$$type: 'size',
					value: {
						unit: { $$type: 'string', value: 'px' },
						size: { $$type: 'number', value: 8 },
					},
				},
			},
		};

		// Act
		const propValue = propValuesFromLlm( llmValue );

		// Assert
		expect( propValue.value.top ).toEqual( {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 8,
			},
		} );
	} );
} );
