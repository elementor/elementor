import { getContainer } from '../get-container';
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

	it( 'should return null if the container is not found', () => {
		// Arrange.
		const elementID = '1-heading';
		const container = undefined;
		mockGetContainer.mockReturnValue( container );

		// Act.
		const result = getContainer( elementID );

		// Assert.
		expect( result ).toBe( null );
	} );
} );
