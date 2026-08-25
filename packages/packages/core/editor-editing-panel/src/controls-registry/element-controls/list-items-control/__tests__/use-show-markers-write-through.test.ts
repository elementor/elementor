import { getContainer, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { syncShowMarkersToItems, useShowMarkersWriteThrough } from '../use-show-markers-write-through';

jest.mock( '@elementor/editor-elements' );

describe( 'useShowMarkersWriteThrough / syncShowMarkersToItems', () => {
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

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getContainer ).mockImplementation( ( id: string ) =>
			id === LIST_ID ? listContainer( [ 'item-1', 'item-2' ] ) : null
		);
	} );

	describe( 'syncShowMarkersToItems', () => {
		it( 'updates every list item under the list in one call', () => {
			syncShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

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

		it( 'does nothing when the list has no items', () => {
			jest.mocked( getContainer ).mockReturnValue( listContainer( [] ) );

			syncShowMarkersToItems( { listId: LIST_ID, showMarkers: false } );

			expect( updateElementSettings ).not.toHaveBeenCalled();
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

		it( 'syncs again when the root value flips back, matching undo or redo replay', () => {
			const { rerender } = renderHook(
				( { showMarkers }: { showMarkers: boolean } ) => useShowMarkersWriteThrough( LIST_ID, showMarkers ),
				{ initialProps: { showMarkers: true } }
			);

			rerender( { showMarkers: false } );
			jest.mocked( updateElementSettings ).mockClear();

			rerender( { showMarkers: true } );

			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith(
				expect.objectContaining( {
					id: 'item-1',
					props: { show_markers: { $$type: 'boolean', value: true } },
				} )
			);
			expect( updateElementSettings ).toHaveBeenCalledWith(
				expect.objectContaining( {
					id: 'item-2',
					props: { show_markers: { $$type: 'boolean', value: true } },
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
