import * as React from 'react';
import { getV1DocumentsManager } from '@elementor/editor-documents';
import { type StyleDefinition } from '@elementor/editor-styles';
import { render } from '@testing-library/react';

import { ClassesRename } from '../classes-rename';

jest.mock( '@elementor/editor-documents', () => ( {
	getV1DocumentsManager: jest.fn(),
} ) );

jest.mock( '@elementor/editor-styles-repository', () => ( {
	stylesRepository: {
		subscribe: jest.fn(),
		register: jest.fn(),
		all: jest.fn(),
	},
	createStylesProvider: jest.fn(),
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

interface StylesMap {
	[ key: string ]: StyleDefinition;
}

describe( 'ClassesRename', () => {
	const mockGetV1DocumentsManager = jest.mocked( getV1DocumentsManager );
	const { stylesRepository } = jest.requireMock( '@elementor/editor-styles-repository' );
	const mockSubscribe = jest.mocked( stylesRepository.subscribe ).mockReturnValue( jest.fn() );

	const triggerStylesChange = ( previousStyles: StylesMap, currentStyles: StylesMap ) => {
		const subscriptionCallback = mockSubscribe.mock.calls[ mockSubscribe.mock.calls.length - 1 ][ 0 ];
		subscriptionCallback( previousStyles as never, currentStyles as never );
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not rename classes when no classes have been changed', () => {
		// Arrange.
		const { mockElement } = createMockDocument();
		mockGetV1DocumentsManager.mockReturnValue( {
			documents: {},
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'old-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'old-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

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
		} as never );

		const previousStyles: StylesMap = {
			style1: {
				id: 'style1',
				label: 'old-class',
				type: 'class',
				variants: [],
			},
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'new-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

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
		} as never );

		const previousStyles: StylesMap = {
			style1: {
				id: 'style1',
				label: 'same-class',
				type: 'class',
				variants: [ { meta: { breakpoint: null, state: null }, props: {}, custom_css: null } ],
			},
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'same-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

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
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'old-class-1', type: 'class', variants: [] },
			style2: { id: 'style2', label: 'old-class-2', type: 'class', variants: [] },
			style3: { id: 'style3', label: 'unchanged-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'new-class-1', type: 'class', variants: [] },
			style2: { id: 'style2', label: 'new-class-2', type: 'class', variants: [] },
			style3: { id: 'style3', label: 'unchanged-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

		// Assert.
		expect( mockElement.classList.replace ).toHaveBeenCalledTimes( 2 );
		expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class-1', 'new-class-1' );
		expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class-2', 'new-class-2' );
	} );

	it( 'should rename classes when new label is an empty string', () => {
		// Arrange.
		const { mockDocument, mockElement } = createMockDocument();
		mockGetV1DocumentsManager.mockReturnValue( {
			documents: {
				1: mockDocument,
			},
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'old-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: '', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

		// Assert.
		expect( mockElement.classList.replace ).toHaveBeenCalledWith( 'old-class', '' );
	} );

	it( 'should handle new styles (not in previous)', () => {
		// Arrange.
		const { mockDocument, mockElement } = createMockDocument();
		mockGetV1DocumentsManager.mockReturnValue( {
			documents: {
				1: mockDocument,
			},
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'existing-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'existing-class', type: 'class', variants: [] },
			style2: { id: 'style2', label: 'new-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

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
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'old-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'new-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

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
				1: incompleteDocument as never,
			},
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'old-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'new-class', type: 'class', variants: [] },
		};

		// Act & Assert - should not throw an error.
		expect( () => {
			render( <ClassesRename /> );
			triggerStylesChange( previousStyles, currentStyles );
		} ).not.toThrow();
	} );

	it( 'should use correct CSS selector format', () => {
		// Arrange.
		const { mockDocument, mockContainer } = createMockDocument();
		mockGetV1DocumentsManager.mockReturnValue( {
			documents: {
				1: mockDocument,
			},
		} as never );

		const previousStyles: StylesMap = {
			style1: { id: 'style1', label: 'test-class', type: 'class', variants: [] },
		};

		const currentStyles: StylesMap = {
			style1: { id: 'style1', label: 'new-test-class', type: 'class', variants: [] },
		};

		// Act.
		render( <ClassesRename /> );
		triggerStylesChange( previousStyles, currentStyles );

		// Assert.
		// eslint-disable-next-line testing-library/no-node-access
		expect( mockContainer.view.el.querySelectorAll ).toHaveBeenCalledWith( '.elementor .test-class' );
	} );
} );
