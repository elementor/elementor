import { createMockChild, createMockContainer, mockHistoryManager } from 'test-utils';
import { act, renderHook } from '@testing-library/react';

import { createElement } from '../../sync/create-element';
import { deleteElement } from '../../sync/delete-element';
import { getContainer } from '../../sync/get-container';
import { type V1ElementModelProps } from '../../sync/types';
import { useNestedElements } from '../use-nested-elements';

jest.mock( '../../sync/create-element' );
jest.mock( '../../sync/delete-element' );
jest.mock( '../../sync/get-container' );

describe( 'useNestedElements', () => {
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

	describe( 'createElements', () => {
		it( 'should create multiple elements and return their IDs', () => {
			// Arrange.
			const mockElement1 = createMockChild( 'element-1', 'button' );
			const mockElement2 = createMockChild( 'element-2', 'text' );

			// Add model.toJSON() method to mock elements using spies
			const mockElement1ToJSON = jest.spyOn( mockElement1.model || { toJSON: jest.fn() }, 'toJSON' );
			mockElement1ToJSON.mockReturnValue( { id: 'element-1', elType: 'widget', widgetType: 'button' } );

			const mockElement2ToJSON = jest.spyOn( mockElement2.model || { toJSON: jest.fn() }, 'toJSON' );
			mockElement2ToJSON.mockReturnValue( { id: 'element-2', elType: 'widget', widgetType: 'text' } );

			mockCreateElement.mockReturnValueOnce( mockElement1 ).mockReturnValueOnce( mockElement2 );

			const { result } = renderHook( () => useNestedElements() );

			const elementsToCreate = [
				{
					containerId: 'parent-1',
					type: 'button',
					settings: { text: 'Click me' },
				},
				{
					containerId: 'parent-1',
					type: 'text',
					settings: { content: 'Hello world' },
					options: { useHistory: true },
				},
			];

			// Act.
			const createResult = result.current.create( {
				elements: elementsToCreate,
				title: 'Add Elements',
				subtitle: 'Elements added',
			} );

			// Assert.
			expect( createResult.elementIds ).toEqual( [ 'element-1', 'element-2' ] );
			expect( createResult.elementsData ).toHaveLength( 2 );
			expect( createResult.elementsData[ 0 ].elementId ).toBe( 'element-1' );
			expect( createResult.elementsData[ 1 ].elementId ).toBe( 'element-2' );
			expect( mockCreateElement ).toHaveBeenCalledTimes( 2 );
			expect( mockCreateElement ).toHaveBeenNthCalledWith( 1, {
				containerId: 'parent-1',
				type: 'button',
				settings: { text: 'Click me' },
				options: { useHistory: false },
			} );
			expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
				containerId: 'parent-1',
				type: 'text',
				settings: { content: 'Hello world' },
				options: { useHistory: false }, // useHistory should always be false for nested elements.
			} );

			const historyItem = historyMock.instance.get();
			expect( historyItem?.title ).toBe( 'Add Elements' );
			expect( historyItem?.subTitle ).toBe( 'Elements added' );
		} );

		it( 'should delete created elements on undo and recreate them on redo', () => {
			// Arrange.
			const mockElement1 = createMockChild( 'element-1', 'button' );
			const mockElement2 = createMockChild( 'element-2', 'text' );

			mockCreateElement
				.mockReturnValueOnce( mockElement1 ) // Initial creation - element 1
				.mockReturnValueOnce( mockElement2 ) // Initial creation - element 2
				.mockReturnValueOnce( mockElement1 ) // Redo - element 1
				.mockReturnValueOnce( mockElement2 ); // Redo - element 2

			const { result } = renderHook( () => useNestedElements() );

			const elementsToCreate = [
				{
					containerId: 'parent-1',
					type: 'button',
					settings: { text: 'Click me' },
				},
				{
					containerId: 'parent-1',
					type: 'text',
					settings: { content: 'Hello world' },
				},
			];

			// Act.
			result.current.create( {
				elements: elementsToCreate,
				title: 'Add Elements',
			} );

			// Act.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert.
			expect( mockDeleteElement ).toHaveBeenCalledTimes( 2 );
			expect( mockDeleteElement ).toHaveBeenNthCalledWith( 1, {
				elementId: 'element-2',
				options: { useHistory: false },
			} );
			expect( mockDeleteElement ).toHaveBeenNthCalledWith( 2, {
				elementId: 'element-1',
				options: { useHistory: false },
			} );

			// Act.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert.
			expect( mockCreateElement ).toHaveBeenCalledTimes( 4 );
			expect( mockCreateElement ).toHaveBeenNthCalledWith( 3, {
				containerId: 'parent-1',
				type: 'button',
				settings: { text: 'Click me' },
				id: 'element-1',
				options: { useHistory: false },
			} );
			expect( mockCreateElement ).toHaveBeenNthCalledWith( 4, {
				containerId: 'parent-1',
				type: 'text',
				settings: { content: 'Hello world' },
				id: 'element-2',
				options: { useHistory: false },
			} );
		} );

		it( 'should use default subtitle when not provided', () => {
			// Arrange.
			const mockElement = createMockChild( 'element-1', 'button' );
			mockCreateElement.mockReturnValue( mockElement );

			const { result } = renderHook( () => useNestedElements() );

			// Act.
			result.current.create( {
				elements: [
					{
						containerId: 'parent-1',
						type: 'button',
						settings: {},
					},
				],
				title: 'Add Element',
			} );

			// Assert.
			const historyItem = historyMock.instance.get();
			expect( historyItem?.subTitle ).toBe( 'Item added' );
		} );
	} );

	describe( 'removeElements', () => {
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
			const { result } = renderHook( () => useNestedElements() );

			// Act.
			const removeResult = result.current.remove( {
				elementIds: [ 'element-1', 'element-2' ],
				title: 'Remove Elements',
				subtitle: 'Elements removed',
			} );

			// Assert.
			expect( removeResult.elementIds ).toEqual( [ 'element-1', 'element-2' ] );
			expect( removeResult.elementsData ).toHaveLength( 2 );

			// Check collected data.
			expect( removeResult.elementsData[ 0 ] ).toEqual( {
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

			expect( removeResult.elementsData[ 1 ] ).toEqual( {
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

			const mockRestoredElement1 = createMockChild( 'element-1', 'button' );
			const mockRestoredElement2 = createMockChild( 'element-2', 'text' );

			mockCreateElement.mockReturnValueOnce( mockRestoredElement1 ).mockReturnValueOnce( mockRestoredElement2 );

			const { result } = renderHook( () => useNestedElements() );

			// Act.
			result.current.remove( {
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
				settings: { content: 'Text content' },
				type: 'text',
				id: 'element-2',
				options: { useHistory: false, at: 1 },
			} );
			expect( mockCreateElement ).toHaveBeenNthCalledWith( 2, {
				containerId: 'parent-1',
				settings: { text: 'Button 1' },
				type: 'button',
				id: 'element-1',
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
			const { result } = renderHook( () => useNestedElements() );

			// Act.
			const removeResult = result.current.remove( {
				elementIds: [ 'non-existent-element' ],
				title: 'Remove Elements',
			} );

			// Assert.
			expect( removeResult.elementIds ).toEqual( [ 'non-existent-element' ] );
			expect( removeResult.elementsData ).toHaveLength( 0 );
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
			const { result } = renderHook( () => useNestedElements() );

			// Act.
			result.current.remove( {
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
			const { result } = renderHook( () => useNestedElements() );

			// Act.
			const removeResult = result.current.remove( {
				elementIds: [ 'element-1' ],
				title: 'Remove Element',
			} );

			// Assert.
			expect( removeResult.elementsData[ 0 ].at ).toBe( 0 );
		} );

		it( 'should use default subtitle when not provided', () => {
			// Arrange.
			setupMockElementsForRemoval();
			const { result } = renderHook( () => useNestedElements() );

			// Act.
			result.current.remove( {
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

			const mockRestoredElement1 = createMockChild( 'element-1', 'button' );
			const mockRestoredElement2 = createMockChild( 'element-2', 'text' );

			mockCreateElement
				.mockReturnValueOnce( mockRestoredElement1 ) // First undo
				.mockReturnValueOnce( mockRestoredElement2 ) // First undo
				.mockReturnValueOnce( mockRestoredElement1 ) // Second undo
				.mockReturnValueOnce( mockRestoredElement2 ); // Second undo

			const { result } = renderHook( () => useNestedElements() );

			// Act.
			result.current.remove( {
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
			const { result } = renderHook( () => useNestedElements() );

			// Act - Remove elements.
			result.current.remove( {
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
	} );

	it( 'should return stable functions that do not change between renders', () => {
		// Arrange.
		const { result, rerender } = renderHook( () => useNestedElements() );
		const firstResult = result.current;

		// Act.
		rerender();

		// Assert.
		expect( result.current ).toBe( firstResult );
		expect( result.current.create ).toBe( firstResult.create );
		expect( result.current.remove ).toBe( firstResult.remove );
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

		const { result } = renderHook( () => useNestedElements() );

		// Act.
		result.current.remove( {
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
