import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';
import { act } from '@testing-library/react';

import { getContainer } from '../get-container';
import { moveElement, type MoveElementParams } from '../move-element';
import { moveElements } from '../move-elements';

jest.mock( '../get-container' );
jest.mock( '../move-element' );

describe( 'moveElements', () => {
	const historyMock = mockHistoryManager();
	const mockGetContainer = jest.mocked( getContainer );
	const mockMoveElement = jest.mocked( moveElement );

	beforeEach( () => {
		historyMock.beforeEach();
		mockGetContainer.mockClear();
		mockMoveElement.mockClear();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	const setupMockElementsForMove = () => {
		const mockParentA = createMockContainer( 'parent-a', [] );
		const mockParentB = createMockContainer( 'parent-b', [] );

		const mockElement1 = createMockContainer( 'element-1', [] );
		mockElement1.parent = mockParentA;

		const mockElement2 = createMockContainer( 'element-2', [] );
		mockElement2.parent = mockParentA;

		// eslint-disable-next-line testing-library/no-node-access
		mockParentA.children = [ mockElement1, mockElement2 ];

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return mockElement1;
			}
			if ( id === 'element-2' ) {
				return mockElement2;
			}
			if ( id === 'parent-a' ) {
				return mockParentA;
			}
			if ( id === 'parent-b' ) {
				return mockParentB;
			}
			return null;
		} );

		return { mockElement1, mockElement2, mockParentA, mockParentB };
	};

	it( 'should move multiple elements and return their data', () => {
		// Arrange.
		setupMockElementsForMove();

		const mockMovedElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockMovedElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockMoveElement.mockReturnValueOnce( mockMovedElement1 ).mockReturnValueOnce( mockMovedElement2 );

		const movesToMake: MoveElementParams[] = [
			{
				elementId: 'element-1',
				targetContainerId: 'parent-b',
				options: { at: 0 },
			},
			{
				elementId: 'element-2',
				targetContainerId: 'parent-b',
				options: { at: 1 },
			},
		];

		// Act.
		const moveResult = moveElements( {
			moves: movesToMake,
			title: 'Move Elements',
			subtitle: 'Elements moved to new container',
		} );

		// Assert.
		expect( moveResult.movedElements ).toHaveLength( 2 );
		expect( moveResult.movedElements[ 0 ].elementId ).toBe( 'element-1' );
		expect( moveResult.movedElements[ 0 ].originalPosition ).toEqual( {
			elementId: 'element-1',
			originalContainerId: 'parent-a',
			originalIndex: 0,
		} );
		expect( moveResult.movedElements[ 0 ].moveParams ).toEqual( movesToMake[ 0 ] );
		expect( moveResult.movedElements[ 0 ].element ).toBe( mockMovedElement1 );

		expect( moveResult.movedElements[ 1 ].elementId ).toBe( 'element-2' );
		expect( moveResult.movedElements[ 1 ].originalPosition ).toEqual( {
			elementId: 'element-2',
			originalContainerId: 'parent-a',
			originalIndex: 1,
		} );

		expect( mockMoveElement ).toHaveBeenCalledTimes( 2 );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 1, {
			elementId: 'element-1',
			targetContainerId: 'parent-b',
			options: { at: 0, useHistory: false },
		} );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 2, {
			elementId: 'element-2',
			targetContainerId: 'parent-b',
			options: { at: 1, useHistory: false },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Move Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements moved to new container' );
	} );

	it( 'should restore elements to original positions on undo and move them again on redo', () => {
		// Arrange.
		setupMockElementsForMove();

		const mockMovedElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockMovedElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockMoveElement
			.mockReturnValueOnce( mockMovedElement1 ) // Initial move - element 1
			.mockReturnValueOnce( mockMovedElement2 ) // Initial move - element 2
			.mockReturnValueOnce( mockMovedElement2 ) // Undo - element 2 (reverse order)
			.mockReturnValueOnce( mockMovedElement1 ) // Undo - element 1
			.mockReturnValueOnce( mockMovedElement1 ) // Redo - element 1
			.mockReturnValueOnce( mockMovedElement2 ); // Redo - element 2

		const movesToMake: MoveElementParams[] = [
			{
				elementId: 'element-1',
				targetContainerId: 'parent-b',
				options: { at: 0 },
			},
			{
				elementId: 'element-2',
				targetContainerId: 'parent-b',
				options: { at: 1 },
			},
		];

		// Act
		moveElements( {
			moves: movesToMake,
			title: 'Move Elements',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 3, {
			elementId: 'element-2',
			targetContainerId: 'parent-a',
			options: { useHistory: false, at: 1 },
		} );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 4, {
			elementId: 'element-1',
			targetContainerId: 'parent-a',
			options: { useHistory: false, at: 0 },
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenCalledTimes( 6 );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 5, {
			elementId: 'element-1',
			targetContainerId: 'parent-b',
			options: { at: 0, useHistory: false },
		} );

		expect( mockMoveElement ).toHaveBeenNthCalledWith( 6, {
			elementId: 'element-2',
			targetContainerId: 'parent-b',
			options: { at: 1, useHistory: false },
		} );
	} );

	it( 'should handle single element move', () => {
		// Arrange.
		setupMockElementsForMove();
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		const moveResult = moveElements( {
			moves: [
				{
					elementId: 'element-1',
					targetContainerId: 'parent-b',
				},
			],
			title: 'Move Element',
		} );

		// Assert.
		expect( moveResult.movedElements ).toHaveLength( 1 );
		expect( moveResult.movedElements[ 0 ].elementId ).toBe( 'element-1' );
		expect( moveResult.movedElements[ 0 ].originalPosition.originalContainerId ).toBe( 'parent-a' );
		expect( moveResult.movedElements[ 0 ].originalPosition.originalIndex ).toBe( 0 );

		expect( mockMoveElement ).toHaveBeenCalledTimes( 1 );
		expect( mockMoveElement ).toHaveBeenCalledWith( {
			elementId: 'element-1',
			targetContainerId: 'parent-b',
			options: { useHistory: false },
		} );
	} );

	it( 'should throw error when element is not found', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( null );

		// Act & Assert.
		expect( () =>
			moveElements( {
				moves: [
					{
						elementId: 'non-existent-element',
						targetContainerId: 'parent-b',
					},
				],
				title: 'Move Element',
			} )
		).toThrow( 'Element with ID "non-existent-element" not found' );
	} );

	it( 'should handle element without parent', () => {
		// Arrange.
		const mockElement = createMockContainer( 'element-1', [] );
		mockElement.parent = undefined; // No parent
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return mockElement;
			}
			if ( id === 'parent-b' ) {
				return createMockContainer( 'parent-b', [] );
			}
			return null;
		} );

		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		const moveResult = moveElements( {
			moves: [
				{
					elementId: 'element-1',
					targetContainerId: 'parent-b',
				},
			],
			title: 'Move Element',
		} );

		// Assert.
		expect( moveResult.movedElements[ 0 ].originalPosition ).toEqual( {
			elementId: 'element-1',
			originalContainerId: '',
			originalIndex: -1,
		} );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		setupMockElementsForMove();
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		moveElements( {
			moves: [
				{
					elementId: 'element-1',
					targetContainerId: 'parent-b',
				},
			],
			title: 'Move Element',
		} );

		// Assert.
		const historyItem = historyMock.instance.get();
		expect( historyItem?.subTitle ).toBe( 'Elements moved' );
	} );

	it( 'should handle moves with custom options', () => {
		// Arrange.
		setupMockElementsForMove();
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		moveElements( {
			moves: [
				{
					elementId: 'element-1',
					targetContainerId: 'parent-b',
					options: { at: 2, edit: true, useHistory: true },
				},
			],
			title: 'Move Element with Options',
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenCalledWith( {
			elementId: 'element-1',
			targetContainerId: 'parent-b',
			options: { at: 2, edit: true, useHistory: false }, // useHistory should be forced to false
		} );
	} );

	it( 'should handle undo when original index is -1', () => {
		// Arrange.
		const mockElement = createMockContainer( 'element-1', [] );
		const mockParent = createMockContainer( 'parent-a', [] );
		mockElement.parent = mockParent;
		// eslint-disable-next-line testing-library/no-node-access
		mockElement.parent.children = []; // Empty children array, so indexOf will return -1

		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return mockElement;
			}
			if ( id === 'parent-b' ) {
				return createMockContainer( 'parent-b', [] );
			}
			return null;
		} );

		mockMoveElement.mockReturnValueOnce( mockMovedElement ).mockReturnValueOnce( mockMovedElement );

		// Act.
		moveElements( {
			moves: [
				{
					elementId: 'element-1',
					targetContainerId: 'parent-b',
				},
			],
			title: 'Move Element',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 2, {
			elementId: 'element-1',
			targetContainerId: 'parent-a',
			options: { useHistory: false, at: undefined }, // at should be undefined when originalIndex is -1
		} );
	} );

	it( 'should handle multiple undo/redo cycles correctly', () => {
		// Arrange.
		setupMockElementsForMove();

		const mockMovedElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockMovedElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockMoveElement
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement2 ) // First undo
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement1 ) // First redo
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement2 ) // Second undo
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement1 ) // Second redo
			.mockReturnValueOnce( mockMovedElement2 );

		const movesToMake: MoveElementParams[] = [
			{
				elementId: 'element-1',
				targetContainerId: 'parent-b',
			},
			{
				elementId: 'element-2',
				targetContainerId: 'parent-b',
			},
		];

		// Act.
		moveElements( {
			moves: movesToMake,
			title: 'Move Elements',
		} );

		act( () => {
			historyMock.instance.undo();
			historyMock.instance.redo();
			historyMock.instance.undo();
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenCalledTimes( 10 );

		expect( mockMoveElement ).toHaveBeenNthCalledWith( 9, {
			elementId: 'element-1',
			targetContainerId: 'parent-b',
			options: { useHistory: false },
		} );

		expect( mockMoveElement ).toHaveBeenNthCalledWith( 10, {
			elementId: 'element-2',
			targetContainerId: 'parent-b',
			options: { useHistory: false },
		} );
	} );
} );
