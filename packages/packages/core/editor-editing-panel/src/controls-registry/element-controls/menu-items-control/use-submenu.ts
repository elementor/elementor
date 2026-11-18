import { getContainer, getWidgetsCache } from '@elementor/editor-elements';
import { type ElementID } from '@elementor/editor-elements';

export const MENU_ENTRY_TYPE = 'e-menu-entry';

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
	const entitlement = getWidgetsCache()?.[ MENU_ENTRY_TYPE ]?.meta?.submenu_entitlement as
		| SubmenuEntitlement
		| undefined;

	return ! entitlement || entitlement.locked ? entitlement?.promotion ?? null : null;
};

export const getParentEntryId = ( elementId: ElementID ): ElementID | null => {
	const parent = getContainer( elementId )?.parent;

	return parent?.model.get( 'elType' ) === MENU_ENTRY_TYPE ? parent.id : null;
};
