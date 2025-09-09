import { type ItemActionPayload } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	type ElementModel,
	generateElementId,
	getElementSetting,
	moveElements,
	removeElements,
	updateElementSettings,
} from '@elementor/editor-elements';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type TabsPropValue = {
	id?: string;
	title?: string;
};

export const TAB_ELEMENT_TYPE = 'e-tab';
export const TAB_PANEL_ELEMENT_TYPE = 'e-tab-panel';

export const duplicateItem = ( { items }: { items: ItemActionPayload< TabsPropValue > } ) => {
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
				const tabsLink = duplicatedElements.find( ( element ) => element.originalElementId === tabId );
				const tabsPanel = duplicatedElements.find( ( element ) => element.originalElementId === tabPanelId );

				if ( tabsPanel && tabsLink ) {
					updateElementSettings( {
						withHistory: false,
						id: tabsLink.id,
						props: {
							'tab-panel-id': stringPropTypeUtil.create( tabsPanel.id ),
						},
					} );
				}
			},
		} );
	} );
};

export const moveItem = ( {
	from,
	to,
	tabListId,
	tabLinks,
	tabContentId,
}: {
	from: number;
	to: number;
	tabListId: string;
	tabLinks: ElementModel[];
	tabContentId: string;
} ) => {
	const movedElementId = tabLinks[ from ].id;

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
				options: { at: to },
			},
			{
				elementId: tabPanelId,
				targetContainerId: tabContentId,
				options: { at: to },
			},
		],
	} );
};

export const removeItem = ( { items }: { items: ItemActionPayload< TabsPropValue > } ) => {
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
	items: ItemActionPayload< TabsPropValue >;
} ) => {
	items.forEach( ( { item } ) => {
		const newTabPanelId = generateElementId();

		createElements( {
			title: __( 'Tabs', 'elementor' ),
			elements: [
				{
					containerId: tabContentId,
					model: {
						id: newTabPanelId,
						elType: TAB_PANEL_ELEMENT_TYPE,
					},
				},
				{
					containerId: tabListId,
					model: {
						elType: TAB_ELEMENT_TYPE,
						settings: {
							...item,
							'tab-panel-id': stringPropTypeUtil.create( newTabPanelId ),
						},
					},
				},
			],
		} );
	} );
};
