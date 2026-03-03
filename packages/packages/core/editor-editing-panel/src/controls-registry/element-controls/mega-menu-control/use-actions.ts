import { type ItemsActionPayload } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
} from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

export type MenuItemData = {
	id: string;
	title?: string;
};

export const MENU_ITEM_ELEMENT_TYPE = 'e-mega-menu-item';
export const MENU_PANEL_ELEMENT_TYPE = 'e-mega-menu-panel';

export const useActions = () => {
	const duplicateItem = ( {
		items,
		contentAreaId,
	}: {
		items: ItemsActionPayload< MenuItemData >;
		contentAreaId: string;
	} ) => {
		items.forEach( ( { item, index } ) => {
			const menuItemId = item.id as string;
			const contentAreaContainer = getContainer( contentAreaId );
			const panelId = contentAreaContainer?.children?.[ index ]?.id;

			if ( ! panelId ) {
				throw new Error( 'Original panel ID is required for duplication' );
			}

			duplicateElements( {
				elementIds: [ menuItemId, panelId ],
				title: __( 'Duplicate Menu Item', 'elementor' ),
			} );
		} );
	};

	const moveItem = ( {
		toIndex,
		navId,
		contentAreaId,
		movedElementId,
		movedElementIndex,
	}: {
		toIndex: number;
		navId: string;
		contentAreaId: string;
		movedElementId: string;
		movedElementIndex: number;
	} ) => {
		const contentAreaContainer = getContainer( contentAreaId );
		const panel = contentAreaContainer?.children?.[ movedElementIndex ];
		const movedElement = getContainer( movedElementId );
		const nav = getContainer( navId );

		if ( ! panel ) {
			throw new Error( 'Panel element is required' );
		}

		if ( ! movedElement || ! nav ) {
			throw new Error( 'Menu item or nav not found' );
		}

		moveElements( {
			title: __( 'Reorder Menu Items', 'elementor' ),
			moves: [
				{
					element: movedElement,
					targetContainer: nav,
					options: { at: toIndex },
				},
				{
					element: panel,
					targetContainer: contentAreaContainer,
					options: { at: toIndex },
				},
			],
		} );
	};

	const removeItem = ( {
		items,
		contentAreaId,
	}: {
		items: ItemsActionPayload< MenuItemData >;
		contentAreaId: string;
	} ) => {
		removeElements( {
			title: __( 'Menu Item', 'elementor' ),
			elementIds: items.flatMap( ( { item, index } ) => {
				const menuItemId = item.id as string;
				const contentAreaContainer = getContainer( contentAreaId );
				const panelId = contentAreaContainer?.children?.[ index ]?.id;

				if ( ! panelId ) {
					throw new Error( 'Panel ID is required' );
				}

				return [ menuItemId, panelId ];
			} ),
		} );
	};

	const addItem = ( {
		contentAreaId,
		navId,
		items,
	}: {
		contentAreaId: string;
		navId: string;
		items: ItemsActionPayload< MenuItemData >;
	} ) => {
		const contentArea = getContainer( contentAreaId );
		const nav = getContainer( navId );

		if ( ! contentArea || ! nav ) {
			throw new Error( 'Menu containers not found' );
		}

		items.forEach( ( { index } ) => {
			const position = index + 1;

			createElements( {
				title: __( 'Menu Item', 'elementor' ),
				elements: [
					{
						container: contentArea,
						model: {
							elType: MENU_PANEL_ELEMENT_TYPE,
							editor_settings: { title: `Panel ${ position }`, initial_position: position },
						},
					},
					{
						container: nav,
						model: {
							elType: MENU_ITEM_ELEMENT_TYPE,
							editor_settings: { title: `Menu Item ${ position }`, initial_position: position },
						},
					},
				],
			} );
		} );
	};

	return {
		duplicateItem,
		moveItem,
		removeItem,
		addItem,
	};
};
