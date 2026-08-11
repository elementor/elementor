import { createMockElement } from 'test-utils';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
	type V1Element,
} from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';

import { useActions } from '../use-actions';

jest.mock( '@elementor/editor-elements' );

describe( 'list-items-control actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'creates a full default list-item subtree when adding an item', () => {
		const listContainer = createMockElement( {
			model: { id: 'list-1', elType: 'e-list' },
		} ) as unknown as V1Element;
		const { result } = renderHook( () => useActions() );

		result.current.addItem( {
			listContainer,
			items: [ { index: 1, item: { id: '', title: 'Item' } } ],
		} );

		expect( createElements ).toHaveBeenCalledWith(
			expect.objectContaining( {
				title: 'List Items',
				elements: [
					expect.objectContaining( {
						container: listContainer,
						model: expect.objectContaining( {
							elType: 'e-list-item',
							editor_settings: { label: 'Item 2', initial_position: 2 },
							elements: [
								expect.objectContaining( {
									elType: 'e-list-item-marker',
									elements: [ expect.objectContaining( { elType: 'widget', widgetType: 'e-svg' } ) ],
								} ),
								expect.objectContaining( {
									elType: 'e-list-item-content',
									elements: [
										expect.objectContaining( {
											elType: 'widget',
											widgetType: 'e-paragraph',
										} ),
									],
								} ),
							],
						} ),
					} ),
				],
			} )
		);
	} );

	it( 'removes the selected list items by root id', () => {
		const { result } = renderHook( () => useActions() );

		result.current.removeItem( {
			items: [
				{ index: 0, item: { id: 'item-1', title: 'Item 1' } },
				{ index: 1, item: { id: 'item-2', title: 'Item 2' } },
			],
		} );

		expect( removeElements ).toHaveBeenCalledWith( {
			title: 'List Items',
			elementIds: [ 'item-1', 'item-2' ],
		} );
	} );

	it( 'duplicates the selected list item roots', () => {
		const { result } = renderHook( () => useActions() );

		result.current.duplicateItem( {
			items: [ { index: 0, item: { id: 'item-1', title: 'Item 1' } } ],
		} );

		expect( duplicateElements ).toHaveBeenCalledWith( {
			elementIds: [ 'item-1' ],
			title: 'Duplicate List Item',
		} );
	} );

	it( 'reorders a list item inside the root list container', () => {
		const listContainer = createMockElement( {
			model: { id: 'list-1', elType: 'e-list' },
		} ) as unknown as V1Element;
		const movedElement = createMockElement( {
			model: { id: 'item-2', elType: 'e-list-item' },
		} ) as unknown as V1Element;

		jest.mocked( getContainer ).mockReturnValue( movedElement );

		const { result } = renderHook( () => useActions() );

		result.current.moveItem( {
			listContainer,
			toIndex: 0,
			movedElementId: 'item-2',
		} );

		expect( moveElements ).toHaveBeenCalledWith( {
			title: 'Reorder List Items',
			moves: [
				{
					element: movedElement,
					targetContainer: listContainer,
					options: { at: 0 },
				},
			],
		} );
	} );
} );
