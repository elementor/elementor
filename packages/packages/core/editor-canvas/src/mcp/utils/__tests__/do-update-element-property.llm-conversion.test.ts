import { getWidgetsCache, updateElementSettings } from '@elementor/editor-elements';
import { initLlmDialect, Schema, type PropType, type TransformablePropValue } from '@elementor/editor-props';
import { getVariantByMeta } from '@elementor/editor-styles';
import { __privateRunCommandSync } from '@elementor/editor-v1-adapters';

import { doUpdateElementProperty, resolvePropValue } from '../do-update-element-property';

jest.mock( '@elementor/editor-elements', () => ( {
	createElementStyle: jest.fn(),
	getElementStyles: jest.fn(),
	getWidgetsCache: jest.fn(),
	updateElementSettings: jest.fn(),
	updateElementStyle: jest.fn(),
} ) );

jest.mock( '@elementor/editor-styles', () => ( {
	getStylesSchema: jest.fn( () => ( {} ) ),
	getVariantByMeta: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommandSync: jest.fn(),
} ) );

const ELEMENT_ID = 'image-element-id';
const ELEMENT_TYPE = 'e-image';
const PROPERTY_NAME = 'image';

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

const LLM_IMAGE_VALUE = {
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

const widgetsCacheFixture = {
	[ ELEMENT_TYPE ]: {
		atomic_props_schema: {
			[ PROPERTY_NAME ]: IMAGE_PROP_TYPE,
		},
	},
};

describe( 'doUpdateElementProperty LLM conversion', () => {
	beforeAll( () => {
		initLlmDialect( {
			dynamicTags: {
				'post-featured-image': {
					name: 'post-featured-image',
					categories: [ 'image', 'media' ],
					label: 'Featured Image',
					group: 'post',
					meta: {},
				},
			},
		} );
		Object.assign( window, {
			elementorV2: {
				editorVariables: {
					Utils: {
						globalVariablesLLMResolvers: {},
					},
				},
			},
		} );
	} );

	beforeEach( () => {
		// @ts-ignore: Mock values for test
		jest.mocked( getWidgetsCache ).mockReturnValue( widgetsCacheFixture );
	} );

	it( 'resolvePropValue converts dialect bindTo on image src to canonical dynamic', () => {
		// Act
		const canonical = resolvePropValue( LLM_IMAGE_VALUE, IMAGE_PROP_TYPE, 'image' ) as TransformablePropValue<
			'image',
			Record< string, unknown >
		>;

		// Assert
		const src = canonical.value.src as TransformablePropValue< 'dynamic', { name: string } >;
		expect( src.$$type ).toBe( 'dynamic' );
		expect( src.value.name ).toBe( 'post-featured-image' );
		expect( src ).not.toHaveProperty( 'bindTo' );
	} );

	it( 'doUpdateElementProperty persists canonical image prop after LLM validation', () => {
		// Arrange
		const llmValidation = Schema.validateLlmJson( IMAGE_PROP_TYPE, LLM_IMAGE_VALUE );
		expect( llmValidation.valid ).toBe( true );

		// Act
		doUpdateElementProperty( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertyName: PROPERTY_NAME,
			propertyValue: LLM_IMAGE_VALUE,
		} );

		// Assert
		expect( updateElementSettings ).toHaveBeenCalledTimes( 1 );
		const persistedImage = jest.mocked( updateElementSettings ).mock.calls[ 0 ][ 0 ].props[ PROPERTY_NAME ] as TransformablePropValue<
			'image',
			Record< string, unknown >
		>;
		expect( ( persistedImage.value.src as { $$type: string } ).$$type ).toBe( 'dynamic' );
		expect( persistedImage.value.src ).not.toHaveProperty( 'bindTo' );
		expect( __privateRunCommandSync ).toHaveBeenCalled();
	} );
} );
