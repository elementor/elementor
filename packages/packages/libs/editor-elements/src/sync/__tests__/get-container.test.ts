import { getContainer, getRealContainer } from '../get-container';
import { type ExtendedWindow } from '../types';

describe( 'getContainer', () => {
	const mockGetContainer = jest.fn();

	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			getContainer: mockGetContainer,
		};
	} );

	it( 'should return the container', () => {
		// Arrange.
		const elementID = '1-heading';
		const container = { id: elementID };
		mockGetContainer.mockReturnValue( container );

		// Act.
		const result = getContainer( elementID );

		// Assert.
		expect( result ).toBe( container );
	} );

	it( 'should return null if the container is not found and no document structure exists', () => {
		// Arrange.
		const elementID = '1-heading';
		mockGetContainer.mockReturnValue( undefined );

		// Act.
		const result = getContainer( elementID );

		// Assert.
		expect( result ).toBe( null );
	} );

	it( 'should return virtual container from document model when real container is not found', () => {
		// Arrange.
		const elementID = 'child-element';
		const mockChildModel = {
			get: jest.fn( ( key: string ) => {
				if ( key === 'id' ) {
					return elementID;
				}
				if ( key === 'settings' ) {
					return { text: 'test' };
				}
				return undefined;
			} ),
			set: jest.fn(),
			toJSON: jest.fn(),
		};
		const mockParentModel = {
			get: jest.fn( ( key: string ) => {
				if ( key === 'id' ) {
					return 'parent-element';
				}
				if ( key === 'elements' ) {
					return [ mockChildModel ];
				}
				if ( key === 'settings' ) {
					return {};
				}
				return undefined;
			} ),
			set: jest.fn(),
			toJSON: jest.fn(),
		};
		const documentContainer = {
			model: {
				get: jest.fn( ( key: string ) => {
					if ( key === 'elements' ) {
						return [ mockParentModel ];
					}
					return undefined;
				} ),
			},
		};

		mockGetContainer.mockReturnValue( undefined );

		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			...extendedWindow.elementor,
			getContainer: mockGetContainer,
			documents: {
				getCurrent: () => ( { container: documentContainer } ),
			},
		};

		// Act.
		const result = getContainer( elementID );

		// Assert.
		expect( result ).not.toBe( null );
		expect( result?.id ).toBe( elementID );
		expect( result?.model ).toBe( mockChildModel );
		expect( result?.view ).toBeUndefined();
	} );
} );

describe( 'getRealContainer', () => {
	const mockGetContainer = jest.fn();

	beforeEach( () => {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			getContainer: mockGetContainer,
		};
	} );

	it( 'should return null if the real container is not found (no fallback)', () => {
		// Arrange.
		const elementID = '1-heading';
		mockGetContainer.mockReturnValue( undefined );

		// Act.
		const result = getRealContainer( elementID );

		// Assert.
		expect( result ).toBe( null );
	} );
} );
