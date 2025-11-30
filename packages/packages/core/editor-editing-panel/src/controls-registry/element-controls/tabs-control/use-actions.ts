import { type ItemsActionPayload, useBoundProp } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
} from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

export type TabItem = {
	id: string;
	title?: string;
};

export const TAB_ELEMENT_TYPE = 'e-tab';
export const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';

export const useActions = () => {
	const { value, setValue: setDefaultActiveTab } = useBoundProp( numberPropTypeUtil );
	const defaultActiveTab = value ?? 0;

	const duplicateItem = ( {
		items,
		tabContentAreaId,
	}: {
		items: ItemsActionPayload< TabItem >;
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

	const moveItem = ( {
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

		const newDefault = calculateDefaultOnMove( {
			from: movedElementIndex,
			to: toIndex,
			defaultActiveTab,
		} );

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
			onMoveElements: () => {
				if ( newDefault !== defaultActiveTab ) {
					setDefaultActiveTab( newDefault );
				}
			},
			onRestoreElements: () => {
				if ( newDefault !== defaultActiveTab ) {
					setDefaultActiveTab( defaultActiveTab );
				}
			},
		} );
	};

	const removeItem = ( {
		items,
		tabContentAreaId,
	}: {
		items: ItemsActionPayload< TabItem >;
		tabContentAreaId: string;
	} ) => {
		const newDefault = calculateDefaultOnRemove( {
			items,
			defaultActiveTab,
		} );

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
			onRemoveElements: () => {
				if ( newDefault !== defaultActiveTab ) {
					setDefaultActiveTab( newDefault );
				}
			},
			onRestoreElements: () => {
				if ( newDefault !== defaultActiveTab ) {
					setDefaultActiveTab( defaultActiveTab );
				}
			},
		} );
	};

	const addItem = ( {
		tabContentAreaId,
		tabsMenuId,
		items,
	}: {
		tabContentAreaId: string;
		tabsMenuId: string;
		items: ItemsActionPayload< TabItem >;
	} ) => {
		items.forEach( ( { index } ) => {
			const position = index + 1;

			createElements( {
				title: __( 'Tabs', 'elementor' ),
				elements: [
					{
						containerId: tabContentAreaId,
						model: {
							elType: TAB_CONTENT_ELEMENT_TYPE,
							editor_settings: { title: `Tab ${ position } content`, initial_position: position },
						},
					},
					{
						containerId: tabsMenuId,
						model: {
							elType: TAB_ELEMENT_TYPE,
							editor_settings: { title: `Tab ${ position } trigger`, initial_position: position },
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

const calculateDefaultOnMove = ( {
	from,
	to,
	defaultActiveTab,
}: {
	from: number;
	to: number;
	defaultActiveTab: number;
} ) => {
	if ( from === defaultActiveTab ) {
		return to;
	}

	if ( from < defaultActiveTab && to > defaultActiveTab ) {
		return defaultActiveTab - 1;
	}

	if ( from > defaultActiveTab && to < defaultActiveTab ) {
		return defaultActiveTab + 1;
	}

	if ( to === defaultActiveTab && to > from ) {
		return defaultActiveTab - 1;
	}

	if ( to === defaultActiveTab && to < from ) {
		return defaultActiveTab + 1;
	}

	return defaultActiveTab;
};

const calculateDefaultOnRemove = ( {
	items,
	defaultActiveTab,
}: {
	items: ItemsActionPayload< TabItem >;
	defaultActiveTab: number;
} ) => {
	const isDefault = items.some( ( { index } ) => index === defaultActiveTab );

	if ( isDefault ) {
		return 0;
	}

	const defaultGap = items.reduce( ( acc, { index } ) => ( index < defaultActiveTab ? acc + 1 : acc ), 0 );
	return defaultActiveTab - defaultGap;
};
