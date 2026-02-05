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
		expect( removeResult.removedElements ).toHaveLength( 2 );

		expect( removeResult.removedElements[ 0 ].container ).toBe( mockElement1 );
		expect( removeResult.removedElements[ 0 ].model ).toEqual( {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'button',
			settings: { text: 'Button 1' },
		} );
		expect( removeResult.removedElements[ 0 ].at ).toBe( 0 );

		expect( removeResult.removedElements[ 1 ].container ).toBe( mockElement2 );
		expect( removeResult.removedElements[ 1 ].at ).toBe( 1 );

		expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 1, {
			container: mockElement1,
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
			container: mockElement2,
			options: { useHistory: false },
		} );

		const historyItem = historyMock.instance.get();
		expect( historyItem?.title ).toBe( 'Remove Elements' );
		expect( historyItem?.subTitle ).toBe( 'Elements removed' );
	} );

	it( 'should restore deleted elements on undo and delete them again on redo', () => {
		// Arrange.
		const { mockElement1, mockElement2, mockParent } = setupMockElementsForRemoval();

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
			container: mockParent,
			model: {
				id: 'element-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Text content' },
			},
			options: { useHistory: false, at: 1 },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
			container: mockParent,
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
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 4 );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 3, {
			container: mockElement1,
			options: { useHistory: false },
		} );
		expect( mockDeleteElement ).toHaveBeenNthCalledWith( 4, {
			container: mockElement2,
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
		expect( removeResult.removedElements ).toHaveLength( 0 );
		expect( mockDeleteElement ).not.toHaveBeenCalled();
	} );

	it( 'should handle elements without parent containers', () => {
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
		const removeResult = removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		// Assert.
		expect( removeResult.removedElements ).toHaveLength( 0 );
		expect( mockDeleteElement ).not.toHaveBeenCalled();
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

	it( 'should handle multiple undo/redo cycles correctly', () => {
		// Arrange.
		const { mockParent } = setupMockElementsForRemoval();

		const mockRestoredElement1 = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		const mockRestoredElement2 = createMockChild( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

		mockCreateElement
			.mockReturnValueOnce( mockRestoredElement2 )
			.mockReturnValueOnce( mockRestoredElement1 )
			.mockReturnValueOnce( mockRestoredElement2 )
			.mockReturnValueOnce( mockRestoredElement1 );

		// Act.
		removeElements( {
			elementIds: [ 'element-1', 'element-2' ],
			title: 'Remove Elements',
		} );

		act( () => {
			historyMock.instance.undo();
			historyMock.instance.redo();
			historyMock.instance.undo();
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 6 );
		expect( mockCreateElement ).toHaveBeenCalledTimes( 4 );

		expect( mockCreateElement ).toHaveBeenNthCalledWith( 3, {
			container: mockParent,
			model: {
				id: 'element-2',
				elType: 'widget',
				widgetType: 'text',
				settings: { content: 'Text content' },
			},
			options: { useHistory: false, at: 1 },
		} );
		expect( mockCreateElement ).toHaveBeenNthCalledWith( 4, {
			container: mockParent,
			model: {
				id: 'element-1',
				elType: 'widget',
				widgetType: 'button',
				settings: { text: 'Button 1' },
			},
			options: { useHistory: false, at: 0 },
		} );
	} );

	it( 'should skip undo when parent container lookup returns null', () => {
		// Arrange.
		const { mockParent } = setupMockElementsForRemoval();

		mockParent.lookup = jest.fn().mockReturnValue( null );

		const mockRestoredElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockCreateElement.mockReturnValue( mockRestoredElement );

		// Act.
		removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 1 );
		expect( mockCreateElement ).not.toHaveBeenCalled();
	} );

	it( 'should skip redo when container lookup returns null', () => {
		// Arrange.
		const { mockElement1 } = setupMockElementsForRemoval();

		const mockRestoredElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockCreateElement.mockReturnValue( mockRestoredElement );

		// Act.
		removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		mockElement1.lookup = jest.fn().mockReturnValue( null );

		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 1 );
		expect( mockCreateElement ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should skip redo when parent lookup returns null', () => {
		// Arrange.
		const { mockParent } = setupMockElementsForRemoval();

		const mockRestoredElement = createMockChild( { id: 'element-1', elType: 'widget', widgetType: 'button' } );
		mockCreateElement.mockReturnValue( mockRestoredElement );

		// Act.
		removeElements( {
			elementIds: [ 'element-1' ],
			title: 'Remove Element',
		} );

		act( () => {
			historyMock.instance.undo();
		} );

		mockParent.lookup = jest.fn().mockReturnValue( null );

		act( () => {
			historyMock.instance.redo();
		} );

		// Assert.
		expect( mockDeleteElement ).toHaveBeenCalledTimes( 1 );
		expect( mockCreateElement ).toHaveBeenCalledTimes( 1 );
	} );
} );
