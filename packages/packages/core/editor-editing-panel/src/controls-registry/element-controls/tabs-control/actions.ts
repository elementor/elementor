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
};

export const TAB_ELEMENT_TYPE = 'e-tab';
export const TAB_PANEL_ELEMENT_TYPE = 'e-tab-panel';

export const duplicateItem = ( { items }: { items: ItemActionPayload< TabItem > } ) => {
	items.forEach( ( { item } ) => {
		const tabId = item.id as string;

		const { value: tabPanelId } = getElementSetting< StringPropValue >( tabId, 'tab-panel-id' ) ?? {};

		if ( ! tabPanelId ) {
			throw new Error( 'Original panel ID is required for duplication' );
		}

		duplicateElements( {
			elementIds: [ tabId, tabPanelId ],
			title: __( 'Duplicate Tab', 'elementor' ),
			onCreate: ( duplicatedElements ) => {
				const tab = duplicatedElements.find( ( element ) => element.originalElementId === tabId );
				const tabPanel = duplicatedElements.find( ( element ) => element.originalElementId === tabPanelId );

				if ( tabPanel && tab ) {
					updateElementSettings( {
						withHistory: false,
						id: tab.id,
						props: {
							'tab-panel-id': stringPropTypeUtil.create( tabPanel.id ),
						},
					} );
					updateElementSettings( {
						withHistory: false,
						id: tabPanel.id,
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
	tabListId,
	tabContentId,
	movedElementId,
}: {
	toIndex: number;
	tabListId: string;
	tabContentId: string;
	movedElementId: string;
} ) => {
	const { value: tabPanelId } = getElementSetting< StringPropValue >( movedElementId, 'tab-panel-id' ) ?? {};

	if ( ! tabPanelId ) {
		throw new Error( 'Required tab elements not found for reordering' );
	}

	moveElements( {
		title: __( 'Reorder Tabs', 'elementor' ),
		moves: [
			{
				elementId: movedElementId,
				targetContainerId: tabListId,
				options: { at: toIndex },
			},
			{
				elementId: tabPanelId,
				targetContainerId: tabContentId,
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
			const { value: panelId } = getElementSetting< StringPropValue >( tabId, 'tab-panel-id' ) ?? {};

			if ( ! panelId ) {
				throw new Error( 'Pane ID is required' );
			}

			return [ tabId, panelId ];
		} ),
	} );
};

export const addItem = ( {
	tabContentId,
	tabListId,
	items,
}: {
	tabContentId: string;
	tabListId: string;
	items: ItemActionPayload< TabItem >;
} ) => {
	items.forEach( ( { item, index } ) => {
		const newTabPanelId = generateElementId();
		const newTabId = generateElementId();

		createElements( {
			title: __( 'Tabs', 'elementor' ),
			elements: [
				{
					containerId: tabContentId,
					model: {
						id: newTabPanelId,
						elType: TAB_PANEL_ELEMENT_TYPE,
						settings: {
							'tab-id': stringPropTypeUtil.create( newTabId ),
						},
					},
				},
				{
					containerId: tabListId,
					model: {
						id: newTabId,
						elType: TAB_ELEMENT_TYPE,
						settings: {
							...item,
							'tab-panel-id': stringPropTypeUtil.create( newTabPanelId ),
						},
						editor_settings: { title: `Tab #${ index + 1 }` },
					},
				},
			],
		} );
	} );
};
