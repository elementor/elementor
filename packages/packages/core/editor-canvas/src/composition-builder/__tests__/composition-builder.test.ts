import { type V1Element } from '@elementor/editor-elements';

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
		expect( deleteElement ).toHaveBeenCalledWith( { container: partialContainer, options: { useHistory: false } } );
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
		expect( deleteElement ).toHaveBeenCalledWith( { container: partialContainer, options: { useHistory: false } } );
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
