import { createMockChild, createMockContainer, createMockElement } from 'test-utils';
import { getContainer, type V1Element } from '@elementor/editor-elements';

import { getElementByType } from '../get-element-by-type';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
} ) );

const mockGetContainer = getContainer as jest.MockedFunction< typeof getContainer >;

describe( 'getElementByType', () => {
	const ELEMENT_ID = 'test-element-id';
	const TARGET_TYPE = 'widget';

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return the current element when it matches the target type', () => {
		// Arrange
		const mockElement = createMockElement( {
			model: { elType: TARGET_TYPE, id: ELEMENT_ID },
		} );

		mockGetContainer.mockReturnValue( mockElement );

		// Act
		const result = getElementByType( ELEMENT_ID, TARGET_TYPE );

		// Assert
		expect( result ).toBe( mockElement );
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should return the first matching child element when found recursively', () => {
		// Arrange
		const childElement1 = createMockChild( {
			elType: 'section',
			id: 'child-1',
		} );

		const childElement2 = createMockChild( {
			elType: TARGET_TYPE,
			id: 'child-2',
		} );

		const childElement3 = createMockChild( {
			elType: 'column',
			id: 'child-3',
		} );

		mockGetContainer.mockReturnValue(
			createMockContainer( ELEMENT_ID, [ childElement1, childElement2, childElement3 ] )
		);

		// Act
		const result = getElementByType( ELEMENT_ID, TARGET_TYPE );

		// Assert
		expect( result ).toBe( childElement2 );
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should find element in nested children', () => {
		// Arrange
		const nestedChild = createMockChild( {
			elType: TARGET_TYPE,
			id: 'nested-child',
		} );

		const parentChild = createMockChild( {
			elType: 'section',
			id: 'parent-child',
		} );

		const childWithChildren = createMockContainer( 'child-with-children', [ nestedChild ] );

		childWithChildren.model.set( 'elType', 'column' );

		mockGetContainer.mockReturnValue( createMockContainer( ELEMENT_ID, [ parentChild, childWithChildren ] ) );

		// Act
		const result = getElementByType( ELEMENT_ID, TARGET_TYPE );

		// Assert
		expect( result ).toBe( nestedChild );
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should throw error when no child element matches the type', () => {
		// Arrange
		const childElement1 = createMockChild( {
			elType: 'section',
			id: 'child-1',
		} );

		const childElement2 = createMockChild( {
			elType: 'column',
			id: 'child-2',
		} );

		mockGetContainer.mockReturnValue( createMockContainer( ELEMENT_ID, [ childElement1, childElement2 ] ) );

		// Act & Assert
		expect( () => getElementByType( ELEMENT_ID, TARGET_TYPE ) ).toThrow(
			`Child element ${ TARGET_TYPE } not found`
		);
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should throw error when container has no children', () => {
		// Arrange
		mockGetContainer.mockReturnValue( createMockContainer( ELEMENT_ID, [] ) );

		// Act & Assert
		expect( () => getElementByType( ELEMENT_ID, TARGET_TYPE ) ).toThrow(
			`Child element ${ TARGET_TYPE } not found`
		);
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should throw error when getContainer returns null', () => {
		// Arrange
		mockGetContainer.mockReturnValue( null );

		// Act & Assert
		expect( () => getElementByType( ELEMENT_ID, TARGET_TYPE ) ).toThrow(
			`Current element not found, elementId: ${ ELEMENT_ID }`
		);
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should handle empty children array', () => {
		// Arrange
		mockGetContainer.mockReturnValue( createMockContainer( ELEMENT_ID, [] ) );

		// Act & Assert
		expect( () => getElementByType( ELEMENT_ID, TARGET_TYPE ) ).toThrow(
			`Child element ${ TARGET_TYPE } not found`
		);
	} );

	it( 'should handle children with undefined children property', () => {
		// Arrange
		const childWithoutChildren = createMockChild( {
			elType: 'section',
			id: 'child-without-children',
		} );

		delete ( childWithoutChildren as V1Element & { children?: unknown } ).children;

		mockGetContainer.mockReturnValue( createMockContainer( ELEMENT_ID, [ childWithoutChildren ] ) );

		// Act & Assert
		expect( () => getElementByType( ELEMENT_ID, TARGET_TYPE ) ).toThrow(
			`Child element ${ TARGET_TYPE } not found`
		);
	} );

	it( 'should work with different element types', () => {
		// Arrange
		const sectionElement = createMockChild( {
			elType: 'section',
			id: 'section-element',
		} );

		mockGetContainer.mockReturnValue( createMockContainer( ELEMENT_ID, [ sectionElement ] ) );

		// Act
		const result = getElementByType( ELEMENT_ID, 'section' );

		// Assert
		expect( result ).toBe( sectionElement );
	} );
} );
