import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';
import { act } from '@testing-library/react';

import { moveElement } from '../move-element';
import { moveElements } from '../move-elements';

jest.mock( '../move-element' );

describe( 'moveElements', () => {
	const historyMock = mockHistoryManager();
	const mockMoveElement = jest.mocked( moveElement );

	beforeEach( () => {
		historyMock.beforeEach();
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

		return { mockElement1, mockElement2, mockParentA, mockParentB };
	};

	it( 'should move multiple elements and return their data', () => {
		// Arrange.
		const { mockElement1, mockElement2, mockParentB } = setupMockElementsForMove();

		const mockMovedElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockMovedElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockMoveElement.mockReturnValueOnce( mockMovedElement1 ).mockReturnValueOnce( mockMovedElement2 );

		// Act.
		const moveResult = moveElements( {
			moves: [
				{
					element: mockElement1,
					targetContainer: mockParentB,
					options: { at: 0 },
				},
				{
					element: mockElement2,
					targetContainer: mockParentB,
					options: { at: 1 },
				},
			],
			title: 'Move Elements',
			subtitle: 'Elements moved to new container',
		} );

		// Assert.
		expect( moveResult.movedElements ).toHaveLength( 2 );
		expect( moveResult.movedElements[ 0 ].element.id ).toBe( 'element-1' );
		expect( moveResult.movedElements[ 0 ].originalIndex ).toBe( 0 );
		expect( moveResult.movedElements[ 1 ].element.id ).toBe( 'element-2' );
		expect( moveResult.movedElements[ 1 ].originalIndex ).toBe( 1 );

		expect( mockMoveElement ).toHaveBeenCalledTimes( 2 );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 1, {
			element: mockElement1,
			targetContainer: mockParentB,
			options: { at: 0, useHistory: false },
		} );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 2, {
			element: mockElement2,
			targetContainer: mockParentB,
			options: { at: 1, useHistory: false },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Move Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements moved to new container' );
	} );

	it( 'should restore elements to original positions on undo and move them again on redo', () => {
		// Arrange.
		const { mockElement1, mockElement2, mockParentA, mockParentB } = setupMockElementsForMove();

		const mockMovedElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockMovedElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockMoveElement
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement2 );

		// Act
		moveElements( {
			moves: [
				{
					element: mockElement1,
					targetContainer: mockParentB,
					options: { at: 0 },
				},
				{
					element: mockElement2,
					targetContainer: mockParentB,
					options: { at: 1 },
				},
			],
			title: 'Move Elements',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 3, {
			element: mockMovedElement2,
			targetContainer: mockParentA,
			options: { useHistory: false, at: 1 },
		} );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 4, {
			element: mockMovedElement1,
			targetContainer: mockParentA,
			options: { useHistory: false, at: 0 },
		} );

		// Act.
		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenCalledTimes( 6 );
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 5, {
			element: mockMovedElement1,
			targetContainer: mockParentB,
			options: { at: 0, useHistory: false },
		} );

		expect( mockMoveElement ).toHaveBeenNthCalledWith( 6, {
			element: mockMovedElement2,
			targetContainer: mockParentB,
			options: { at: 1, useHistory: false },
		} );
	} );

	it( 'should handle single element move', () => {
		// Arrange.
		const { mockElement1, mockParentB } = setupMockElementsForMove();
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		const moveResult = moveElements( {
			moves: [
				{
					element: mockElement1,
					targetContainer: mockParentB,
				},
			],
			title: 'Move Element',
		} );

		// Assert.
		expect( moveResult.movedElements ).toHaveLength( 1 );
		expect( moveResult.movedElements[ 0 ].element.id ).toBe( 'element-1' );
		expect( moveResult.movedElements[ 0 ].originalIndex ).toBe( 0 );

		expect( mockMoveElement ).toHaveBeenCalledTimes( 1 );
		expect( mockMoveElement ).toHaveBeenCalledWith( {
			element: mockElement1,
			targetContainer: mockParentB,
			options: { useHistory: false },
		} );
	} );

	it( 'should throw error when element has no parent', () => {
		// Arrange.
		const mockElement = createMockContainer( 'element-1', [] );
		mockElement.parent = undefined;

		const mockTarget = createMockContainer( 'parent-b', [] );

		// Act & Assert.
		expect( () =>
			moveElements( {
				moves: [
					{
						element: mockElement,
						targetContainer: mockTarget,
					},
				],
				title: 'Move Element',
			} )
		).toThrow( 'Element has no parent container' );
	} );

	it( 'should use default subtitle when not provided', () => {
		// Arrange.
		const { mockElement1, mockParentB } = setupMockElementsForMove();
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		moveElements( {
			moves: [
				{
					element: mockElement1,
					targetContainer: mockParentB,
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
		const { mockElement1, mockParentB } = setupMockElementsForMove();
		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockMoveElement.mockReturnValue( mockMovedElement );

		// Act.
		moveElements( {
			moves: [
				{
					element: mockElement1,
					targetContainer: mockParentB,
					options: { at: 2, edit: true, useHistory: true },
				},
			],
			title: 'Move Element with Options',
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenCalledWith( {
			element: mockElement1,
			targetContainer: mockParentB,
			options: { at: 2, edit: true, useHistory: false },
		} );
	} );

	it( 'should handle undo when original index is -1', () => {
		// Arrange.
		const mockParentA = createMockContainer( 'parent-a', [] );
		const mockParentB = createMockContainer( 'parent-b', [] );

		const mockElement = createMockContainer( 'element-1', [] );
		mockElement.parent = mockParentA;
		// eslint-disable-next-line testing-library/no-node-access
		mockParentA.children = [];

		const mockMovedElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );

		mockMoveElement.mockReturnValueOnce( mockMovedElement ).mockReturnValueOnce( mockMovedElement );

		// Act.
		moveElements( {
			moves: [
				{
					element: mockElement,
					targetContainer: mockParentB,
				},
			],
			title: 'Move Element',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockMoveElement ).toHaveBeenNthCalledWith( 2, {
			element: mockMovedElement,
			targetContainer: mockParentA,
			options: { useHistory: false, at: undefined },
		} );
	} );

	it( 'should handle multiple undo/redo cycles correctly', () => {
		// Arrange.
		const { mockElement1, mockElement2, mockParentB } = setupMockElementsForMove();

		const mockMovedElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockMovedElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockMoveElement
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement2 )
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement1 )
			.mockReturnValueOnce( mockMovedElement2 );

		// Act.
		moveElements( {
			moves: [
				{
					element: mockElement1,
					targetContainer: mockParentB,
				},
				{
					element: mockElement2,
					targetContainer: mockParentB,
				},
			],
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
			element: mockMovedElement1,
			targetContainer: mockParentB,
			options: { useHistory: false },
		} );

		expect( mockMoveElement ).toHaveBeenNthCalledWith( 10, {
			element: mockMovedElement2,
			targetContainer: mockParentB,
			options: { useHistory: false },
		} );
	} );
} );
