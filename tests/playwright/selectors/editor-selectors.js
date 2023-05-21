const EditorSelectors = {
	previewIframe: '#elementor-preview-iframe',
	container: '[data-element_type="container"]',
	closeNavigatorBtn: '#elementor-navigator__close',
	widgetsPanelIcon: '#elementor-panel-header-add-button i',
	elementsPanelItem: ( title ) => `.elementor-panel-category-items :text-is('${ title }')`,
	searchWidgetLabel: 'Search Widget...',
	addNewPresetLbl: 'Add New Container',
	addNewPreset: ( preset ) => `[data-preset=${ preset }]`,
	viewPageBtn: 'View Page',
	updateBtn: 'Update',
	menuIcon: '#elementor-panel-header-menu-button i',
	widget: '[data-element_type="widget"]',
	loadingElement: ( id ) => `.elementor-element-${ id }.elementor-loading`,
	videoIframe: 'iframe.elementor-video',
	playIcon: '[aria-label="Play"]',
	mapIframe: 'iframe[src*="https://maps.google.com/maps"]',
	showSatelliteViewBtn: 'button[title="Show satellite imagery"]',
	soundCloudIframe: 'iframe[src*="https://w.soundcloud.com/"]',
	soundWaveForm: 'div.waveform.loaded',
	button: {
		getByName: ( name ) => `.elementor-button:has-text("Click here")`,
		id: '[data-setting="button_css_id"]',
		url: 'input[data-setting="url"]',
		linkOptions: 'button[data-tooltip="Link Options"]',
		targetBlankChbox: 'input[data-setting="is_external"]',
		noFollowChbox: 'input[data-setting="nofollow"]',
		customAttributesInp: 'input[data-setting="custom_attributes"]',
	},

};

export default EditorSelectors;
