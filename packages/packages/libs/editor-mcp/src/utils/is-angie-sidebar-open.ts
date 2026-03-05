import { getAngieSidebarSavedState, ANGIE_SIDEBAR_STATE_OPEN } from '@elementor-external/angie-sdk';

export const isAngieSidebarOpen = (): boolean => {
	return getAngieSidebarSavedState() === ANGIE_SIDEBAR_STATE_OPEN;
};
