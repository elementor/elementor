import { type CreateElementParams, type V1Element, type V1ElementConfig } from '@elementor/editor-elements';

import { CompositionBuilder } from '../composition-builder';

const ROOT_CHILD_TAG = 'column';
const GENERATED_ELEMENT_ID = 'generated-element-id';
const CONFIG_ID = 'cfg-a';
const ELEMENT_CONFIG_PROPERTY = 'title';
const ELEMENT_CONFIG_VALUE = 'configured-value';

const xmlStringWithConfiguration = `<${ ROOT_CHILD_TAG } configuration-id="${ CONFIG_ID }" />`;

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
		const doUpdateElementProperty = jest.fn();
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
			doUpdateElementProperty,
		} );
		builder.setElementConfig( createElementConfigPayload() );

		// Act
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow( 'create failed' );

		// Assert
		expect( getContainer ).toHaveBeenCalledWith( GENERATED_ELEMENT_ID );
		expect( deleteElement ).toHaveBeenCalledTimes( 1 );
		expect( deleteElement ).toHaveBeenCalledWith( { container: partialContainer } );
		expect( doUpdateElementProperty ).not.toHaveBeenCalled();
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
		await builder.build( createMockRootContainer() );

		// Assert
		expect( deleteElement ).not.toHaveBeenCalled();
		expect( createElement ).toHaveBeenCalledTimes( 1 );
		expect( doUpdateElementProperty ).toHaveBeenCalledTimes( 1 );
		expect( doUpdateElementProperty ).toHaveBeenCalledWith( {
			elementId: GENERATED_ELEMENT_ID,
			propertyName: ELEMENT_CONFIG_PROPERTY,
			propertyValue: ELEMENT_CONFIG_VALUE,
			elementType: ROOT_CHILD_TAG,
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

describe( 'CompositionBuilder.build final composition built event', () => {
	let dispatchEventSpy: jest.SpyInstance;

	beforeEach( () => {
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	it( 'dispatches elementor/composition/built event with root container IDs after applyProperties completes', async () => {
		// Arrange
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const doUpdateElementProperty = jest.fn();
		const createElement = jest.fn().mockReturnValue( createdElement );
		const getContainer = jest
			.fn()
			.mockImplementation( ( id: string ) => ( id === GENERATED_ELEMENT_ID ? createdElement : undefined ) );
		const builder = CompositionBuilder.fromXMLString( xmlStringWithConfiguration, {
			createElement,
			deleteElement: jest.fn(),
			getContainer,
			generateElementId: jest.fn().mockReturnValue( GENERATED_ELEMENT_ID ),
			getWidgetsCache: jest.fn().mockReturnValue( createMinimalWidgetsCache() ),
			doUpdateElementProperty,
		} );
		builder.setElementConfig( createElementConfigPayload() );

		// Act
		await builder.build( createMockRootContainer() );

		// Assert
		expect( doUpdateElementProperty ).toHaveBeenCalledTimes( 1 );
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'elementor/composition/built',
				detail: {
					rootContainers: [ GENERATED_ELEMENT_ID ],
				},
			} )
		);
	} );
} );
