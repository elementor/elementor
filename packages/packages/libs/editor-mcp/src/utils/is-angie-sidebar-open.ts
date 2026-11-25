import { ANGIE_SIDEBAR_STATE_OPEN, getAngieSidebarSavedState } from '@elementor/editor-angie-sdk';

export const isAngieSidebarOpen = (): boolean => {
	return getAngieSidebarSavedState() === ANGIE_SIDEBAR_STATE_OPEN;
};
