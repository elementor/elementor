import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';
import { act } from '@testing-library/react';

import { createElement } from '../create-element';
import { deleteElement } from '../delete-element';
import { duplicateElement } from '../duplicate-element';
import { type DuplicatedElement, duplicateElements } from '../duplicate-elements';
import { getContainer } from '../get-container';
import { type V1ElementModelProps } from '../types';

jest.mock( '../create-element' );
jest.mock( '../delete-element' );
jest.mock( '../duplicate-element' );
jest.mock( '../get-container' );

describe( 'duplicateElements', () => {
	const historyMock = mockHistoryManager();
	const mockCreateElement = jest.mocked( createElement );
	const mockDeleteElement = jest.mocked( deleteElement );
	const mockDuplicateElement = jest.mocked( duplicateElement );
	const mockGetContainer = jest.mocked( getContainer );

	beforeEach( () => {
		historyMock.beforeEach();
		mockCreateElement.mockClear();
		mockDeleteElement.mockClear();
		mockDuplicateElement.mockClear();
		mockGetContainer.mockClear();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should duplicate multiple elements and return their data', () => {
		// Arrange.
		const { mockDuplicatedElement1, mockDuplicatedElement2 } = setupMockElementsForDuplication( mockGetContainer );

		mockDuplicateElement
			.mockReturnValueOnce( mockDuplicatedElement1 )
			.mockReturnValueOnce( mockDuplicatedElement2 );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'original-1', 'original-2' ],
			title: 'Duplicate Elements',
			subtitle: 'Elements duplicated',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 2 );
		expect( duplicateResult.duplicatedElements[ 0 ] ).toEqual( {
			id: 'duplicated-1',
			model: {
				id: 'duplicated-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Duplicated Button' },
			},
			originalElementId: 'original-1',
			modelToRestore: {
				id: 'duplicated-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Duplicated Button' },
			},
			parentContainerId: 'parent-1',
			at: 1,
		} );
		expect( duplicateResult.duplicatedElements[ 1 ] ).toEqual( {
			id: 'duplicated-2',
			model: {
				id: 'duplicated-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Duplicated Text' },
			},
			originalElementId: 'original-2',
			modelToRestore: {
				id: 'duplicated-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Duplicated Text' },
			},
			parentContainerId: 'parent-1',
			at: 2,
		} );

		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDuplicateElement ).toHaveBeenNthCalledWith( 1, {
			elementId: 'original-1',
			options: { useHistory: false, clone: true },
		} );
		expect( mockDuplicateElement ).toHaveBeenNthCalledWith( 2, {
			elementId: 'original-2',
			options: { useHistory: false, clone: true },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Duplicate Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements duplicated' );
	} );

	it( 'should delete duplicated elements on undo and recreate them on redo', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );
		const { mockDuplicatedElement1, mockDuplicatedElement2 } = mockSetup;

		mockDuplicateElement
			.mockReturnValueOnce( mockDuplicatedElement1 )
			.mockReturnValueOnce( mockDuplicatedElement2 );

		const mockRecreatedElement1 = createMockChild( { id: 'recreated-1', elType: 'widget', widgetType: 'button' } );
		const mockRecreatedElement2 = createMockChild( { id: 'recreated-2', elType: 'widget', widgetType: 'text' } );

		// Setup getContainer for recreated elements
		const mockRecreatedContainer1 = createMockContainer( 'recreated-1', [] );
		const mockRecreatedContainer1ToJSON = jest.spyOn( mockRecreatedContainer1.model, 'toJSON' );
		mockRecreatedContainer1ToJSON.mockReturnValue( {
			id: 'recreated-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Duplicated Button' },
		} as unknown as V1ElementModelProps );
		mockRecreatedContainer1.parent = mockSetup.mockParent;
		mockRecreatedContainer1.view = { _index: 1 };

		const mockRecreatedContainer2 = createMockContainer( 'recreated-2', [] );
		const mockRecreatedContainer2ToJSON = jest.spyOn( mockRecreatedContainer2.model, 'toJSON' );
		mockRecreatedContainer2ToJSON.mockReturnValue( {
			id: 'recreated-2',
			elType: 'widget',
			widgetType: 'text',
			settings: { content: 'Duplicated Text' },
		} as unknown as V1ElementModelProps );
		mockRecreatedContainer2.parent = mockSetup.mockParent;
		mockRecreatedContainer2.view = { _index: 2 };

		mockCreateElement.mockReturnValueOnce( mockRecreatedElement1 ).mockReturnValueOnce( mockRecreatedElement2 );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1', 'original-2' ],
			title: 'Duplicate Elements',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 1, {
			elementId: 'duplicated-2',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
			elementId: 'duplicated-1',
			options: { useHistory: false },
		} );

		// Arrange.
		mockGetContainer.mockImplementation( ( id ) => {
			switch ( id ) {
				case 'original-1':
					return mockSetup.mockOriginalElement1;
				case 'original-2':
					return mockSetup.mockOriginalElement2;
				case 'recreated-1':
					return mockRecreatedContainer1;
				case 'recreated-2':
					return mockRecreatedContainer2;
				default:
					return null;
			}
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockCreateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 1, {
			containerId: 'parent-1',
			model: {
				id: 'duplicated-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Duplicated Button' },
			},
			options: {
				useHistory: false,
				clone: false,
				at: 1,
			},
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
			containerId: 'parent-1',
			model: {
				id: 'duplicated-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Duplicated Text' },
			},
			options: {
				useHistory: false,
				clone: false,
				at: 2,
			},
		} );
	} );

	it( 'should call onCreate callback when provided', () => {
		// Arrange.
		const { mockDuplicatedElement1 } = setupMockElementsForDuplication( mockGetContainer );

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		const mockOnCreate = jest.fn().mockImplementation( ( elements: DuplicatedElement[] ) => {
			return elements.map( ( element: DuplicatedElement ) => ( {
				...element,
				customProperty: 'modified',
			} ) );
		} );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
			onCreate: mockOnCreate,
		} );

		// Assert.
		expect( mockOnCreate ).toHaveBeenCalledTimes( 1 );
		expect( mockOnCreate ).toHaveBeenCalledWith( [
			{
				id: 'duplicated-1',
				model: {
					id: 'duplicated-1',
					elType: 'widget',
					widgetType: 'button',
					settings: { text: 'Duplicated Button' },
				},
				originalElementId: 'original-1',
				modelToRestore: {
					id: 'duplicated-1',
					elType: 'widget',
					widgetType: 'button',
					settings: { text: 'Duplicated Button' },
				},
				parentContainerId: 'parent-1',
				at: 1,
			},
		] );
		expect( duplicateResult.duplicatedElements[ 0 ] ).toHaveProperty( 'customProperty', 'modified' );
	} );

	it( 'should call onCreate callback on redo when provided', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );
		const { mockDuplicatedElement1 } = mockSetup;

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		const mockRecreatedElement1 = createMockChild( { id: 'recreated-1', elType: 'widget', widgetType: 'button' } );
		const mockRecreatedContainer1 = createMockContainer( 'recreated-1', [] );
		const mockRecreatedContainer1ToJSON = jest.spyOn( mockRecreatedContainer1.model, 'toJSON' );
		mockRecreatedContainer1ToJSON.mockReturnValue( {
			id: 'recreated-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Duplicated Button' },
		} as unknown as V1ElementModelProps );
		mockRecreatedContainer1.parent = mockSetup.mockParent;
		mockRecreatedContainer1.view = { _index: 1 };

		mockCreateElement.mockReturnValue( mockRecreatedElement1 );

		const mockOnCreate = jest.fn().mockImplementation( ( elements: DuplicatedElement[] ) => elements );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
			onCreate: mockOnCreate,
		} );

		// Arrange.
		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'recreated-1' ) {
				return mockRecreatedContainer1;
			}
			return mockSetup.mockOriginalElement1;
		} );

		// Act.
		act( () => {
			historyMock.instance.undo();
		} );
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockOnCreate ).toHaveBeenCalledTimes( 2 ); // Once during initial duplication, once during redo
	} );

	it( 'should skip elements without parent containers', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );
		const mockElementWithoutParent = createMockContainer( 'no-parent', [] );
		mockElementWithoutParent.parent = undefined;

		const mockElementWithParent = mockSetup.mockOriginalElement1;
		const mockDuplicatedElement = mockSetup.mockDuplicatedElement1;

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'no-parent' ) {
				return mockElementWithoutParent;
			}
			if ( id === 'original-1' ) {
				return mockElementWithParent;
			}
			if ( id === 'duplicated-1' ) {
				return mockSetup.mockDuplicatedContainer1;
			}
			return null;
		} );

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'no-parent', 'original-1' ],
			title: 'Duplicate Elements',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 1 );
		expect( duplicateResult.duplicatedElements[ 0 ].originalElementId ).toBe( 'original-1' );
		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 1 );
		expect( mockDuplicateElement ).toHaveBeenCalledWith( {
			elementId: 'original-1',
			options: { useHistory: false, clone: true },
		} );
	} );

	it( 'should skip elements that cannot be found by getContainer', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'non-existent' ) {
				return null;
			}
			if ( id === 'original-1' ) {
				return mockSetup.mockOriginalElement1;
			}
			if ( id === 'duplicated-1' ) {
				return mockSetup.mockDuplicatedContainer1;
			}
			return null;
		} );

		const mockDuplicatedElement = mockSetup.mockDuplicatedElement1;
		mockDuplicateElement.mockReturnValue( mockDuplicatedElement );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'non-existent', 'original-1' ],
			title: 'Duplicate Elements',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 1 );
		expect( duplicateResult.duplicatedElements[ 0 ].originalElementId ).toBe( 'original-1' );
		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should skip elements where duplicated container cannot be found', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );
		const mockDuplicatedElement = mockSetup.mockDuplicatedElement1;

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'original-1' ) {
				return mockSetup.mockOriginalElement1;
			}
			if ( id === 'duplicated-1' ) {
				return null; // Duplicated container not found
			}
			return null;
		} );

		mockDuplicateElement.mockReturnValue( mockDuplicatedElement );

		// Act.
		const duplicateResult = duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
		} );

		// Assert.
		expect( duplicateResult.duplicatedElements ).toHaveLength( 0 );
		expect( mockDuplicateElement ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		const { mockDuplicatedElement1 } = setupMockElementsForDuplication( mockGetContainer );
		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
		} );

		// Assert.
		const historyItem = historyMock.instance.get();
		expect( historyItem?.subTitle ).toBe( 'Item duplicated' );
	} );

	it( 'should skip redo recreation when modelToRestore or parentContainerId is missing', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );
		const { mockDuplicatedElement1 } = mockSetup;
		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		const mockOriginalElement = mockSetup.mockOriginalElement1;
		const mockDuplicatedContainer = createMockContainer( 'duplicated-invalid', [] );
		const mockDuplicatedContainerToJSON = jest.spyOn( mockDuplicatedContainer.model, 'toJSON' );
		mockDuplicatedContainerToJSON.mockReturnValue( {
			id: 'duplicated-invalid',
			elType: 'widget',
			widgetType: 'button',
		} as unknown as V1ElementModelProps );
		mockDuplicatedContainer.parent = undefined; // Missing parent

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'original-1' ) {
				return mockOriginalElement;
			}
			if ( id === 'duplicated-1' ) {
				return mockDuplicatedContainer;
			}
			return null;
		} );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockCreateElement ).not.toHaveBeenCalled();
	} );

	it( 'should handle multiple undo/redo cycles', () => {
		// Arrange.
		const mockSetup = setupMockElementsForDuplication( mockGetContainer );
		const { mockDuplicatedElement1 } = mockSetup;
		mockDuplicateElement.mockReturnValue( mockDuplicatedElement1 );

		const mockRecreatedElement1 = createMockChild( { id: 'recreated-1', elType: 'widget', widgetType: 'button' } );
		const mockRecreatedContainer1 = createMockContainer( 'recreated-1', [] );
		const mockRecreatedContainer1ToJSON = jest.spyOn( mockRecreatedContainer1.model, 'toJSON' );
		mockRecreatedContainer1ToJSON.mockReturnValue( {
			id: 'recreated-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Duplicated Button' },
		} as unknown as V1ElementModelProps );
		mockRecreatedContainer1.parent = mockSetup.mockParent;
		mockRecreatedContainer1.view = { _index: 1 };

		mockCreateElement.mockReturnValue( mockRecreatedElement1 );

		// Act.
		duplicateElements( {
			elementIds: [ 'original-1' ],
			title: 'Duplicate Element',
		} );

		// Arrange.
		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'original-1' ) {
				return mockSetup.mockOriginalElement1;
			}
			if ( id === 'duplicated-1' ) {
				return mockSetup.mockDuplicatedContainer1;
			}
			if ( id === 'recreated-1' ) {
				return mockRecreatedContainer1;
			}
			return null;
		} );

		// Act.
		act( () => {
			historyMock.instance.undo();
		} );
		act( () => {
			historyMock.instance.redo();
		} );
		act( () => {
			historyMock.instance.undo();
		} );
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 ); // Two undo cycles
		expect( mockCreateElement ).toHaveBeenCalledTimes( 2 ); // Two redo cycles
	} );
} );

