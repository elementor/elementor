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
	media: {
		preview: '.elementor-control-media__preview',
		imageByTitle: ( imageTitle ) => `[aria-label="${ imageTitle }"]`,
		selectBtn: '.button.media-button',
		imageInp: 'input[type="file"]',
		addGalleryButton: 'button.media-button-gallery',
		images: '.attachments-wrapper li',
		imgCaption: '#attachment-details-caption',
		imgDescription: '#attachment-details-description',
	},
	siteTitle: 'h1.site-title',
	pageTitle: 'h1.entry-title',
	button: {
		getByName: ( name ) => `.elementor-button:has-text("${ name }")`,
		id: '[data-setting="button_css_id"]',
		url: 'input[data-setting="url"]',
		linkOptions: 'button[data-tooltip="Link Options"]',
		targetBlankChbox: 'input[data-setting="is_external"]',
		noFollowChbox: 'input[data-setting="nofollow"]',
		customAttributesInp: 'input[data-setting="custom_attributes"]',
	},
	heading: {
		h2: 'h2.elementor-heading-title',
		get link() {
			return `${ this.h2 } a`;
		},
	},
	image: {
		widget: '[data-widget_type="image.default"]',
		linkSelect: 'select[data-setting="link_to"]',
		imageSizeSelect: 'select[data-setting="image_size"]',
		widthInp: 'input[data-setting="width"]',
		heightInp: 'input[data-setting="height"]',
		get image() {
			return `${ this.widget } img`;
		},
		get link() {
			return `${ this.widget } a`;
		},
	},
	icon: {
		widget: '[data-widget_type="icon.default"]',
		get link() {
			return `${ this.widget } a`;
		},
	},
	imageBox: {
		widget: '[data-widget_type="image-box.default"]',
		imageSizeSelect: 'select[data-setting="thumbnail_size"]',
		get link() {
			return `${ this.widget } a`;
		},
	},
	imageCarousel: {
		widget: '[data-widget_type="image-carousel.default"]',
		get link() {
			return `${ this.widget } a`;
		},
		addGalleryBtn: 'button.elementor-control-gallery-add',
		navigationSelect: '.elementor-control-navigation select',
		autoplaySelect: 'select[data-setting="autoplay"]',
		autoplaySpeedLabel: 'Autoplay Speed',
		autoplaySpeedInp: '[data-setting="autoplay_speed"]',
		autoplayToggle: '.elementor-switch-handle',
		captionSelect: 'select[data-setting="caption_type"]',
		imgCaption: 'figcaption.elementor-image-carousel-caption',
	},
	textPath: {
		widget: '[data-widget_type="text-path.default"]',
		get link() {
			return `${ this.widget } a`;
		},
	},

};

export default EditorSelectors;
