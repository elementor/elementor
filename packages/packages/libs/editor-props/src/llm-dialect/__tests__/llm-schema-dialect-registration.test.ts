import { type PropType } from '../../types';
import { propTypeToLlmJsonSchema } from '../../utils/props-to-llm-schema';
import { initLlmDialect } from '../init';
import { LLMDialectAdapter } from '../llm-prop-schema';

const SIZE_PROP_TYPE = {
	kind: 'object',
	key: 'size',
	settings: {
		available_units: [ 'px', 'rem', 'em' ],
	},
	shape: {
		unit: {
			kind: 'string',
			key: 'string',
			settings: {
				enum: [ 'px', 'rem', 'em', '%' ],
			},
		},
		size: {
			kind: 'union',
			prop_types: {
				number: { kind: 'number', key: 'number', settings: {} },
				string: { kind: 'string', key: 'string', settings: {} },
			},
		},
	},
	meta: {},
} as unknown as PropType;

describe( 'LLM schema dialect registration', () => {
	beforeAll( () => {
		initLlmDialect();
	} );

	it( 'should throw when registering duplicate dialect ids', () => {
		// Arrange
		const duplicateRegistration = () =>
			LLMDialectAdapter.register( {
				id: 'size',
				matches: () => true,
			} );

		// Act
		// Assert
		expect( duplicateRegistration ).toThrow( 'Duplicate LLM dialect registration: "size".' );
	} );

	it( 'should throw when registering duplicate schema finalize', () => {
		// Arrange
		const duplicateRegistration = () => LLMDialectAdapter.registerFinalizeSchema( ( schema ) => schema );

		// Act
		// Assert
		expect( duplicateRegistration ).toThrow( 'Duplicate LLM schema finalize registration.' );
	} );

	it( 'should run schema finalize after dialect adapters registered later', () => {
		// Arrange
		LLMDialectAdapter.register( {
			id: 'test-single-anyof-wrapper',
			matches: ( { propType } ) =>
				propType.kind === 'string' && 'key' in propType && propType.key === 'test-late-string-only',
			toDialectSchema: ( schema ) => ( {
				description: 'Late dialect description',
				anyOf: [ schema ],
			} ),
		} );
		const stringPropType = {
			kind: 'string',
			key: 'test-late-string-only',
			settings: {},
			meta: {},
		} as unknown as PropType;

		// Act
		const schema = propTypeToLlmJsonSchema( stringPropType );

		// Assert
		expect( schema.anyOf ).toBeUndefined();
		expect( schema.description ).toBe( 'Late dialect description' );
		expect( schema.properties?.$$type?.const ).toBe( 'test-late-string-only' );
	} );

	it( 'should keep nested size inner schema for size and grid-track-size prop types', () => {
		// Arrange
		const gridTrackSizePropType = {
			...SIZE_PROP_TYPE,
			key: 'grid-track-size',
		} as unknown as PropType;

		// Act
		const sizeSchema = propTypeToLlmJsonSchema( SIZE_PROP_TYPE );
		const gridTrackSchema = propTypeToLlmJsonSchema( gridTrackSizePropType );

		// Assert
		expect( sizeSchema.properties?.value?.properties?.unit?.properties?.value ).toEqual( {
			type: 'string',
			enum: [ 'px', 'rem', 'em', '%' ],
		} );
		expect( gridTrackSchema.properties?.value?.properties?.unit?.properties?.value ).toEqual( {
			type: 'string',
			enum: [ 'px', 'rem', 'em', '%' ],
		} );
	} );

	it( 'should keep nested size fields inside object prop types', () => {
		// Arrange
		const dimensionsPropType = {
			kind: 'object',
			key: 'dimensions',
			settings: {},
			shape: {
				top: SIZE_PROP_TYPE,
			},
			meta: {},
		} as unknown as PropType;

		// Act
		const schema = propTypeToLlmJsonSchema( dimensionsPropType );

		// Assert
		expect( schema.properties?.value?.properties?.top?.properties?.value?.properties?.unit ).toBeDefined();
		expect( schema.properties?.value?.properties?.top?.properties?.value?.properties?.size ).toBeDefined();
	} );

	it( 'should add bindTo only for unions that include dynamic', () => {
		// Arrange
		const dynamicUnionPropType = {
			kind: 'union',
			prop_types: {
				string: { kind: 'string', key: 'string', settings: {} },
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'text' ] } },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;
		const sizeUnionPropType = {
			kind: 'union',
			prop_types: {
				size: SIZE_PROP_TYPE,
				'global-size-variable': { kind: 'string', key: 'global-size-variable', settings: {} },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;

		// Act
		const dynamicUnionSchema = propTypeToLlmJsonSchema( dynamicUnionPropType );
		const sizeUnionSchema = propTypeToLlmJsonSchema( sizeUnionPropType );

		// Assert
		expect( dynamicUnionSchema.allowBind ).toBe( true );
		expect( dynamicUnionSchema.anyOf ).toBeUndefined();
		expect( dynamicUnionSchema.properties?.$$type?.const ).toBe( 'string' );
		expect( dynamicUnionSchema.properties?.bindTo ).toBeDefined();
		expect( sizeUnionSchema.allowBind ).toBeUndefined();
		expect( sizeUnionSchema.anyOf ).toHaveLength( 2 );
		expect( sizeUnionSchema.anyOf?.[ 0 ]?.properties?.bindTo ).toBeUndefined();
	} );

	it( 'should add bindTo for nested dynamic unions inside object prop types', () => {
		// Arrange
		const imageSrcUnionPropType = {
			kind: 'union',
			prop_types: {
				'image-src': {
					kind: 'object',
					key: 'image-src',
					shape: {
						url: { kind: 'string', key: 'url', settings: {}, meta: {} },
					},
					settings: {},
					meta: {},
				},
				dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'image' ] } },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;
		const imagePropType = {
			kind: 'object',
			key: 'image',
			shape: {
				src: imageSrcUnionPropType,
				size: { kind: 'string', key: 'string', settings: { enum: [ 'large', 'full' ] }, meta: {} },
			},
			settings: {},
			meta: {},
		} as unknown as PropType;

		// Act
		const schema = propTypeToLlmJsonSchema( imagePropType );
		const srcSchema = schema.properties?.value?.properties?.src;

		// Assert
		expect( srcSchema?.allowBind ).toBe( true );
		expect( srcSchema?.properties?.bindTo ).toBeDefined();
		expect( srcSchema?.properties?.$$type?.const ).toBe( 'image-src' );
	} );

	it( 'should not flatten non-size object prop types', () => {
		// Arrange
		const dimensionsPropType = {
			kind: 'object',
			key: 'dimensions',
			shape: {},
			meta: {},
			settings: {},
		} as unknown as PropType;

		// Act
		const schema = propTypeToLlmJsonSchema( dimensionsPropType );

		// Assert
		expect( schema.properties?.value?.properties?.unit ).toBeUndefined();
	} );
} );
