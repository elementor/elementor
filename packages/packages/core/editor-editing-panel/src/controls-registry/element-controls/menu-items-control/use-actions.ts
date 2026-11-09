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
import { __, sprintf } from '@wordpress/i18n';

export type MenuItem = {
	id: string;
	title?: string;
};

export const MENU_ITEMS_ELEMENT_TYPE = 'e-menu-items';
export const MENU_ENTRY_ELEMENT_TYPE = 'e-menu-entry';
const MENU_ITEM_ELEMENT_TYPE = 'e-menu-item';
const PARAGRAPH_WIDGET_TYPE = 'e-paragraph';

const TRAILING_NUMBER = /(\d+)\s*$/;

const getEntryTitle = ( position: number ) =>
	/* translators: %d: Menu item position. */
	sprintf( __( 'Menu item %d', 'elementor' ), position );

const getNextEntryNumber = ( existingTitles: ( string | undefined )[] ) => {
	const taken = new Set( existingTitles.filter( ( title ): title is string => Boolean( title ) ) );

	const highest = existingTitles.reduce( ( max: number, title ) => {
		const [ , trailingNumber ] = title?.match( TRAILING_NUMBER ) ?? [];
		const parsed = trailingNumber ? Number( trailingNumber ) : 0;

		return Number.isFinite( parsed ) && parsed > max ? parsed : max;
	}, 0 );

	let next = highest + 1;

	while ( taken.has( getEntryTitle( next ) ) ) {
		next += 1;
	}

	return next;
};

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
	const addItem = ( {
		menuItemsId,
		existingTitles,
		items,
	}: {
		menuItemsId: string;
		existingTitles: ( string | undefined )[];
		items: ItemsActionPayload< MenuItem >;
	} ) => {
		const menuItems = getContainer( menuItemsId );

		if ( ! menuItems ) {
			throw new Error( 'Menu items container not found' );
		}

		const titles = [ ...existingTitles ];

		items.forEach( () => {
			const title = getEntryTitle( getNextEntryNumber( titles ) );

			createElements( {
				title: __( 'Menu', 'elementor' ),
				elements: [
					{
						container: menuItems,
						model: buildEntryModel( title ) as CreateElementParams[ 'model' ],
					},
				],
			} );

			titles.push( title );
		} );
	};

	const removeItem = ( { items }: { items: ItemsActionPayload< MenuItem > } ) => {
		removeElements( {
			title: __( 'Menu', 'elementor' ),
			elementIds: items.map( ( { item } ) => item.id ),
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
