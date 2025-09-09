import * as React from 'react';
import { createMockContainer, createMockElement, createMockElementType } from 'test-utils';
import { type Element, type ElementType, getContainer, type V1Element } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { ElementProvider } from '../../../contexts/element-context';
import { ElementsField } from '../../elements-field';
import { useChildContainers } from '../ues-child-containers';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );

const ELEMENT_ID = 'test-element-123';
const CHILD_TYPE_1 = 'child-type-1';
const CHILD_TYPE_2 = 'child-type-2';
const CONTAINER_SELECTOR_1 = 'container-selector-1';
const CONTAINER_SELECTOR_2 = 'container-selector-2';

const MOCK_CHILD_ELEMENTS = [
	{
		type: CHILD_TYPE_1,
		target_container_selector: CONTAINER_SELECTOR_1,
	},
	{
		type: CHILD_TYPE_2,
		target_container_selector: CONTAINER_SELECTOR_2,
	},
];

const MOCK_CONTAINER_ELEMENT_1: V1Element = createMockElement( {
	model: {
		id: 'container-1',
		elType: CONTAINER_SELECTOR_1,
	},
} );

const MOCK_CONTAINER_ELEMENT_2: V1Element = createMockElement( {
	model: {
		id: 'container-2',
		elType: CONTAINER_SELECTOR_2,
	},
} );

const MOCK_CONTAINER: V1Element = createMockContainer( ELEMENT_ID, [] );

// Helper function to create wrapper with context
const createWrapper = ( childElements = MOCK_CHILD_ELEMENTS ) => {
	const element: Element = {
		id: ELEMENT_ID,
		type: 'widget',
	};

	const elementType: ElementType = createMockElementType( {
		key: 'widget',
		title: 'Test Widget',
		controls: [],
	} );

	return ( { children }: { children: React.ReactNode } ) => (
		<ElementProvider element={ element } elementType={ elementType }>
			<ElementsField childElements={ childElements }>{ children }</ElementsField>
		</ElementProvider>
	);
};

describe( 'useChildContainers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetContainer.mockReturnValue( MOCK_CONTAINER );
	} );

	it( 'should return child containers when found', () => {
		// Arrange
		const container = createMockContainer( ELEMENT_ID, [ MOCK_CONTAINER_ELEMENT_1, MOCK_CONTAINER_ELEMENT_2 ] );

		mockGetContainer.mockReturnValue( container );

		// Act
		const { result } = renderHook(
			() =>
				useChildContainers( {
					container1: CHILD_TYPE_1,
					container2: CHILD_TYPE_2,
				} ),
			{
				wrapper: createWrapper(),
			}
		);

		// Assert
		expect( result.current ).toEqual( {
			container1: MOCK_CONTAINER_ELEMENT_1,
			container2: MOCK_CONTAINER_ELEMENT_2,
		} );

		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should return null for containers that are not found', () => {
		// Arrange

		const container = createMockContainer( ELEMENT_ID, [ MOCK_CONTAINER_ELEMENT_1 ] );

		mockGetContainer.mockReturnValue( container );

		// Act
		const { result } = renderHook(
			() =>
				useChildContainers( {
					container1: CHILD_TYPE_1,
					container2: CHILD_TYPE_2,
				} ),
			{
				wrapper: createWrapper(),
			}
		);

		// Assert
		expect( result.current ).toEqual( {
			container1: MOCK_CONTAINER_ELEMENT_1,
			container2: null,
		} );
	} );

	it( 'should return null for child elements that do not exist', () => {
		// Arrange
		const container = createMockContainer( ELEMENT_ID, [ MOCK_CONTAINER_ELEMENT_2 ] );

		mockGetContainer.mockReturnValue( container );

		// Act
		const { result } = renderHook(
			() =>
				useChildContainers( {
					container1: 'non-existent-type',
					container2: CHILD_TYPE_2,
				} ),
			{
				wrapper: createWrapper(),
			}
		);

		// Assert
		expect( result.current ).toEqual( {
			container1: null,
			container2: MOCK_CONTAINER_ELEMENT_2,
		} );
	} );

	it( 'should return null for all containers when container is not found', () => {
		// Arrange
		mockGetContainer.mockReturnValue( null );

		// Act
		const { result } = renderHook(
			() =>
				useChildContainers( {
					container1: CHILD_TYPE_1,
					container2: CHILD_TYPE_2,
				} ),
			{
				wrapper: createWrapper(),
			}
		);

		// Assert
		expect( result.current ).toEqual( {
			container1: null,
			container2: null,
		} );
	} );

	it( 'should return null for all containers when container has no children', () => {
		// Arrange
		const containerWithoutChildren: V1Element = {
			...MOCK_CONTAINER,
			children: undefined,
		};

		mockGetContainer.mockReturnValue( containerWithoutChildren );

		// Act
		const { result } = renderHook(
			() =>
				useChildContainers( {
					container1: CHILD_TYPE_1,
					container2: CHILD_TYPE_2,
				} ),
			{
				wrapper: createWrapper(),
			}
		);

		// Assert
		expect( result.current ).toEqual( {
			container1: null,
			container2: null,
		} );
	} );

	it( 'should handle empty container types object', () => {
		// Arrange
		const containerTypes = {};

		// Act
		const { result } = renderHook( () => useChildContainers( containerTypes ), {
			wrapper: createWrapper(),
		} );

		// Assert
		expect( result.current ).toEqual( {} );
		expect( mockGetContainer ).toHaveBeenCalledWith( ELEMENT_ID );
	} );

	it( 'should handle child elements with missing target_container_selector', () => {
		// Arrange
		const childElementsWithMissingSelector = [
			{
				type: CHILD_TYPE_1,
				target_container_selector: '',
			},
		];

		const container = createMockContainer( ELEMENT_ID, [ MOCK_CONTAINER_ELEMENT_1 ] );

		mockGetContainer.mockReturnValue( container );

		// Act
		const { result } = renderHook(
			() =>
				useChildContainers( {
					container1: CHILD_TYPE_1,
				} ),
			{
				wrapper: createWrapper( childElementsWithMissingSelector ),
			}
		);

		// Assert
		expect( result.current ).toEqual( {
			container1: null,
		} );
	} );

	it( 'should handle multiple container types with mixed results', () => {
		// Arrange
		const containerTypes = {
			found: CHILD_TYPE_1,
			notFound: 'non-existent-type',
			noContainer: CHILD_TYPE_2,
		};

		const container = createMockContainer( ELEMENT_ID, [ MOCK_CONTAINER_ELEMENT_1 ] );

		mockGetContainer.mockReturnValue( container );

		// Act
		const { result } = renderHook( () => useChildContainers( containerTypes ), {
			wrapper: createWrapper(),
		} );

		// Assert
		expect( result.current ).toEqual( {
			found: MOCK_CONTAINER_ELEMENT_1,
			notFound: null,
			noContainer: null,
		} );
	} );

	it( 'should throw error when used outside ElementsField context', () => {
		// Arrange
		const containerTypes = { container1: CHILD_TYPE_1 };

		// Suppress console errors for this test
		const consoleSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		// Act & Assert
		expect( () => {
			renderHook( () => useChildContainers( containerTypes ) );
		} ).toThrow( 'useElementsField must be used within an ElementsField' );

		// Restore console
		consoleSpy.mockRestore();
	} );
} );
