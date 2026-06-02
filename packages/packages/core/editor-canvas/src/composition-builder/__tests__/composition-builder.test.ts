import {
	type CreateElementParams,
	getWidgetsCache,
	updateElementSettings,
	type V1Element,
	type V1ElementConfig,
} from '@elementor/editor-elements';
import { initLlmDialect, type PropType, type TransformablePropValue } from '@elementor/editor-props';
import { __privateRunCommandSync } from '@elementor/editor-v1-adapters';

import { doUpdateElementProperty as doUpdateElementPropertyUtil } from '../../mcp/utils/do-update-element-property';
import { resetValidateInputWidgetsSchemaCache } from '../../mcp/utils/validate-input';
import { CompositionBuilder } from '../composition-builder';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getWidgetsCache: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommandSync: jest.fn(),
} ) );

const ROOT_CHILD_TAG = 'column';
const WIDGET_TAG = 'atomic-heading';
const GENERATED_ELEMENT_ID = 'generated-element-id';
const CONFIG_ID = 'cfg-a';
const ELEMENT_CONFIG_PROPERTY = 'title';
const ELEMENT_CONFIG_VALUE = {
	$$type: 'string',
	value: 'configured-value',
};

const xmlStringWithConfiguration = `<${ ROOT_CHILD_TAG } configuration-id="${ CONFIG_ID }" />`;
const xmlStringWithWidgetConfiguration = `<${ WIDGET_TAG } configuration-id="${ CONFIG_ID }" />`;

const createElementConfigPayload = () => ( {
	[ CONFIG_ID ]: {
		[ ELEMENT_CONFIG_PROPERTY ]: ELEMENT_CONFIG_VALUE,
	},
} );

const createMinimalWidgetsCache = () =>
	( {
		[ ROOT_CHILD_TAG ]: {
			elType: 'column',
		},
	} ) as Record< string, { elType: string } >;

const createWidgetsCacheWithAtomicPropsSchema = (): Record< string, V1ElementConfig > =>
	( {
		[ WIDGET_TAG ]: {
			title: WIDGET_TAG,
			controls: {},
			elType: 'widget',
			atomic_props_schema: {
				title: {
					kind: 'string',
					key: 'string',
					settings: {},
				},
			},
		},
	} ) as unknown as Record< string, V1ElementConfig >;

const FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN = {
	'e-form': {
		title: 'Form',
		controls: {},
		elType: 'widget',
		default_children: [
			{
				elType: 'e-form-success-message',
				meta: { required: true },
				elements: [],
			},
			{
				elType: 'e-form-error-message',
				meta: { required: true },
				elements: [],
			},
			{
				elType: 'widget',
				widgetType: 'e-form-input',
				elements: [],
			},
		],
	},
	'e-form-error-message': {
		title: 'Error',
		controls: {},
		elType: 'e-form-error-message',
	},
	'e-form-input': { title: 'Input', controls: {}, elType: 'widget' },
	'e-form-success-message': {
		title: 'Success',
		controls: {},
		elType: 'e-form-success-message',
	},
} as const satisfies Record< string, V1ElementConfig >;

const createMockRootContainer = (): V1Element =>
	( {
		id: 'root',
		model: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		settings: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		children: [],
	} ) as unknown as V1Element;

const createMockPartialContainer = ( id: string ): V1Element =>
	( {
		id,
		model: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		settings: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		children: [],
	} ) as unknown as V1Element;

