import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';
import { act } from '@testing-library/react';

import { createElement } from '../create-element';
import { deleteElement } from '../delete-element';
import { getContainer } from '../get-container';
import { removeElements } from '../remove-elements';
import { type V1ElementModelProps } from '../types';

jest.mock( '../create-element' );
jest.mock( '../delete-element' );
jest.mock( '../get-container' );

describe( 'removeElements', () => {
	const historyMock = mockHistoryManager();
	const mockCreateElement = jest.mocked( createElement );
	const mockDeleteElement = jest.mocked( deleteElement );
	const mockGetContainer = jest.mocked( getContainer );

	beforeEach( () => {
		historyMock.beforeEach();
		mockCreateElement.mockClear();
		mockDeleteElement.mockClear();
		mockGetContainer.mockClear();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	const setupMockElementsForRemoval = () => {
		const mockParent = createMockContainer( 'parent-1', [] );

		const mockElement1 = createMockContainer( 'element-1', [] );
		const mockElement1ToJSON = jest.spyOn( mockElement1.model, 'toJSON' );
		mockElement1ToJSON.mockReturnValue( {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Button 1' },
		} as unknown as V1ElementModelProps );
		mockElement1.parent = mockParent;
		mockElement1.view = { _index: 0 };

		const mockElement2 = createMockContainer( 'element-2', [] );
		const mockElement2ToJSON = jest.spyOn( mockElement2.model, 'toJSON' );
		mockElement2ToJSON.mockReturnValue( {
			id: 'element-2',
			elType: 'widget',
			widgetType: 'text',
			settings: { content: 'Text content' },
		} as unknown as V1ElementModelProps );
		mockElement2.parent = mockParent;
		mockElement2.view = { _index: 1 };

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return mockElement1;
			}
			if ( id === 'element-2' ) {
				return mockElement2;
			}
			return null;
		} );

		return { mockElement1, mockElement2, mockParent };
	};

	it( 'should collect element data before deletion and delete elements', () => {
		// Arrange.
		const { mockElement1, mockElement2 } = setupMockElementsForRemoval();

		// Act.
		const removeResult = removeElements( {
			elementIds: [ 'element-1', 'element-2' ],
			title: 'Remove Elements',
			subtitle: 'Elements removed',
		} );

		// Assert.
		expect( removeResult.elementIds ).toEqual( [ 'element-1', 'element-2' ] );
		expect( removeResult.removedElements ).toHaveLength( 2 );

		// Check collected data.
		expect( removeResult.removedElements[ 0 ] ).toEqual( {
			elementId: 'element-1',
			model: {
				id: 'element-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Button 1' },
			},
			parent: mockElement1.parent,
			at: 0,
		} );

		expect( removeResult.removedElements[ 1 ] ).toEqual( {
			elementId: 'element-2',
			model: {
				id: 'element-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Text content' },
			},
			parent: mockElement2.parent,
			at: 1,
		} );

		// Check deletions.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 1, {
			elementId: 'element-1',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
			elementId: 'element-2',
			options: { useHistory: false },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Remove Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements removed' );
	} );

	it( 'should restore deleted elements on undo and delete them again on redo', () => {
		// Arrange.
		setupMockElementsForRemoval();

		const mockRestoredElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockRestoredElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement.mockReturnValueOnce( mockRestoredElement1 ).mockReturnValueOnce( mockRestoredElement2 );

		// Act.
		removeElements( {
			elementIds: [ 'element-1', 'element-2' ],
			title: 'Remove Elements',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockCreateElement ).toHaveBeenCalledTimes( 2 );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 1, {
			containerId: 'parent-1',
			model: {
				id: 'element-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Text content' },
			},
			options: { useHistory: false, at: 1 },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
			containerId: 'parent-1',
			model: {
				id: 'element-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Button 1' },
			},
			options: { useHistory: false, at: 0 },
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 4 ); // 2 from initial removal + 2 from redo
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 3, {
			elementId: 'element-1',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 4, {
			elementId: 'element-2',
			options: { useHistory: false },
		} );
	} );

	it( 'should handle elements without valid containers', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( null );

		// Act.
		const removeResult = removeElements( {
			elementIds: [ 'non-existent-element' ],
			title: 'Remove Elements',
		} );

		// Assert.
		expect( removeResult.elementIds ).toEqual( [ 'non-existent-element' ] );
		expect( removeResult.removedElements ).toHaveLength( 0 );
		expect( mockDeleteElement ).toHaveBeenCalledWith( {
			elementId: 'non-existent-element',
			options: { useHistory: false },
		} );
	} );

	it( 'should handle elements without parent containers on undo', () => {
		// Arrange.
		const mockElement = createMockContainer( 'element-1', [] );
		const mockElementToJSON = jest.spyOn( mockElement.model, 'toJSON' );
		mockElementToJSON.mockReturnValue( {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Button 1' },
		} as unknown as V1ElementModelProps );
		mockElement.parent = undefined;
		mockElement.view = { _index: 0 };

		mockGetContainer.mockReturnValue( mockElement );

		// Act.
		removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		// Act.
		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockCreateElement ).not.toHaveBeenCalled();
	} );

	it( 'should handle elements with missing view index', () => {
		// Arrange.
		const mockParent = createMockContainer( 'parent-1', [] );
		const mockElement = createMockContainer( 'element-1', [] );
		const mockElementToJSON = jest.spyOn( mockElement.model, 'toJSON' );
		mockElementToJSON.mockReturnValue( {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Button 1' },
		} as unknown as V1ElementModelProps );
		mockElement.parent = mockParent;
		mockElement.view = {};

		mockGetContainer.mockReturnValue( mockElement );

		// Act.
		const removeResult = removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		// Assert.
		expect( removeResult.removedElements[ 0 ].at ).toBe( 0 );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		setupMockElementsForRemoval();

		// Act.
		removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		// Assert.
		const historyItem = historyMock.instance.get();
		expect( historyItem?.subTitle ).toBe( 'Item removed' );
	} );

	it( 'should handle redo after multiple undo/redo cycles', () => {
		// Arrange.
		setupMockElementsForRemoval();

		const mockRestoredElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockRestoredElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement
			.mockReturnValueOnce( mockRestoredElement1 ) // First undo
			.mockReturnValueOnce( mockRestoredElement2 ) // First undo
			.mockReturnValueOnce( mockRestoredElement1 ) // Second undo
			.mockReturnValueOnce( mockRestoredElement2 ); // Second undo

		// Act.
		removeElements( {
			elementIds: [ 'element-1', 'element-2' ],
			title: 'Remove Elements',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		act( () => {
			historyMock.instance.redo();
		} );

		// Act - Second undo/redo cycle.
		act( () => {
			historyMock.instance.undo();
		} );
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 6 ); // Initial + 2 redos = 6 total calls
		expect( mockCreateElement ).toHaveBeenCalledTimes( 4 ); // 2 undos = 4 total calls

		// Verify the last redo calls delete with correct IDs.
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 5, {
			elementId: 'element-1',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 6, {
			elementId: 'element-2',
			options: { useHistory: false },
		} );
	} );

	it( 'should gracefully handle redo when elements no longer exist', () => {
		// Arrange.
		setupMockElementsForRemoval();

		// Act - Remove elements.
		removeElements( {
			elementIds: [ 'element-1', 'element-2' ],
			title: 'Remove Elements',
		} );

		// Simulate elements no longer existing during redo (e.g., undid past their creation).
		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return null; // Element 1 no longer exists
			}
			if ( id === 'element-2' ) {
				// Element 2 still exists
				const mockElement2 = createMockContainer( 'element-2', [] );
				mockElement2.parent = createMockContainer( 'parent-1', [] );
				mockElement2.view = { _index: 1 };
				return mockElement2;
			}
			return null;
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 4 ); // Initial 2 + redo 2
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 3, {
			elementId: 'element-1',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 4, {
			elementId: 'element-2',
			options: { useHistory: false },
		} );
	} );

	it( 'should handle redo with relational elements', () => {
		// Arrange.
		const mockParent = createMockContainer( 'parent-1', [] );

		const mockHeading = createMockContainer( 'heading-1', [] );
		const mockHeadingToJSON = jest.spyOn( mockHeading.model, 'toJSON' );
		mockHeadingToJSON.mockReturnValue( {
			id: 'heading-1',
			elType: 'widget',
			widgetType: 'e-heading',
			settings: { 'tab-pane': { value: 'button-1' } },
		} as unknown as V1ElementModelProps );
		mockHeading.parent = mockParent;
		mockHeading.view = { _index: 0 };

		const mockButton = createMockContainer( 'button-1', [] );
		const mockButtonToJSON = jest.spyOn( mockButton.model, 'toJSON' );
		mockButtonToJSON.mockReturnValue( {
			id: 'button-1',
			elType: 'widget',
			widgetType: 'e-button',
			settings: {},
		} as unknown as V1ElementModelProps );
		mockButton.parent = mockParent;
		mockButton.view = { _index: 1 };

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'heading-1' ) {
				return mockHeading;
			}
			if ( id === 'button-1' ) {
				return mockButton;
			}
			return null;
		} );

		// Act.
		removeElements( {
			elementIds: [ 'heading-1', 'button-1' ],
			title: 'Remove Tab',
		} );

		// Arrange.
		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'heading-1' ) {
				return mockHeading;
			} // Heading exists
			if ( id === 'button-1' ) {
				return null;
			} // Button no longer exists
			return null;
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 4 ); // Initial 2 + redo 2
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 3, {
			elementId: 'heading-1',
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 4, {
			elementId: 'button-1',
			options: { useHistory: false },
		} );
	} );
} );
