import { type AnyTransformable, type PropType, type TransformablePropType, type UnionPropType } from '../../types';
import { imageSrcLlmDialectAdapter } from '../adapters/image-src';

const DEFAULT_IMAGE_SRC = {
	$$type: 'image-src',
	value: {
		id: null,
		url: {
			$$type: 'url',
			value: 'https://example.com/placeholder.svg',
		},
	},
};

const IMAGE_SRC_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		'image-src': { kind: 'object', key: 'image-src', shape: {}, default: DEFAULT_IMAGE_SRC },
		dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'image' ] } },
	},
	settings: {},
	meta: {},
} as unknown as UnionPropType;

const IMAGE_SRC_OBJECT_PROP_TYPE: TransformablePropType = {
	kind: 'object',
	key: 'image-src',
	shape: {},
	default: DEFAULT_IMAGE_SRC,
	settings: {},
	meta: {},
};

const STRING_PROP_TYPE = {
	kind: 'string',
	key: 'string',
	settings: {},
	meta: {},
} as unknown as PropType;

const ctx = < T = TransformablePropType | UnionPropType >( propType: T ) => ( { propType } );

describe( 'llm-dialect-image-src-adapter', () => {
	it( 'should replace value with prop-type default when url is empty and id is absent', () => {
		// Arrange
		const value = {
			$$type: 'image-src',
			value: {
				url: { $$type: 'url', value: '' },
			},
		} as AnyTransformable;

		// Act
		const migrated = imageSrcLlmDialectAdapter.toPropValue?.( value, ctx( IMAGE_SRC_OBJECT_PROP_TYPE ) );

		// Assert
		expect( migrated ).toEqual( DEFAULT_IMAGE_SRC );
		expect( migrated ).not.toBe( DEFAULT_IMAGE_SRC );
	} );

	it( 'should leave image-src values unchanged when alt exists', () => {
		// Arrange
		const value = {
			$$type: 'image-src',
			value: {
				url: { $$type: 'url', value: 'https://example.com/image.jpg' },
				alt: null,
			},
		} as AnyTransformable;

		// Act
		const migrated = imageSrcLlmDialectAdapter.toPropValue?.( value, ctx( IMAGE_SRC_OBJECT_PROP_TYPE ) );

		// Assert
		expect( migrated ).toBe( value );
	} );

	it( 'should keep url and add alt when url has a value', () => {
		// Arrange
		const value = {
			$$type: 'image-src',
			value: {
				url: { $$type: 'url', value: 'https://example.com/image.jpg' },
			},
		} as AnyTransformable;

		// Act
		const migrated = imageSrcLlmDialectAdapter.toPropValue?.( value, ctx( IMAGE_SRC_OBJECT_PROP_TYPE ) );

		// Assert
		expect( migrated ).toEqual( {
			$$type: 'image-src',
			value: {
				url: { $$type: 'url', value: 'https://example.com/image.jpg' },
				alt: null,
			},
		} );
	} );

	it( 'should replace value with prop-type default when id and url are null', () => {
		// Arrange
		const value = {
			$$type: 'image-src',
			value: {
				id: null,
				url: null,
			},
		} as AnyTransformable;

		// Act
		const migrated = imageSrcLlmDialectAdapter.toPropValue?.( value, ctx( IMAGE_SRC_OBJECT_PROP_TYPE ) );

		// Assert
		expect( migrated ).toEqual( DEFAULT_IMAGE_SRC );
		expect( migrated ).not.toBe( DEFAULT_IMAGE_SRC );
	} );

	it( 'should replace dynamic fallback with prop-type default when no valid id or url', () => {
		// Arrange
		const value = {
			$$type: 'dynamic',
			value: {
				name: 'post-featured-image',
				settings: {
					fallback: {
						$$type: 'image-src',
						value: {
							url: { $$type: 'url', value: '' },
						},
					},
				},
			},
		} as AnyTransformable;

		// Act
		const migrated = imageSrcLlmDialectAdapter.toPropValue?.( value, ctx( IMAGE_SRC_UNION_PROP_TYPE ) );

		// Assert
		expect( migrated ).toEqual( {
			$$type: 'dynamic',
			value: {
				name: 'post-featured-image',
				settings: {
					fallback: {
						$$type: 'image',
						value: {
							src: DEFAULT_IMAGE_SRC,
							size: { $$type: 'string', value: 'full' },
						},
					},
				},
			},
		} );
		expect(
			( migrated as { value: { settings: { fallback: { value: { src: unknown } } } } } ).value.settings.fallback
				.value.src
		).not.toBe( DEFAULT_IMAGE_SRC );
	} );

	it( 'should strip dynamic binding from image-src nested url/id schema', () => {
		// Arrange
		const imageSrcParent = { kind: 'object', key: 'image-src' } as unknown as TransformablePropType;
		const urlSchemaWithBind = {
			type: 'string',
			allowBind: true,
			properties: { bindTo: { type: 'string' } },
		} as unknown as Parameters< NonNullable< typeof imageSrcLlmDialectAdapter.toDialectSchema > >[ 0 ];

		// Act
		const stripped = imageSrcLlmDialectAdapter.toDialectSchema?.( urlSchemaWithBind, {
			propType: STRING_PROP_TYPE,
			parentPropType: imageSrcParent,
			shapeKey: 'url',
		} );
		const untouched = imageSrcLlmDialectAdapter.toDialectSchema?.( urlSchemaWithBind, {
			propType: STRING_PROP_TYPE,
			parentPropType: { kind: 'object', key: 'image' } as unknown as TransformablePropType,
			shapeKey: 'size',
		} );

		// Assert
		expect( stripped ).toEqual( { type: 'string', properties: {} } );
		expect( untouched ).toBe( urlSchemaWithBind );
	} );

	it( 'should not touch values outside image-src contexts', () => {
		// Arrange
		const value = { $$type: 'string', value: 'x' } as AnyTransformable;

		// Act
		const migrated = imageSrcLlmDialectAdapter.toPropValue?.( value, ctx( STRING_PROP_TYPE ) );

		// Assert
		expect( migrated ).toBe( value );
	} );
} );
