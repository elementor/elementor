const V4_DIV_BLOCK = 'e-div-block';
const V4_FLEXBOX = 'e-flexbox';
const V4_TABS = 'e-tabs';
const V4_HEADING = 'e-heading';
const V4_PARAGRAPH = 'e-paragraph';
const V4_IMAGE = 'e-image';
const V4_SVG = 'e-svg';
const V4_BUTTON = 'e-button';
const V4_DIVIDER = 'e-divider';
const V4_YOUTUBE = 'e-youtube';

const V4_ATOM_SLUGS = {
	divBlock: V4_DIV_BLOCK,
	flexbox: V4_FLEXBOX,
	tabs: V4_TABS,
	heading: V4_HEADING,
	paragraph: V4_PARAGRAPH,
	image: V4_IMAGE,
	svg: V4_SVG,
	button: V4_BUTTON,
	divider: V4_DIVIDER,
	youtube: V4_YOUTUBE,
} as const;

const V4_ATOM_SELECTORS = {
	divBlock: getElementSelectorBySlug( V4_DIV_BLOCK ),
	flexbox: getElementSelectorBySlug( V4_FLEXBOX ),
	tabs: getElementSelectorBySlug( V4_TABS ),
	heading: getElementSelectorBySlug( V4_HEADING ),
	paragraph: getElementSelectorBySlug( V4_PARAGRAPH ),
	image: getElementSelectorBySlug( V4_IMAGE ),
	svg: getElementSelectorBySlug( V4_SVG ),
	button: getElementSelectorBySlug( V4_BUTTON ),
	divider: getElementSelectorBySlug( V4_DIVIDER ),
};

const EditorSelectors = {
	getWidgetByName: ( title: string ) => `[data-widget_type="${ title }.default"]`,
	canvas: '#elementor-preview-iframe',
	widget: '[data-element_type="widget"]',
	container: '[data-element_type="container"]',
	item: '.elementor-repeater-row-item-title',
	plusIcon: '.eicon-plus-circle',
	siteTitle: '.site-title >> nth=0',
	pageTitle: '.entry-title >> nth=0',
	pageContent: '.page-content',
	pageHeader: '.page-header',
	toast: '#elementor-toast',
	addNewSection: '#elementor-add-new-section',
	addSectionInner: '.elementor-add-section-inner',
	removeContainer: '.elementor-editor-element-setting.elementor-editor-element-remove',
	v4: {
		atoms: V4_ATOM_SLUGS,
		atomSelectors: V4_ATOM_SELECTORS,
	},
	panels: {
		topBar: {
			wrapper: '#elementor-editor-wrapper-v2',
		},
		elements: {
			wrapper: '#elementor-panel-page-elements',
			v4elements: '#elementor-panel-category-v4-elements',
			footerButton: '#elementor-panel-header-add-button i',
			elementorPanel: '#elementor-panel',
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
		navigator: {
			wrapper: '#elementor-navigator',
			footer: '#elementor-navigator__footer',
			closeButton: '#elementor-navigator__close',
			footerButton: '#elementor-panel-footer-navigator i',
			getElement: ( elementId: string ) => `#elementor-navigator .elementor-navigator__element[data-id="${ elementId }"]`,
			getElementItem: ( elementId: string ) => `${ EditorSelectors.panels.navigator.getElement( elementId ) } .elementor-navigator__item`,
		},
		promotionCard: '[data-testid="e-promotion-card"]',
		popoverCard: '[data-testid="e-popover-card"]',
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
		linkSelect: 'link_to',
		imageSizeSelect: 'image_size',
		widthInp: 'input[data-setting="width"]',
		heightInp: 'input[data-setting="height"]',
		get image() {
			return `${ this.widget } img`;
		},
		get link() {
			return `${ this.widget } a`;
		},
		lightBox: '.swiper-zoom-container, .elementor-lightbox',
	},
	icon: {
		widget: '[data-widget_type="icon.default"]',
		get link() {
			return `${ this.widget } a`;
		},
	},
	imageBox: {
		widget: '[data-widget_type="image-box.default"]',
		imageSizeSelect: 'thumbnail_size',
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
		get image() {
			return `${ this.widget } .elementor-custom-embed-image-overlay`;
		},
		lightBoxControlInp: '[data-setting="lightbox"]',
		lightBoxSetting: 'div[data-elementor-open-lightbox="yes"]',
		lightBoxDialog: '.elementor-lightbox',
		iframe: 'iframe[class*="elementor-video"]',
		playIcon: '[aria-label="Play"]',
		videoWrapper: '.elementor-video-wrapper',
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
	floatingElements: {
		floatingButtons: {
			controls: {
				advanced: {
					sections: [
						'.elementor-control-advanced_layout_section',
						'.elementor-control-advanced_responsive_section',
						'.elementor-control-advanced_custom_controls_section',
						'.elementor-control-section_custom_css_pro',
						'.elementor-control-section_custom_attributes_pro',
					],
				},
			},
		},
		v4: {
			floatingActionsBar: '#floating-action-bar',
		},
	},
	contextMenu: {
		menu: '.elementor-context-menu',
		saveAsGlobal: '.elementor-context-menu-list__item.elementor-context-menu-list__item-save.elementor-context-menu-list__item--disabled',
		notes: '.elementor-context-menu-list__item.elementor-context-menu-list__item-open_notes.elementor-context-menu-list__item--disabled',
	},
	components: {
		createComponentForm: '[data-testid="create-component-form"]',
		overridablePropForm: '[data-testid="overridable-prop-form"]',
		nameInput: '#component-name',
		componentsTab: '[data-tab="components"]',
		componentsList: '#elementor-panel-elements-wrapper',
		instanceWidget: '[data-widget_type="e-component.default"]',
		editModeHeader: '[data-testid="component-panel-header"]',
		exitEditModeButton: '[data-testid="component-panel-header"] [aria-label="Back"]',
		overridableIndicator: '[aria-label="Make prop overridable"]',
		overridableIndicatorActive: '[aria-label="Overridable property"]',
		instanceEditingPanel: '[data-testid="instance-editing-panel"]',
	},
	dialog: {
		lightBox: '.elementor-lightbox',
	},
	onboarding: {
		upgradeButton: '.e-onboarding__button-action',
		skipButton: '.e-onboarding__button-skip',
		screenTitle: '.e-onboarding__page-content-section-title',
		removeLogoButton: '.e-onboarding__logo-remove',
		progressBar: {
			skippedItem: '.e-onboarding__progress-bar-item--skipped',
			completedItem: '.e-onboarding__progress-bar-item--completed',
		},
		features: {
			essential: '#essential',
			advanced: '#advanced',
		},
	},
	variables: {
		manager: {
			managerButton: '#variables-manager-button',
			addButton: '#add-variable-button',
			createButton: '#create-variable-button',
			valueInputWrapper: '#variable-value-wrapper',
			valueInput: 'input[data-setting="value"]',
		},
	},
};

function getElementSelectorBySlug( slug: string ) {
	return {
		wrapper: `[data-widget_type="${ slug }.default"]`,
		base: `.${ slug }-base`,
	};
}

export default EditorSelectors;