describe( 'CompositionBuilder.build createElement failure cleanup', () => {
	it( 'calls deleteElement when createElement fails and getContainer returns a container', async () => {
		// Arrange
		const partialContainer = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const deleteElement = jest.fn();
		const _doUpdateElementProperty = jest.fn();
		const createElement = jest.fn().mockImplementation( () => {
			throw new Error( 'create failed' );
		} );
		const getContainer = jest
			.fn()
			.mockImplementation( ( id: string ) => ( id === GENERATED_ELEMENT_ID ? partialContainer : undefined ) );
		const builder = CompositionBuilder.fromXMLString( xmlStringWithConfiguration, {
			createElement,
			deleteElement,
			getContainer,
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createMinimalWidgetsCache() ),
			doUpdateElementProperty: _doUpdateElementProperty,
		} );
		builder.setElementConfig( createElementConfigPayload() );

		// Act
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow( 'create failed' );

		// Assert
		expect( getContainer ).toHaveBeenCalledWith( GENERATED_ELEMENT_ID );
		expect( deleteElement ).toHaveBeenCalledTimes( 1 );
		expect( deleteElement ).toHaveBeenCalledWith( { container: partialContainer } );
		expect( _doUpdateElementProperty ).not.toHaveBeenCalled();
	} );

	it( 'does not call deleteElement when createElement fails and getContainer returns undefined', async () => {
		// Arrange
		const deleteElement = jest.fn();
		const doUpdateElementProperty = jest.fn();
		const createElement = jest.fn().mockImplementation( () => {
			throw new Error( 'create failed' );
		} );
		const getContainer = jest.fn().mockReturnValue( undefined );
		const builder = CompositionBuilder.fromXMLString( xmlStringWithConfiguration, {
			createElement,
			deleteElement,
			getContainer,
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createMinimalWidgetsCache() ),
			doUpdateElementProperty,
		} );
		builder.setElementConfig( createElementConfigPayload() );

		// Act
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow( 'create failed' );

		// Assert
		expect( getContainer ).toHaveBeenCalledWith( GENERATED_ELEMENT_ID );
		expect( deleteElement ).not.toHaveBeenCalled();
		expect( doUpdateElementProperty ).not.toHaveBeenCalled();
	} );

	it( 'calls deleteElement when createElement returns without a model', async () => {
		// Arrange
		const partialContainer = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const deleteElement = jest.fn();
		const doUpdateElementProperty = jest.fn();
		const createElement = jest.fn().mockReturnValue( {} as V1Element );
		const getContainer = jest
			.fn()
			.mockImplementation( ( id: string ) => ( id === GENERATED_ELEMENT_ID ? partialContainer : undefined ) );
		const builder = CompositionBuilder.fromXMLString( xmlStringWithConfiguration, {
			createElement,
			deleteElement,
			getContainer,
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createMinimalWidgetsCache() ),
			doUpdateElementProperty,
		} );
		builder.setElementConfig( createElementConfigPayload() );

		// Act
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow(
			'createElement did not return an element container with a model.'
		);

		// Assert
		expect( getContainer ).toHaveBeenCalledWith( GENERATED_ELEMENT_ID );
		expect( deleteElement ).toHaveBeenCalledTimes( 1 );
		expect( deleteElement ).toHaveBeenCalledWith( { container: partialContainer } );
		expect( doUpdateElementProperty ).not.toHaveBeenCalled();
	} );
} );

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

