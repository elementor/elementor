const EditorSelectors = {
	addNewPreset: ( preset: string ) => `[data-preset=${ preset }]`,
	getWidgetByName: ( title: string ) => `[data-widget_type="${ title }.default"]`,
	widget: '[data-element_type="widget"]',
	container: '[data-element_type="container"]',
	item: '.elementor-repeater-row-item-title',
	plusIcon: '.eicon-plus-circle',
	siteTitle: '.site-title >> nth=0',
	pageTitle: '.entry-title >> nth=0',
	pageHeader: '.page-header',
	toast: '#elementor-toast',
	panels: {
		topBar: {
			wrapper: '#elementor-editor-wrapper-v2',
		},
		menu: {
			wrapper: '#elementor-panel-page-menu',
			footerButton: '#elementor-panel-header-menu-button i',
		},
		elements: {
			wrapper: '#elementor-panel-page-elements',
			footerButton: '#elementor-panel-header-add-button i',
		},
		pageSettings: {
			wrapper: '#elementor-panel-page-settings',
			footerButton: '#elementor-panel-footer-settings i',
		},
		siteSettings: {
			wrapper: '#elementor-panel-page-menu',
			saveButton: '//button[text()="Save Changes"]',
			layout: {
				breakpoints: {
					removeBreakpointButton: '#elementor-kit-panel-content .select2-selection__choice__remove',
				},
			},
		},
		userPreferences: {
			wrapper: '#elementor-panel-editorPreferences-settings-controls',
		},
		footerTools: {
			wrapper: '#elementor-panel-footer',
			updateButton: '#elementor-panel-saver-button-publish-label',
		},
		navigator: {
			wrapper: '#elementor-navigator',
			footer: '#elementor-navigator__footer',
			closeButton: '#elementor-navigator__close',
			footerButton: '#elementor-panel-footer-navigator i',
		},
	},
	refreshPopup: {
		reloadButton: '#elementor-save-kit-refresh-page .dialog-button.dialog-ok.dialog-alert-ok',
	},

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
	galleryControl: {
		addGalleryBtn: 'button.elementor-control-gallery-add',
	},
	imageCarousel: {
		widget: '[data-widget_type="image-carousel.default"]',
		get link() {
			return `${ this.widget } a`;
		},
		navigationSelect: '.elementor-control-navigation select',
		autoplaySelect: 'input[data-setting="autoplay"]',
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
		playIcon: '[aria-label="Play"]',
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
		iframe: 'iframe[src*="https://maps.google.com/maps"]',
		showSatelliteViewBtn: 'button[title="Show satellite imagery"]',
		location: '[data-setting="address"]',
	},
	soundCloud: {
		iframe: 'iframe[src*="https://w.soundcloud.com/"]',
		waveForm: 'div.waveform.loaded',
	},
	ai: {
		aiButton: '.e-ai-button',
		aiDialogCloseButton: '.MuiDialog-container button[aria-label="close"]',
		promptInput: 'input[name="prompt"]',
		resultTextarea: 'textarea.MuiInputBase-inputMultiline',
		image: {
			promptTextarea: '[data-testid="e-image-prompt"] textarea',
			typeInput: '#image-type + input',
			styleInput: '#style + input',
			aspectRationInput: '#aspect-ratio + input',
			generatedImage: '[data-testid="e-gallery-image"] img',
		},
		promptHistory: {
			button: 'button[aria-label="Show prompt history"]',
			modal: '#prompt-history-modal',
			closeButton: 'button[aria-label="Hide prompt history"]',
			upgradeMessageFullTestId: 'e-ph-upgrade-full',
			upgradeMessageSmallTestId: 'e-ph-upgrade-small',
			noDataMessageTestId: 'e-ph-empty',
			periodTestId: 'e-ph-p',
			itemTestId: 'e-ph-i',
			fallbackIconTestId: 'e-ph-fi',
			removeButton: 'button[aria-label="Remove item"]',
			reuseButton: 'button[aria-label="Reuse prompt"]',
			restoreButton: 'button[aria-label="Restore"]',
			editButton: 'button[aria-label="Edit result"]',
		},
	},
	contextMenu: {
		menu: '.elementor-context-menu',
		saveAsGlobal: '.elementor-context-menu-list__item.elementor-context-menu-list__item-save.elementor-context-menu-list__item--disabled',
		notes: '.elementor-context-menu-list__item.elementor-context-menu-list__item-open_notes.elementor-context-menu-list__item--disabled',
	},
	dialog: {
		lightBox: '.elementor-lightbox',
	},
};

export default EditorSelectors;
