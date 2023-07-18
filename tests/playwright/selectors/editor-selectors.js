const EditorSelectors = {
	previewIframe: '#elementor-preview-iframe',
	container: '[data-element_type="container"]',
	closeNavigatorBtn: '#elementor-navigator__close',
	widgetsPanelIcon: '#elementor-panel-header-add-button i',
	searchWidgetLabel: 'Search Widget...',
	addNewPresetLbl: 'Add New Container',
	addNewPreset: ( preset ) => `[data-preset=${ preset }]`,
	viewPageBtn: 'View Page',
	updateBtn: 'Update',
	menuIcon: '#elementor-panel-header-menu-button i',
	widget: '[data-element_type="widget"]',
	loadingElement: ( id ) => `.elementor-element-${ id }.elementor-loading`,
};

export default EditorSelectors;
