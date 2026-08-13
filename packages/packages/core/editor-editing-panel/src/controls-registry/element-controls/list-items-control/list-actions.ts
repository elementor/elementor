import { type ItemsActionPayload } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
} from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

export type ListItem = {
	id: string;
	title?: string;
};

export const LIST_ITEM_ELEMENT_TYPE = 'e-list-item';

export const duplicateItem = ( { items }: { items: ItemsActionPayload< ListItem > } ) => {
	duplicateElements( {
		elementIds: items.map( ( { item } ) => item.id ),
		title: __( 'Duplicate List Item', 'elementor' ),
	} );
};

export const moveItem = ( {
	toIndex,
	listContainerId,
	movedElementId,
}: {
	toIndex: number;
	listContainerId: string;
	movedElementId: string;
} ) => {
	const movedElement = getContainer( movedElementId );
	const listContainer = getContainer( listContainerId );

	if ( ! movedElement || ! listContainer ) {
		throw new Error( 'List item or list container not found' );
	}

	moveElements( {
		title: __( 'Reorder List Items', 'elementor' ),
		moves: [
			{
				element: movedElement,
				targetContainer: listContainer,
				options: { at: toIndex },
			},
		],
	} );
};

export const removeItem = ( { items }: { items: ItemsActionPayload< ListItem > } ) => {
	removeElements( {
		title: __( 'List Items', 'elementor' ),
		elementIds: items.map( ( { item } ) => item.id ),
	} );
};

export const addItem = ( {
	listContainerId,
	items,
}: {
	listContainerId: string;
	items: ItemsActionPayload< ListItem >;
} ) => {
	const listContainer = getContainer( listContainerId );

	if ( ! listContainer ) {
		throw new Error( 'List container not found' );
	}

	items.forEach( ( { index } ) => {
		const position = index + 1;

		createElements( {
			title: __( 'List Items', 'elementor' ),
			elements: [
				{
					container: listContainer,
					model: {
						elType: LIST_ITEM_ELEMENT_TYPE,
						hydrateDefaultChildren: true,
						editor_settings: {
							title: `Item ${ position }`,
							initial_position: position,
						},
					},
					options: { at: index },
				},
			],
		} );
	} );
};
