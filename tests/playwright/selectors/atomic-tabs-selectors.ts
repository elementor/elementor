export const AtomicTabsSelectors = {
	container: '[data-e-type="e-tabs"]',
	menu: '[data-element_type="e-tabs-menu"]',
	trigger: '[role="tab"]',
	panel: '[role="tabpanel"]',
	contentArea: '[data-element_type="e-tabs-content-area"]',
	content: '[data-element_type="e-tab-content"]',
	selectedClass: 'e--selected',
	addItemButton: 'button[aria-label="Add item"]',

	getTabById: ( tabsId: string, index: number ) => `[data-id="${ tabsId }"] [role="tab"]:nth-child(${ index + 1 })`,
	getContentById: ( tabsId: string, index: number ) => `[data-id="${ tabsId }"] [data-element_type="e-tab-content"]:nth-child(${ index + 1 })`,
} as const;