function setupMockElementsForDuplication( mockGetContainer: jest.Mock ) {
	const mockParent = createMockContainer( 'parent-1', [] );

	const mockOriginalElement1 = createMockContainer( 'original-1', [] );
	mockOriginalElement1.parent = mockParent;

	const mockOriginalElement2 = createMockContainer( 'original-2', [] );
	mockOriginalElement2.parent = mockParent;

	const mockDuplicatedElement1 = createMockChild( {
		id: 'duplicated-1',
		elType: 'widget',
		widgetType: 'button',
	} );
	const mockDuplicatedElement2 = createMockChild( { id: 'duplicated-2', elType: 'widget', widgetType: 'text' } );

	const mockDuplicatedContainer1 = createMockContainer( 'duplicated-1', [] );
	const mockDuplicatedContainer1ToJSON = jest.spyOn( mockDuplicatedContainer1.model, 'toJSON' );
	mockDuplicatedContainer1ToJSON.mockReturnValue( {
		id: 'duplicated-1',
		elType: 'widget',
		widgetType: 'button',
		settings: { text: 'Duplicated Button' },
	} as unknown as V1ElementModelProps );
	mockDuplicatedContainer1.parent = mockParent;
	mockDuplicatedContainer1.view = { _index: 1 };

	const mockDuplicatedContainer2 = createMockContainer( 'duplicated-2', [] );
	const mockDuplicatedContainer2ToJSON = jest.spyOn( mockDuplicatedContainer2.model, 'toJSON' );
	mockDuplicatedContainer2ToJSON.mockReturnValue( {
		id: 'duplicated-2',
		elType: 'widget',
		widgetType: 'text',
		settings: { content: 'Duplicated Text' },
	} as unknown as V1ElementModelProps );
	mockDuplicatedContainer2.parent = mockParent;
	mockDuplicatedContainer2.view = { _index: 2 };

	mockGetContainer.mockImplementation( ( id ) => {
		switch ( id ) {
			case 'original-1':
				return mockOriginalElement1;
			case 'original-2':
				return mockOriginalElement2;
			case 'duplicated-1':
				return mockDuplicatedContainer1;
			case 'duplicated-2':
				return mockDuplicatedContainer2;
			default:
				return null;
		}
	} );

	return {
		mockParent,
		mockOriginalElement1,
		mockOriginalElement2,
		mockDuplicatedElement1,
		mockDuplicatedElement2,
		mockDuplicatedContainer1,
		mockDuplicatedContainer2,
	};
}
