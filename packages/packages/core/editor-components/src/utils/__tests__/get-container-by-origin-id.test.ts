import { createMockElement } from 'test-utils';
import { getContainer } from '@elementor/editor-elements';

import { getContainerByOriginId } from '../get-container-by-origin-id';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );

describe( 'getContainerByOriginId', () => {
	const mockGetContainerByKeyValue = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		( window as unknown as { elementor: unknown } ).elementor = {
			getContainerByKeyValue: mockGetContainerByKeyValue,
		};
	} );

	afterEach( () => {
		delete ( window as unknown as { elementor?: unknown } ).elementor;
	} );

	it( 'should fall back to getContainer when no instanceElementId is provided', () => {
		// Arrange
		const element = createMockElement( { model: { id: 'elem-1' } } );
		mockGetContainer.mockReturnValue( element );

		// Act
		const result = getContainerByOriginId( 'elem-1' );

		// Assert
		expect( result ).toBe( element );
		expect( mockGetContainer ).toHaveBeenCalledWith( 'elem-1' );
		expect( mockGetContainerByKeyValue ).not.toHaveBeenCalled();
	} );

	it( 'should search by originId within instance scope when instanceElementId is provided', () => {
		// Arrange
		const instanceContainer = createMockElement( {
			model: { id: 'instance-1' },
			view: { el: document.createElement( 'div' ) },
		} );
		const innerElement = createMockElement( { model: { id: 'instance-1_elem-1' } } );

		mockGetContainer.mockReturnValue( instanceContainer );
		mockGetContainerByKeyValue.mockReturnValue( innerElement );

		// Act
		const result = getContainerByOriginId( 'elem-1', 'instance-1' );

		// Assert
		expect( result ).toBe( innerElement );
		expect( mockGetContainer ).toHaveBeenCalledWith( 'instance-1' );
		expect( mockGetContainerByKeyValue ).toHaveBeenCalledWith( {
			key: 'originId',
			value: 'elem-1',
			parent: instanceContainer.view,
		} );
	} );

	it( 'should return null when instance container is not found', () => {
		// Arrange
		mockGetContainer.mockReturnValue( null );

		// Act
		const result = getContainerByOriginId( 'elem-1', 'non-existent-instance' );

		// Assert
		expect( result ).toBeNull();
		expect( mockGetContainerByKeyValue ).not.toHaveBeenCalled();
	} );

	it( 'should return null when inner element is not found within instance', () => {
		// Arrange
		const instanceContainer = createMockElement( {
			model: { id: 'instance-1' },
			view: { el: document.createElement( 'div' ) },
		} );

		mockGetContainer.mockReturnValue( instanceContainer );
		mockGetContainerByKeyValue.mockReturnValue( null );

		// Act
		const result = getContainerByOriginId( 'non-existent-elem', 'instance-1' );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should return null when legacy editor API is unavailable', () => {
		// Arrange
		const instanceContainer = createMockElement( {
			model: { id: 'instance-1' },
		} );

		mockGetContainer.mockReturnValue( instanceContainer );
		( window as unknown as { elementor: unknown } ).elementor = {};

		// Act
		const result = getContainerByOriginId( 'elem-1', 'instance-1' );

		// Assert
		expect( result ).toBeNull();
	} );
} );
