import { type ElementID, getContainer, getWidgetsCache } from '@elementor/editor-elements';

import { MENU_ENTRY_ELEMENT_TYPE } from './use-actions';

export type SubmenuPromotion = {
	title: string;
	content: string;
	ctaUrl: string;
};

type SubmenuEntitlement = {
	locked: boolean;
	promotion: SubmenuPromotion;
};

export const getSubmenuPromotion = (): SubmenuPromotion | null => {
	const entitlement = getWidgetsCache()?.[ MENU_ENTRY_ELEMENT_TYPE ]?.meta?.submenu_entitlement as
		| SubmenuEntitlement
		| undefined;

	return entitlement?.locked ? entitlement.promotion : null;
};

export const getParentEntryId = ( elementId: ElementID ): ElementID | null => {
	const parent = getContainer( elementId )?.parent;

	return parent?.model.get( 'elType' ) === MENU_ENTRY_ELEMENT_TYPE ? parent.id : null;
};
