import { mockHistoryManager } from 'test-utils';
import { getContainer, getElementSettings, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { HISTORY_DEBOUNCE_WAIT } from '../../../../hooks/use-styles-fields';
import { cascadeShowMarkersToItems, useShowMarkersWriteThrough } from '../use-show-markers-write-through';

jest.mock( '@elementor/editor-elements' );

describe( 'useShowMarkersWriteThrough / cascadeShowMarkersToItems', () => {
	const LIST_ID = 'list-1';

	const listItemContainer = ( id: string ): V1Element =>
		( {
			id,
			model: { get: ( key: string ) => ( key === 'elType' ? 'e-list-item' : undefined ) },
		} ) as unknown as V1Element;

	const listContainer = ( itemIds: string[] ): V1Element =>
		( {
			id: LIST_ID,
			model: { get: ( key: string ) => ( key === 'elType' ? 'e-list' : undefined ) },
			children: itemIds.map( listItemContainer ),
		} ) as unknown as V1Element;

	const historyMock = mockHistoryManager();

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		historyMock.beforeEach();

		jest.mocked( getContainer ).mockImplementation( ( id: string ) =>
			id === LIST_ID ? listContainer( [ 'item-1', 'item-2' ] ) : null
		);

		jest.mocked( getElementSettings ).mockImplementation( ( elementId: string ) => ( {
			show_markers: { $$type: 'boolean', value: elementId === 'item-1' },
		} ) );
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.useRealTimers();
	} );

	describe( 'cascadeShowMarkersToItems', () => {
		it( 'updates every list item under the list in one call', () => {
			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-1',
				props: { show_markers: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-2',
				props: { show_markers: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
		} );

		it( 'restores every list item to its previous value with a single undo', () => {
			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT );
			jest.mocked( updateElementSettings ).mockClear();

			historyMock.instance.undo();

			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-1',
				props: { show_markers: { $$type: 'boolean', value: true } },
				withHistory: false,
			} );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-2',
				props: { show_markers: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
		} );

		it( 'restores an item to null on undo when its show_markers was unset beforehand', () => {
			jest.mocked( getElementSettings ).mockImplementation( ( elementId: string ) => ( {
				show_markers: elementId === 'item-1' ? null : { $$type: 'boolean', value: false },
			} ) );

			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT );
			jest.mocked( updateElementSettings ).mockClear();

			historyMock.instance.undo();

			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-1',
				props: { show_markers: null },
				withHistory: false,
			} );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-2',
				props: { show_markers: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
		} );

		it( 'does nothing when the list has no items', () => {
			jest.mocked( getContainer ).mockReturnValue( listContainer( [] ) );

			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'cascadeShowMarkersToItems history debounce timing', () => {
		it( 'does not push a history entry synchronously', () => {
			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

			expect( updateElementSettings ).toHaveBeenCalled();
			expect( historyMock.instance.get() ).toBeNull();
		} );

		it( 'still has not pushed a history entry just before the debounce window elapses', () => {
			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );
			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT - 1 );

			expect( historyMock.instance.get() ).toBeNull();
		} );

		it( 'pushes the history entry once the same wait used by the root switch elapses', () => {
			cascadeShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );
			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT );

			expect( historyMock.instance.get() ).not.toBeNull();
			expect( historyMock.instance.get()?.subTitle ).toBe( 'Show Markers' );
		} );
	} );

	describe( 'useShowMarkersWriteThrough', () => {
		it( 'does not cascade on initial mount, even when show_markers is already off', () => {
			renderHook( () => useShowMarkersWriteThrough( LIST_ID, false ) );

			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'cascades once when the value flips', () => {
			const { rerender } = renderHook(
				( { showMarkers }: { showMarkers: boolean } ) => useShowMarkersWriteThrough( LIST_ID, showMarkers ),
				{ initialProps: { showMarkers: true } }
			);

			rerender( { showMarkers: false } );

			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith(
				expect.objectContaining( {
					id: 'item-1',
					props: { show_markers: { $$type: 'boolean', value: false } },
				} )
			);
		} );

		it( 'does not cascade again when re-rendered with the same value', () => {
			const { rerender } = renderHook(
				( { showMarkers }: { showMarkers: boolean } ) => useShowMarkersWriteThrough( LIST_ID, showMarkers ),
				{ initialProps: { showMarkers: true } }
			);

			rerender( { showMarkers: true } );

			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'does not cascade when only the list identity changes', () => {
			const { rerender } = renderHook(
				( { listId, showMarkers }: { listId: string; showMarkers: boolean } ) =>
					useShowMarkersWriteThrough( listId, showMarkers ),
				{ initialProps: { listId: LIST_ID, showMarkers: true } }
			);

			rerender( { listId: 'other-list', showMarkers: false } );

			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );
	} );
} );
