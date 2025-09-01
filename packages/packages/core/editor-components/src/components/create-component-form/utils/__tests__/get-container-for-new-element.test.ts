import { getContainer, getCurrentDocumentContainer, getSelectedElements } from '@elementor/editor-elements';

import { getContainerForNewElement } from '../get-container-for-new-element';

jest.mock( '@elementor/editor-elements' );

describe( 'getContainerForNewElement', () => {
	const mockCurrentDocumentContainer = { id: 'doc1' };
	const mockGetContainer = getContainer as jest.Mock;
	const mockGetCurrentDocumentContainer = getCurrentDocumentContainer as jest.Mock;
	const mockGetSelectedElements = getSelectedElements as jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetCurrentDocumentContainer.mockReturnValue( mockCurrentDocumentContainer );
	} );

	describe( 'no elements selected', () => {
		it( 'should return current document container when no elements are selected', () => {
			// Arrange.
			mockGetSelectedElements.mockReturnValue( [] );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockCurrentDocumentContainer } );
		} );

		it( 'should handle null document container', () => {
			// Arrange.
			mockGetCurrentDocumentContainer.mockReturnValue( null );
			mockGetSelectedElements.mockReturnValue( [] );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: null } );
		} );
	} );

	describe( 'selected element is widget', () => {
		it( 'should return element parent as container and the next index as { options: at }', () => {
			// Arrange.
			const mockParent = {
				id: 'parent1',
				children: [ { id: 'widget1' }, { id: 'widget2' } ],
			};
			const mockWidget = {
				model: { get: () => 'widget' },
				id: 'widget1',
				parent: mockParent,
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'widget1' } ] );
			mockGetContainer.mockReturnValue( mockWidget );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( {
				container: mockParent,
				options: { at: 1 },
			} );
		} );

		it( 'should return current document container when widget parent is not found', () => {
			// Arrange.
			const mockWidget = {
				model: { get: () => 'widget' },
				id: 'widget1',
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'widget1' } ] );
			mockGetContainer.mockReturnValue( mockWidget );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockCurrentDocumentContainer } );
		} );

		it( 'should handle undefined parent children', () => {
			// Arrange.
			const mockParent = {
				id: 'parent1',
				children: undefined,
			};
			const mockWidget = {
				model: { get: () => 'widget' },
				id: 'widget1',
				parent: mockParent,
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'widget1' } ] );
			mockGetContainer.mockReturnValue( mockWidget );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockParent } );
		} );

		it( 'should handle widget not found in parent children array', () => {
			// Arrange.
			const mockParent = {
				id: 'parent1',
				children: [ { id: 'other-widget' } ],
			};
			const mockWidget = {
				model: { get: () => 'widget' },
				id: 'widget1',
				parent: mockParent,
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'widget1' } ] );
			mockGetContainer.mockReturnValue( mockWidget );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockParent } );
		} );
	} );

	describe( 'selected element is section', () => {
		it( 'should return first child of section', () => {
			// Arrange.
			const mockChild = { id: 'child1' };
			const mockSection = {
				model: { get: () => 'section' },
				children: [ mockChild ],
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'section1' } ] );
			mockGetContainer.mockReturnValue( mockSection );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( {
				container: mockChild,
			} );
		} );

		it( 'should return current document container when section has no children', () => {
			// Arrange.
			const mockSection = {
				model: { get: () => 'section' },
				children: [],
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'section1' } ] );
			mockGetContainer.mockReturnValue( mockSection );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( {
				container: mockCurrentDocumentContainer,
			} );
		} );

		it( 'should handle undefined children in section', () => {
			// Arrange.
			const mockSection = {
				model: { get: () => 'section' },
				children: undefined,
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'section1' } ] );
			mockGetContainer.mockReturnValue( mockSection );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockCurrentDocumentContainer } );
		} );
	} );

	describe( 'selected element is a container (neither widget nor section)', () => {
		it( 'should return selected element as container', () => {
			// Arrange.
			const mockElement = {
				model: { get: () => 'e-div-block' },
				id: 'el1',
			};
			mockGetSelectedElements.mockReturnValue( [ { id: 'el1' } ] );
			mockGetContainer.mockReturnValue( mockElement );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( {
				container: mockElement,
			} );
		} );
	} );

	describe( 'invalid selected element', () => {
		it( 'should return current document container when multiple elements are selected', () => {
			// Arrange.
			mockGetSelectedElements.mockReturnValue( [ { id: 'el1' }, { id: 'el2' } ] );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockCurrentDocumentContainer } );
		} );

		it( 'should return current document container when selected element is not found', () => {
			// Arrange.
			mockGetSelectedElements.mockReturnValue( [ { id: 'el1' } ] );
			mockGetContainer.mockReturnValue( null );

			// Act.
			const result = getContainerForNewElement();

			// Assert.
			expect( result ).toEqual( { container: mockCurrentDocumentContainer } );
		} );
	} );
} );
