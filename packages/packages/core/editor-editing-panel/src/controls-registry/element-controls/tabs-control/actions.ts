import { type ItemActionPayload } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	generateElementId,
	getElementSetting,
	moveElements,
	removeElements,
	updateElementSettings,
} from '@elementor/editor-elements';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type TabItem = {
	id?: string;
	title?: string;
	index?: number;
};

export const TAB_ELEMENT_TYPE = 'e-tab';
export const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';

export const duplicateItem = ( { items }: { items: ItemActionPayload< TabItem > } ) => {
	items.forEach( ( { item } ) => {
		const tabId = item.id as string;

		const { value: tabContentId } = getElementSetting< StringPropValue >( tabId, 'tab-content-id' ) ?? {};

		if ( ! tabContentId ) {
			throw new Error( 'Original content ID is required for duplication' );
		}

		duplicateElements( {
			elementIds: [ tabId, tabContentId ],
			title: __( 'Duplicate Tab', 'elementor' ),
			onCreate: ( duplicatedElements ) => {
				const tab = duplicatedElements.find( ( element ) => element.originalElementId === tabId );
				const tabContent = duplicatedElements.find( ( element ) => element.originalElementId === tabContentId );

				if ( tabContent && tab ) {
					updateElementSettings( {
						withHistory: false,
						id: tab.id,
						props: {
							'tab-content-id': stringPropTypeUtil.create( tabContent.id ),
						},
					} );
					updateElementSettings( {
						withHistory: false,
						id: tabContent.id,
						props: {
							'tab-id': stringPropTypeUtil.create( tab.id ),
						},
					} );
				}
			},
		} );
	} );
};

export const moveItem = ( {
	toIndex,
	tabsMenuId,
	tabContentAreaId,
	movedElementId,
}: {
	toIndex: number;
	tabsMenuId: string;
	tabContentAreaId: string;
	movedElementId: string;
} ) => {
	const { value: tabContentId } = getElementSetting< StringPropValue >( movedElementId, 'tab-content-id' ) ?? {};

	if ( ! tabContentId ) {
		throw new Error( 'Required tab elements not found for reordering' );
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

export const removeItem = ( { items }: { items: ItemActionPayload< TabItem > } ) => {
	removeElements( {
		title: __( 'Tabs', 'elementor' ),
		elementIds: items.flatMap( ( { item } ) => {
			const tabId = item.id as string;
			const { value: tabContentId } = getElementSetting< StringPropValue >( tabId, 'tab-content-id' ) ?? {};

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
	items.forEach( ( { item, index } ) => {
		const newTabContentId = generateElementId();
		const newTabId = generateElementId();

		createElements( {
			title: __( 'Tabs', 'elementor' ),
			elements: [
				{
					containerId: tabContentAreaId,
					model: {
						id: newTabContentId,
						elType: TAB_CONTENT_ELEMENT_TYPE,
						settings: {
							'tab-id': stringPropTypeUtil.create( newTabId ),
						},
						editor_settings: { title: `Tab ${ index + 1 } content` },
					},
				},
				{
					containerId: tabsMenuId,
					model: {
						id: newTabId,
						elType: TAB_ELEMENT_TYPE,
						settings: {
							...item,
							'tab-content-id': stringPropTypeUtil.create( newTabContentId ),
						},
						editor_settings: { title: `Tab ${ index + 1 } trigger` },
					},
				},
			],
		} );
	} );
};
