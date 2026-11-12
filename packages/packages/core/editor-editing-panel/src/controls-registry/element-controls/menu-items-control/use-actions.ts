import { type ItemsActionPayload } from '@elementor/editor-controls';
import {
	type CreateElementParams,
	createElements,
	duplicateElements,
	generateElementId,
	getContainer,
	moveElements,
	removeElements,
	type V1ElementData,
} from '@elementor/editor-elements';
import { escapedHtmlPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type MenuItem = {
	id: string;
	title?: string;
};

export const MENU_ITEMS_ELEMENT_TYPE = 'e-menu-items';
export const MENU_ENTRY_ELEMENT_TYPE = 'e-menu-entry';
export const MENU_ITEM_ELEMENT_TYPE = 'e-menu-item';
const MIN_ENTRIES = 1;
const PARAGRAPH_WIDGET_TYPE = 'e-paragraph';

const getEntryTitle = () => __( 'Menu item', 'elementor' );

const buildEntryModel = ( title: string ): V1ElementData => ( {
	elType: MENU_ENTRY_ELEMENT_TYPE,
	id: generateElementId(),
	editor_settings: { title },
	elements: [
		{
			elType: MENU_ITEM_ELEMENT_TYPE,
			id: generateElementId(),
			elements: [
				{
					elType: 'widget',
					widgetType: PARAGRAPH_WIDGET_TYPE,
					id: generateElementId(),
					elements: [],
					settings: {
						paragraph: escapedHtmlPropTypeUtil.create( title ),
						tag: { $$type: 'string', value: 'span' },
					},
				},
			],
		},
	],
} );

export const useActions = () => {
	const addItem = ( { menuItemsId, items }: { menuItemsId: string; items: ItemsActionPayload< MenuItem > } ) => {
		const menuItems = getContainer( menuItemsId );

		if ( ! menuItems ) {
			throw new Error( 'Menu items container not found' );
		}

		items.forEach( () => {
			createElements( {
				title: __( 'Menu', 'elementor' ),
				elements: [
					{
						container: menuItems,
						model: buildEntryModel( getEntryTitle() ) as CreateElementParams[ 'model' ],
					},
				],
			} );
		} );
	};

	const removeItem = ( { menuItemsId, items }: { menuItemsId: string; items: ItemsActionPayload< MenuItem > } ) => {
		const entriesCount =
			getContainer( menuItemsId )?.children?.filter(
				( child ) => child.model.get( 'elType' ) === MENU_ENTRY_ELEMENT_TYPE
			).length ?? 0;
		const removableCount = Math.max( 0, Math.min( items.length, entriesCount - MIN_ENTRIES ) );

		if ( removableCount === 0 ) {
			return;
		}

		removeElements( {
			title: __( 'Menu', 'elementor' ),
			elementIds: items.slice( 0, removableCount ).map( ( { item } ) => item.id ),
		} );
	};

	const duplicateItem = ( { items }: { items: ItemsActionPayload< MenuItem > } ) => {
		duplicateElements( {
			title: __( 'Duplicate Menu item', 'elementor' ),
			elementIds: items.map( ( { item } ) => item.id ),
		} );
	};

	const moveItem = ( {
		menuItemsId,
		movedElementId,
		toIndex,
	}: {
		menuItemsId: string;
		movedElementId: string;
		toIndex: number;
	} ) => {
		const menuItems = getContainer( menuItemsId );
		const movedElement = getContainer( movedElementId );

		if ( ! menuItems || ! movedElement ) {
			throw new Error( 'Menu item or container not found' );
		}

		moveElements( {
			title: __( 'Reorder Menu items', 'elementor' ),
			moves: [
				{
					element: movedElement,
					targetContainer: menuItems,
					options: { at: toIndex },
				},
			],
		} );
	};

	return { addItem, removeItem, duplicateItem, moveItem };
};
