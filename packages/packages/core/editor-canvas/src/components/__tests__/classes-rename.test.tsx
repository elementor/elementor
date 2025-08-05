import * as React from 'react';
import { render } from '@testing-library/react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { hash } from '@elementor/utils';

import { ClassesRename } from '../classes-rename';

// Mock dependencies
jest.mock( '@elementor/editor-documents', () => ( {
	getV1DocumentsManager: jest.fn(),
} ) );

jest.mock( '@elementor/editor-styles-repository', () => ( {
	stylesRepository: {
		subscribe: jest.fn(),
	},
} ) );

jest.mock( '@elementor/utils', () => ( {
	hash: jest.fn(),
} ) );

const createMockDocument = () => {
	const mockElement = {
		classList: {
			replace: jest.fn(),
		},
	};

	const mockQuerySelectorAll = jest.fn().mockReturnValue( [ mockElement ] );

	const mockContainer = {
		view: {
			el: {
				querySelectorAll: mockQuerySelectorAll,
			},
		},
	};

	const mockDocument = {
		container: mockContainer,
	};

	return { mockDocument, mockContainer, mockElement };
};

describe( '<ClassesRename />', () => {
	let mockSubscribe: jest.MockedFunction< typeof stylesRepository.subscribe >;
	let mockGetV1DocumentsManager: jest.MockedFunction< typeof getV1DocumentsManager >;
	let mockHash: jest.MockedFunction< typeof hash >;

	beforeEach( () => {
		mockSubscribe = jest.mocked( stylesRepository.subscribe );
		mockGetV1DocumentsManager = jest.mocked( getV1DocumentsManager );
		mockHash = jest.mocked( hash );
	} );

	it( 'should render without errors and return null', () => {
		// Act.
		const { container } = render( <ClassesRename /> );

		// Assert.
		expect( container.firstChild ).toBeNull();
	} );

	it( 'should subscribe to stylesRepository on mount', () => {
		// Act.
		render( <ClassesRename /> );

		// Assert.
		expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
		expect( mockSubscribe ).toHaveBeenCalledWith( expect.any( Function ) );
	} );

	describe( 'styles repository subscription', () => {
		let subscriptionCallback: ( previous: any, current: any ) => void;

		beforeEach( () => {
			render( <ClassesRename /> );
			subscriptionCallback = mockSubscribe.mock.calls[ 0 ][ 0 ];
		} );

		it( 'should not rename classes when no classes have been changed', () => {
			// Arrange.
			const { mockElement } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash1' );

			const previousStyles = {
				style1: { label: 'old-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'old-class', color: 'red' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).not.toHaveBeenCalled();
		} );

		it( 'should rename classes when label changes', () => {
			// Arrange.
			const { mockDocument, mockElement } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash2' );

			const previousStyles = {
				style1: { label: 'old-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'new-class', color: 'red' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class', 'new-class' );
		} );

		it( 'should not rename classes when only non-label properties change', () => {
			// Arrange.
			const { mockDocument, mockElement } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash2' );

			const previousStyles = {
				style1: { label: 'same-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'same-class', color: 'blue' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).not.toHaveBeenCalled();
		} );

		it( 'should handle multiple style changes', () => {
			// Arrange.
			const { mockDocument, mockElement } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
				},
			} as any );

			const previousStyles = {
				style1: { label: 'old-class-1', color: 'red' },
				style2: { label: 'old-class-2', color: 'blue' },
				style3: { label: 'unchanged-class', color: 'green' },
			};

			const currentStyles = {
				style1: { label: 'new-class-1', color: 'red' },
				style2: { label: 'new-class-2', color: 'blue' },
				style3: { label: 'unchanged-class', color: 'green' },
			};

			// Mock hash to return different values for changed styles, same for unchanged
			mockHash
				.mockReturnValueOnce( 'hash1' ) // previous style1
				.mockReturnValueOnce( 'hash1-changed' ) // current style1
				.mockReturnValueOnce( 'hash2' ) // previous style2
				.mockReturnValueOnce( 'hash2-changed' ) // current style2
				.mockReturnValueOnce( 'hash3' ) // previous style3
				.mockReturnValueOnce( 'hash3' ); // current style3 (unchanged)

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).toHaveBeenCalledTimes( 2 );
			expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class-1', 'new-class-1' );
			expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class-2', 'new-class-2' );
		} );

		it( 'should not rename classes when new label is undefined', () => {
			// Arrange.
			const { mockDocument, mockElement } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash2' );

			const previousStyles = {
				style1: { label: 'old-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: undefined, color: 'red' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).not.toHaveBeenCalled();
		} );

		it( 'should handle new styles (not in previous)', () => {
			// Arrange.
			const { mockDocument, mockElement } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash1' );

			const previousStyles = {
				style1: { label: 'existing-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'existing-class', color: 'red' },
				style2: { label: 'new-class', color: 'blue' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).not.toHaveBeenCalled();
		} );

		it( 'should handle multiple documents', () => {
			// Arrange.
			const { mockDocument, mockElement } = createMockDocument();
			const { mockDocument: mockDocument2, mockElement: mockElement2 } = createMockDocument();

			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
					2: mockDocument2,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash2' );

			const previousStyles = {
				style1: { label: 'old-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'new-class', color: 'red' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class', 'new-class' );
			expect( mockElement2.classList.replace ).toHaveBeenCalledWith( 'old-class', 'new-class' );
		} );

		it( 'should handle documents without view or el', () => {
			// Arrange.
			const incompleteDocument = {
				container: {
					view: null,
				},
			};

			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: incompleteDocument,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash2' );

			const previousStyles = {
				style1: { label: 'old-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'new-class', color: 'red' },
			};

			// Act & Assert - should not throw an error.
			expect( () => {
				subscriptionCallback( previousStyles, currentStyles );
			} ).not.toThrow();
		} );

		it( 'should use correct CSS selector format', () => {
			// Arrange.
			const { mockDocument, mockContainer } = createMockDocument();
			mockGetV1DocumentsManager.mockReturnValue( {
				documents: {
					1: mockDocument,
				},
			} as any );
			mockHash.mockReturnValueOnce( 'hash1' ).mockReturnValueOnce( 'hash2' );

			const previousStyles = {
				style1: { label: 'test-class', color: 'red' },
			};

			const currentStyles = {
				style1: { label: 'new-test-class', color: 'red' },
			};

			// Act.
			subscriptionCallback( previousStyles, currentStyles );

			// Assert.
			expect( mockContainer.view.el.querySelectorAll ).toHaveBeenCalledWith( '.elementor .test-class' );
		} );
	} );
} ); 