const E_IMAGE_PROP_TYPE = {
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

const createWidgetsCacheWithImageProp = (): Record< string, V1ElementConfig > =>
	( {
		'e-image': {
			title: 'Image',
			controls: {},
			elType: 'widget',
			atomic_props_schema: {
				image: E_IMAGE_PROP_TYPE,
			},
		},
	} ) as unknown as Record< string, V1ElementConfig >;

describe( 'CompositionBuilder.build applyProperties after create', () => {
	it( 'calls doUpdateElementProperty when create succeeds with element config', async () => {
		// Arrange
		const deleteElement = jest.fn();
		const doUpdateElementProperty = jest.fn();
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElement = jest.fn().mockReturnValue( createdElement );
		const getContainer = jest
			.fn()
			.mockImplementation( ( id: string ) => ( id === GENERATED_ELEMENT_ID ? createdElement : undefined ) );
		jest.mocked( getWidgetsCache ).mockReturnValue( createWidgetsCacheWithAtomicPropsSchema() );
		const builder = CompositionBuilder.fromXMLString( xmlStringWithWidgetConfiguration, {
			createElement,
			deleteElement,
			getContainer,
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createWidgetsCacheWithAtomicPropsSchema() ),
			doUpdateElementProperty,
		} );
		builder.setElementConfig( createElementConfigPayload() );

		// Act
		await builder.build( createMockRootContainer() );

		// Assert
		expect( deleteElement ).not.toHaveBeenCalled();
		expect( createElement ).toHaveBeenCalledTimes( 1 );
		expect( doUpdateElementProperty ).toHaveBeenCalledTimes( 1 );
		expect( doUpdateElementProperty ).toHaveBeenCalledWith( {
			elementId: GENERATED_ELEMENT_ID,
			propertyName: ELEMENT_CONFIG_PROPERTY,
			propertyValue: ELEMENT_CONFIG_VALUE,
			elementType: WIDGET_TAG,
		} );
	} );

	it( 'does not call doUpdateElementProperty when create succeeds without element config', async () => {
		// Arrange
		const deleteElement = jest.fn();
		const doUpdateElementProperty = jest.fn();
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElement = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString( `<${ ROOT_CHILD_TAG } />`, {
			createElement,
			deleteElement,
			getContainer: jest.fn(),
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createMinimalWidgetsCache() ),
			doUpdateElementProperty,
		} );

		// Act
		await builder.build( createMockRootContainer() );

		// Assert
		expect( deleteElement ).not.toHaveBeenCalled();
		expect( doUpdateElementProperty ).not.toHaveBeenCalled();
	} );

	it( 'persists canonical image prop when elementConfig uses dialect bindTo on src', async () => {
		// Arrange
		resetValidateInputWidgetsSchemaCache();
		initLlmDialect( {
			dynamicTags: {
				'post-featured-image': {
					name: 'post-featured-image',
					label: 'Featured Image',
					group: 'post',
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
		const imageConfigId = 'hero-image';
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElement = jest.fn().mockReturnValue( createdElement );
		const getContainer = jest
			.fn()
			.mockImplementation( ( id: string ) => ( id === GENERATED_ELEMENT_ID ? createdElement : undefined ) );
		jest.mocked( getWidgetsCache ).mockReturnValue( createWidgetsCacheWithImageProp() );
		const builder = CompositionBuilder.fromXMLString( `<e-image configuration-id="${ imageConfigId }" />`, {
			createElement,
			deleteElement: jest.fn(),
			getContainer,
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createWidgetsCacheWithImageProp() ),
			doUpdateElementProperty: doUpdateElementPropertyUtil,
		} );
		builder.setElementConfig( {
			[ imageConfigId ]: {
				image: LLM_IMAGE_VALUE,
			},
		} );

		// Act
		await builder.build( createMockRootContainer() );

		// Assert
		expect( updateElementSettings ).toHaveBeenCalledTimes( 1 );
		const persistedImage = jest.mocked( updateElementSettings ).mock.calls[ 0 ][ 0 ].props
			.image as TransformablePropValue< 'image', Record< string, unknown > >;
		expect( ( persistedImage.value.src as { $$type: string } ).$$type ).toBe( 'dynamic' );
		expect( __privateRunCommandSync ).toHaveBeenCalled();
	} );
} );

describe( 'CompositionBuilder.build required children', () => {
	it( 'rejects build when required direct children are absent from XML', async () => {
		// Arrange
		let elementIdSequence = 0;
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElementMock = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString(
			'<e-form configuration-id="form-1"><e-form-input /></e-form>',
			{
				createElement: createElementMock,
				deleteElement: jest.fn(),
				getContainer: jest.fn(),
				generateElementId: jest.fn().mockImplementation( () => `form-comp-${ ++elementIdSequence }` ),
				getWidgetsCache: jest.fn().mockReturnValue( FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN ),
				doUpdateElementProperty: jest.fn(),
			}
		);

		// Act & Assert
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow(
			/Missing required direct child element tag\(s\): e-form-success-message, e-form-error-message/
		);
		expect( createElementMock ).not.toHaveBeenCalled();
	} );

	it( 'rejects build when only some required direct children exist', async () => {
		// Arrange
		let elementIdSequence = 0;
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElementMock = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString(
			'<e-form configuration-id="form-1"><e-form-success-message /><e-form-input /></e-form>',
			{
				createElement: createElementMock,
				deleteElement: jest.fn(),
				getContainer: jest.fn(),
				generateElementId: jest.fn().mockImplementation( () => `form-comp-${ ++elementIdSequence }` ),
				getWidgetsCache: jest.fn().mockReturnValue( FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN ),
				doUpdateElementProperty: jest.fn(),
			}
		);

		// Act & Assert
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow(
			/Missing required direct child element tag\(s\): e-form-error-message/
		);
		expect( createElementMock ).not.toHaveBeenCalled();
	} );

	it( 'creates elements when XML includes all required direct children', async () => {
		// Arrange
		let elementIdSequence = 0;
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElementMock = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString(
			'<e-form configuration-id="form-1">' +
				'<e-form-success-message /><e-form-error-message /><e-form-input />' +
				'</e-form>',
			{
				createElement: createElementMock,
				deleteElement: jest.fn(),
				getContainer: jest.fn(),
				generateElementId: jest.fn().mockImplementation( () => `form-comp-${ ++elementIdSequence }` ),
				getWidgetsCache: jest.fn().mockReturnValue( FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN ),
				doUpdateElementProperty: jest.fn(),
			}
		);

		// Act
		await builder.build( createMockRootContainer() );

		// Assert
		const createArgs = createElementMock.mock.calls[ 0 ]?.[ 0 ] as CreateElementParams;
		const childElements = ( createArgs.model?.elements || [] ) as Array< { elType?: string; widgetType?: string } >;

		expect( childElements.filter( ( child ) => child.elType === 'e-form-success-message' ).length ).toBe( 1 );
		expect( childElements.filter( ( child ) => child.elType === 'e-form-error-message' ).length ).toBe( 1 );
		expect( childElements.some( ( child ) => child.widgetType === 'e-form-input' ) ).toBe( true );
	} );
} );
