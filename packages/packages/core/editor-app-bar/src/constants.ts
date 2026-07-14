// Below this width the app bar stops shrinking and scrolls horizontally instead, since the
// center section (document title, breakpoints switcher) can't shrink further without becoming
// unusable.
export const MIN_APP_BAR_WIDTH = 800;

export type MaxToolbarActions = {
	tools: number;
	utilities: number;
};

export const DEFAULT_MAX_TOOLBAR_ACTIONS: MaxToolbarActions = {
	tools: 5,
	utilities: 4,
};
