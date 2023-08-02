const EditorSelectors = {
	previewIframe: '#elementor-preview-iframe',
	container: '[data-element_type="container"]',
	closeNavigatorBtn: '#elementor-navigator__close',
	widgetsPanelIcon: '#elementor-panel-header-add-button i',
	elementsPanelItem: ( title: string ) => `.elementor-panel-category-items :text-is('${ title }')`,
	searchWidgetLabel: 'Search Widget...',
	addNewPresetLbl: 'Add New Container',
	addNewPreset: ( preset: string ) => `[data-preset=${ preset }]`,
	viewPageBtn: 'View Page',
	updateBtn: 'Update',
	menuIcon: '#elementor-panel-header-menu-button i',
	widget: '[data-element_type="widget"]',
	loadingElement: ( id: string ) => `.elementor-element-${ id }.elementor-loading`,
	videoIframe: 'iframe.elementor-video',
	playIcon: '[aria-label="Play"]',
	mapIframe: 'iframe[src*="https://maps.google.com/maps"]',
	showSatelliteViewBtn: 'button[title="Show satellite imagery"]',
	soundCloudIframe: 'iframe[src*="https://w.soundcloud.com/"]',
	soundWaveForm: 'div.waveform.loaded',
	item: '.elementor-repeater-row-item-title',
	addNewItem: 'button.elementor-button elementor-repeater-add',
	plusIcon: '.eicon-plus-circle',
	media: {
		preview: '.elementor-control-media__preview',
		imageByTitle: ( imageTitle: string ) => `[aria-label="${ imageTitle }"]`,
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
		getByName: ( name: string ) => `.elementor-button:has-text("${ name }")`,
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
		lightBox: '.swiper-zoom-container',
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
		get image() {
			return `${ this.widget } img`;
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
		prevSliderBtn: '.elementor-swiper-button-prev',
		nextSliderBtn: '.elementor-swiper-button-next',
		activeSlide: ( id: string ) => `.swiper-pagination-bullet-active[aria-label="Go to slide ${ id }"]`,
		activeSlideImg: ( name: string ) => `.swiper-slide-active img[alt="${ name }"]`,
	},
	textPath: {
		widget: '[data-widget_type="text-path.default"]',
		get link() {
			return `${ this.widget } a`;
		},
		get svgIcon() {
			return `${ this.widget } svg path.st0`;
		},
	},
	video: {
		widget: '[data-widget_type="video.default"]',
		youtube: { linkInp: '[data-setting="youtube_url"]' },
		vimeo: { linkInp: '[data-setting="vimeo_url"]' },
		dailymotion: { linkInp: '[data-setting="dailymotion_url"]' },
		autoplayInp: 'input[data-setting="autoplay"]',
		muteInp: 'input[data-setting="mute"]',
		loopInp: 'input[data-setting="loop"]',
		playerControlInp: 'input[data-setting="controls"]',
		modestbrandingInp: 'input[data-setting="modestbranding"]',
		privacyInp: 'input[data-setting="yt_privacy"]',
		switch: '.elementor-switch-handle',
		suggestedVideoSelect: '[data-setting="rel"]',
		playOnMobileInp: 'input[data-setting="play_on_mobile"]',
		lazyLoadInp: 'input[data-setting="lazy_load"]',
		videoSourceSelect: '[data-setting="video_type"]',
		showImageOverlay: '[data-setting="show_image_overlay"]',
		get image() {
			return `${ this.widget } .elementor-custom-embed-image-overlay`;
		},
		imageSizeSelect: '[data-setting="image_overlay_size"]',
		lightBoxControlInp: '[data-setting="lightbox"]',
		lightBoxSetting: 'div[data-elementor-open-lightbox="yes"]',
		lightBoxDialog: '.elementor-lightbox',
		iframe: 'iframe[class*="elementor-video"]',
	},
	socialIcons: {
		widget: '[data-widget_type="social-icons.default"]',
		get link() {
			return `${ this.widget } a`;
		},
		get svgIcon() {
			return `${ this.widget } svg path.st0`;
		},
	},
	tabs: {
		textEditorIframe: 'iframe[id*="elementorwpeditorview"]',
		body: '#tinymce',
	},
	googleMaps: {
		location: '[data-setting="address"]',
	},
};

export default EditorSelectors;
