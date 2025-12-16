import { useBoundProp } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
	type V1Element,
} from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';
import { renderHook } from '@testing-library/react';

import { useActions } from '../use-actions';

jest.mock( '@elementor/editor-controls' );
jest.mock( '@elementor/editor-elements' );

describe( 'tabs-control actions', () => {
	const mockSetValue = jest.fn();
	const mockRestoreValue = jest.fn();
	const mockResetValue = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const setupBoundProp = ( defaultActiveTab: number ) => {
		jest.mocked( useBoundProp ).mockReturnValue( {
			value: defaultActiveTab,
			setValue: mockSetValue,
			bind: 'bind',
			propType: {} as PropType,
			path: [],
			restoreValue: mockRestoreValue,
			resetValue: mockResetValue,
		} );
	};

	describe( 'moveItem - getNewDefaultActiveTab logic', () => {
		const TABS_MENU_ID = 'tabs-menu-123';
		const TAB_CONTENT_AREA_ID = 'tab-content-area-123';
		const MOVED_ELEMENT_ID = 'moved-element-456';

		beforeEach( () => {
			jest.mocked( getContainer ).mockReturnValue( {
				children: [
					{ id: 'content-0' },
					{ id: 'content-1' },
					{ id: 'content-2' },
					{ id: 'content-3' },
					{ id: 'content-4' },
				],
			} as unknown as V1Element );
		} );

		describe( 'move logic', () => {
			it( 'should update to new position (from 2 to 0)', () => {
				// Arrange
				setupBoundProp( 2 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 0,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 2,
				} );

				const onMoveElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onMoveElements;
				onMoveElements?.();

				// Assert
				expect( mockSetValue ).toHaveBeenCalledWith( 0, {}, { withHistory: false } );
			} );

			it( 'should decrement active tab (from 0 to 3, active at 2)', () => {
				// Arrange
				setupBoundProp( 2 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 3,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 0,
				} );

				const onMoveElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onMoveElements;
				onMoveElements?.();

				// Assert
				expect( mockSetValue ).toHaveBeenCalledWith( 1, {}, { withHistory: false } );
			} );

			it( 'should increment active tab (from 3 to 0, active at 1)', () => {
				// Arrange
				setupBoundProp( 1 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 0,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 3,
				} );

				const onMoveElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onMoveElements;
				onMoveElements?.();

				// Assert
				expect( mockSetValue ).toHaveBeenCalledWith( 2, {}, { withHistory: false } );
			} );

			it( 'should not update (moving after active tab)', () => {
				// Arrange
				setupBoundProp( 1 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 4,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 3,
				} );

				const onMoveElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onMoveElements;
				onMoveElements?.();

				// Assert
				expect( mockSetValue ).not.toHaveBeenCalled();
			} );

			it( 'should decrement active tab when moving from top to active position (from 0 to 2, active at 2)', () => {
				// Arrange
				setupBoundProp( 2 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 2,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 0,
				} );

				const onMoveElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onMoveElements;
				onMoveElements?.();

				// Assert
				expect( mockSetValue ).toHaveBeenCalledWith( 1, {}, { withHistory: false } );
			} );

			it( 'should increment active tab when moving from bottom to active position (from 4 to 2, active at 2)', () => {
				// Arrange
				setupBoundProp( 2 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 2,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 4,
				} );

				const onMoveElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onMoveElements;
				onMoveElements?.();

				// Assert
				expect( mockSetValue ).toHaveBeenCalledWith( 3, {}, { withHistory: false } );
			} );

			it( 'should restore original value on undo', () => {
				// Arrange
				setupBoundProp( 2 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 0,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 2,
				} );

				const onRestoreElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onRestoreElements;
				onRestoreElements?.();

				// Assert
				expect( mockSetValue ).toHaveBeenCalledWith( 2, {}, { withHistory: false } );
			} );

			it( 'should not restore when no change occurred', () => {
				// Arrange
				setupBoundProp( 0 );
				const { result } = renderHook( () => useActions() );

				// Act
				result.current.moveItem( {
					toIndex: 4,
					tabsMenuId: TABS_MENU_ID,
					tabContentAreaId: TAB_CONTENT_AREA_ID,
					movedElementId: MOVED_ELEMENT_ID,
					movedElementIndex: 3,
				} );

				mockSetValue.mockClear();

				const onRestoreElements = jest.mocked( moveElements ).mock.calls[ 0 ][ 0 ].onRestoreElements;
				onRestoreElements?.();

				// Assert
				expect( mockSetValue ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'removeItem logic', () => {
		const TAB_CONTENT_AREA_ID = 'tab-content-area-123';

		beforeEach( () => {
			jest.mocked( getContainer ).mockReturnValue( {
				children: [ { id: 'content-0' }, { id: 'content-1' }, { id: 'content-2' }, { id: 'content-3' } ],
			} as unknown as V1Element );
		} );

		it( 'should reset to 0 when removing the active tab', () => {
			// Arrange
			setupBoundProp( 2 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.removeItem( {
				items: [ { item: { id: 'tab-2' }, index: 2 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onRemoveElements = jest.mocked( removeElements ).mock.calls[ 0 ][ 0 ].onRemoveElements;
			onRemoveElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 0, {}, { withHistory: false } );
		} );

		it( 'should decrement when removing a tab before active', () => {
			// Arrange
			setupBoundProp( 2 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.removeItem( {
				items: [ { item: { id: 'tab-0' }, index: 0 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onRemoveElements = jest.mocked( removeElements ).mock.calls[ 0 ][ 0 ].onRemoveElements;
			onRemoveElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 1, {}, { withHistory: false } );
		} );

		it( 'should decrement by count of tabs removed before active', () => {
			// Arrange
			setupBoundProp( 3 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.removeItem( {
				items: [
					{ item: { id: 'tab-0' }, index: 0 },
					{ item: { id: 'tab-1' }, index: 1 },
				],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onRemoveElements = jest.mocked( removeElements ).mock.calls[ 0 ][ 0 ].onRemoveElements;
			onRemoveElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 1, {}, { withHistory: false } );
		} );

		it( 'should not update when removing tabs after active', () => {
			// Arrange
			setupBoundProp( 1 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.removeItem( {
				items: [ { item: { id: 'tab-3' }, index: 3 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onRemoveElements = jest.mocked( removeElements ).mock.calls[ 0 ][ 0 ].onRemoveElements;
			onRemoveElements?.();

			// Assert
			expect( mockSetValue ).not.toHaveBeenCalled();
		} );

		it( 'should restore original value on undo', () => {
			// Arrange
			setupBoundProp( 2 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.removeItem( {
				items: [ { item: { id: 'tab-0' }, index: 0 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onRemoveElements = jest.mocked( removeElements ).mock.calls[ 0 ][ 0 ].onRemoveElements;
			onRemoveElements?.();

			const onRestoreElements = jest.mocked( removeElements ).mock.calls[ 0 ][ 0 ].onRestoreElements;
			onRestoreElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 2, {}, { withHistory: false } );
		} );
	} );

	describe( 'duplicateItem', () => {
		const TAB_CONTENT_AREA_ID = 'tab-content-area-123';

		beforeEach( () => {
			jest.mocked( getContainer ).mockReturnValue( {
				children: [ { id: 'content-0' }, { id: 'content-1' }, { id: 'content-2' }, { id: 'content-3' } ],
			} as unknown as V1Element );
		} );

		it( 'should duplicate both tab and content', () => {
			// Arrange
			setupBoundProp( 0 );

			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [ { item: { id: 'tab-1' }, index: 1 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			// Assert
			expect( duplicateElements ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elementIds: [ 'tab-1', 'content-1' ],
				} )
			);
		} );

		it( 'should increment active tab when duplicating before active', () => {
			// Arrange
			setupBoundProp( 2 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [ { item: { id: 'tab-0' }, index: 0 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onDuplicateElements = jest.mocked( duplicateElements ).mock.calls[ 0 ][ 0 ].onDuplicateElements;
			onDuplicateElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 3, {}, { withHistory: false } );
		} );

		it( 'should increment active tab by count of duplicates before active', () => {
			// Arrange
			setupBoundProp( 3 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [
					{ item: { id: 'tab-0' }, index: 0 },
					{ item: { id: 'tab-1' }, index: 1 },
				],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onDuplicateElements = jest.mocked( duplicateElements ).mock.calls[ 0 ][ 0 ].onDuplicateElements;
			onDuplicateElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 5, {}, { withHistory: false } );
		} );

		it( 'should not update when duplicating after active tab', () => {
			// Arrange
			setupBoundProp( 1 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [ { item: { id: 'tab-3' }, index: 3 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onDuplicateElements = jest.mocked( duplicateElements ).mock.calls[ 0 ][ 0 ].onDuplicateElements;
			onDuplicateElements?.();

			// Assert
			expect( mockSetValue ).not.toHaveBeenCalled();
		} );

		it( 'should increment when duplicating the active tab itself', () => {
			// Arrange
			setupBoundProp( 2 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [ { item: { id: 'tab-2' }, index: 2 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onDuplicateElements = jest.mocked( duplicateElements ).mock.calls[ 0 ][ 0 ].onDuplicateElements;
			onDuplicateElements?.();

			// Assert
			expect( mockSetValue ).not.toHaveBeenCalled();
		} );

		it( 'should restore original value on undo', () => {
			// Arrange
			setupBoundProp( 2 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [ { item: { id: 'tab-0' }, index: 0 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			const onRestoreElements = jest.mocked( duplicateElements ).mock.calls[ 0 ][ 0 ].onRestoreElements;
			onRestoreElements?.();

			// Assert
			expect( mockSetValue ).toHaveBeenCalledWith( 2, {}, { withHistory: false } );
		} );

		it( 'should not restore when no change occurred', () => {
			// Arrange
			setupBoundProp( 0 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.duplicateItem( {
				items: [ { item: { id: 'tab-3' }, index: 3 } ],
				tabContentAreaId: TAB_CONTENT_AREA_ID,
			} );

			mockSetValue.mockClear();

			const onRestoreElements = jest.mocked( duplicateElements ).mock.calls[ 0 ][ 0 ].onRestoreElements;
			onRestoreElements?.();

			// Assert
			expect( mockSetValue ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when content ID not found', () => {
			// Arrange
			setupBoundProp( 0 );
			jest.mocked( getContainer ).mockReturnValue( {
				children: [],
			} as unknown as V1Element );

			const { result } = renderHook( () => useActions() );

			// Act & Assert
			expect( () => {
				result.current.duplicateItem( {
					items: [ { item: { id: 'tab-1' }, index: 1 } ],
					tabContentAreaId: TAB_CONTENT_AREA_ID,
				} );
			} ).toThrow( 'Original content ID is required for duplication' );
		} );
	} );

	describe( 'addItem', () => {
		it( 'should create both tab and content elements', () => {
			// Arrange
			setupBoundProp( 0 );
			const { result } = renderHook( () => useActions() );

			// Act
			result.current.addItem( {
				tabContentAreaId: 'tab-content-area-123',
				tabsMenuId: 'tabs-menu-123',
				items: [ { item: { id: 'new-tab' }, index: 2 } ],
			} );

			// Assert
			expect( createElements ).toHaveBeenCalledWith(
				expect.objectContaining( {
					elements: expect.arrayContaining( [
						expect.objectContaining( {
							containerId: 'tab-content-area-123',
							model: expect.objectContaining( {
								elType: 'e-tab-content',
							} ),
						} ),
						expect.objectContaining( {
							containerId: 'tabs-menu-123',
							model: expect.objectContaining( {
								elType: 'e-tab',
							} ),
						} ),
					] ),
				} )
			);
		} );
	} );
} );
