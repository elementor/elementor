import { initLlmDialect } from '../init';
import { LLMDialectAdapter } from '../llm-prop-schema';
import {
	isHtmlV3PropTypeDefinition,
	isSizePropTypeDefinition,
	isUnionWithDynamicPropType,
} from '../prop-type-schema-matchers';

describe( 'LLM schema dialect registration', () => {
	beforeAll( () => {
		initLlmDialect();
	} );

	it( 'should throw when registering duplicate schema dialect ids', () => {
		// Arrange
		const duplicateRegistration = () =>
			LLMDialectAdapter.registerSchemaDialect( {
				id: 'size',
				matches: isSizePropTypeDefinition,
				toDialectSchema: ( schema ) => schema,
			} );

		// Act
		// Assert
		expect( duplicateRegistration ).toThrow( 'Duplicate LLM schema dialect registration: "size".' );
	} );

	it( 'should match only the expected schema dialects for representative prop types', () => {
		// Arrange
		const sizePropType = { kind: 'object', key: 'size', shape: {} };
		const gridTrackSizePropType = { kind: 'object', key: 'grid-track-size', shape: {} };
		const htmlV3PropType = { kind: 'object', key: 'html-v3', shape: {} };
		const dynamicUnionPropType = {
			kind: 'union',
			prop_types: {
				string: { kind: 'string', key: 'string', settings: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
		};
		const sizeUnionPropType = {
			kind: 'union',
			prop_types: {
				size: { kind: 'object', key: 'size', shape: {} },
				'global-size-variable': { kind: 'string', key: 'global-size-variable', settings: {} },
			},
		};
		const dimensionsPropType = { kind: 'object', key: 'dimensions', shape: {} };

		// Act
		const sizeMatches = isSizePropTypeDefinition( sizePropType );
		const gridTrackMatches = isSizePropTypeDefinition( gridTrackSizePropType );
		const htmlMatches = isHtmlV3PropTypeDefinition( htmlV3PropType );
		const dynamicUnionMatches = isUnionWithDynamicPropType( dynamicUnionPropType );
		const sizeUnionMatches = isUnionWithDynamicPropType( sizeUnionPropType );
		const dimensionsMatches = isSizePropTypeDefinition( dimensionsPropType );

		// Assert
		expect( sizeMatches ).toBe( true );
		expect( gridTrackMatches ).toBe( true );
		expect( htmlMatches ).toBe( true );
		expect( dynamicUnionMatches ).toBe( true );
		expect( sizeUnionMatches ).toBe( false );
		expect( dimensionsMatches ).toBe( false );
	} );
} );
