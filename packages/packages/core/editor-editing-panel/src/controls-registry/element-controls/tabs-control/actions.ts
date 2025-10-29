import { type ItemActionPayload } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
} from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

export type TabItem = {
	id?: string;
	title?: string;
};

export const TAB_ELEMENT_TYPE = 'e-tab';
export const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';

export const duplicateItem = ( {
	items,
	tabContentAreaId,
}: {
	items: ItemActionPayload< TabItem >;
	tabContentAreaId: string;
} ) => {
	items.forEach( ( { item, index } ) => {
		const tabId = item.id as string;
		const tabContentAreaContainer = getContainer( tabContentAreaId );
		const tabContentId = tabContentAreaContainer?.children?.[ index ]?.id;

		if ( ! tabContentId ) {
			throw new Error( 'Original content ID is required for duplication' );
		}

		duplicateElements( {
			elementIds: [ tabId, tabContentId ],
			title: __( 'Duplicate Tab', 'elementor' ),
		} );
	} );
};

export const moveItem = ( {
	toIndex,
	tabsMenuId,
	tabContentAreaId,
	movedElementId,
	movedElementIndex,
}: {
	toIndex: number;
	tabsMenuId: string;
	tabContentAreaId: string;
	movedElementId: string;
	movedElementIndex: number;
} ) => {
	const tabContentContainer = getContainer( tabContentAreaId );
	const tabContentId = tabContentContainer?.children?.[ movedElementIndex ]?.id;

	if ( ! tabContentId ) {
		throw new Error( 'Content ID is required' );
	}

	moveElements( {
		title: __( 'Reorder Tabs', 'elementor' ),
		moves: [
			{
				elementId: movedElementId,
				targetContainerId: tabsMenuId,
				options: { at: toIndex },
			},
			{
				elementId: tabContentId,
				targetContainerId: tabContentAreaId,
				options: { at: toIndex },
			},
		],
	} );
};

export const removeItem = ( {
	items,
	tabContentAreaId,
}: {
	items: ItemActionPayload< TabItem >;
	tabContentAreaId: string;
} ) => {
	removeElements( {
		title: __( 'Tabs', 'elementor' ),
		elementIds: items.flatMap( ( { item, index } ) => {
			const tabId = item.id as string;
			const tabContentContainer = getContainer( tabContentAreaId );
			const tabContentId = tabContentContainer?.children?.[ index ]?.id;

			if ( ! tabContentId ) {
				throw new Error( 'Content ID is required' );
			}

			return [ tabId, tabContentId ];
		} ),
	} );
};

export const addItem = ( {
	tabContentAreaId,
	tabsMenuId,
	items,
}: {
	tabContentAreaId: string;
	tabsMenuId: string;
	items: ItemActionPayload< TabItem >;
} ) => {
	items.forEach( ( { index } ) => {
		createElements( {
			title: __( 'Tabs', 'elementor' ),
			elements: [
				{
					containerId: tabContentAreaId,
					model: {
						elType: TAB_CONTENT_ELEMENT_TYPE,
						editor_settings: { title: `Tab ${ index + 1 } content` },
					},
				},
				{
					containerId: tabsMenuId,
					model: {
						elType: TAB_ELEMENT_TYPE,
						editor_settings: { title: `Tab ${ index + 1 } trigger` },
					},
				},
			],
		} );
	} );
};
