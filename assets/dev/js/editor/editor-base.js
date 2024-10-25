/* global ElementorConfig */

import ColorControl from './controls/color';
import DateTimeControl from 'elementor-controls/date-time';
import EditorDocuments from './components/documents/component';
import environment from 'elementor-common/utils/environment';
import ElementsManager from './elements/manager';
import IntroductionTooltipsManager from './introduction-tooltips/manager';
import Favorites from 'elementor/modules/favorites/assets/js/editor/module';
import HistoryManager from 'elementor/modules/history/assets/js/module';
import HotkeysScreen from './components/hotkeys/hotkeys';
import IconsManager from './components/icons-manager/icons-manager';
import BrowserImport from './components/browser-import/manager';
import PreviewComponent from './components/preview/component';
import PanelMenu from 'elementor-panel/pages/menu/menu';
import Promotion from './utils/promotion';
import KitManager from '../../../../core/kits/assets/js/manager.js';
import Navigator from './regions/navigator/navigator';
import NoticeBar from './utils/notice-bar';
import Preview from 'elementor-views/preview';
import PopoverToggleControl from 'elementor-controls/popover-toggle';
import Selection from './components/selection/manager';
import LandingPageLibraryModule from 'elementor/modules/landing-pages/assets/js/editor/module';
import ElementsColorPicker from 'elementor/modules/elements-color-picker/assets/js/editor/module';
import Breakpoints from 'elementor-utils/breakpoints';
import Events from 'elementor-utils/events';
import DocumentComponent from './document/component';
import DataGlobalsComponent from './data/globals/component';
import ControlConditions from './utils/control-conditions';
import PromotionModule from 'elementor/modules/promotions/assets/js/editor/module';
import EditorEvents from 'elementor/modules/editor-events/assets/js/editor/module';
import FloatingButtonsLibraryModule from 'elementor/modules/floating-buttons/assets/js/floating-buttons/editor/module';
import FloatingBarsLibraryModule from 'elementor/modules/floating-buttons/assets/js/floating-bars/editor/module';
import LinkInBioLibraryModule from 'elementor/modules/link-in-bio/assets/js/editor/module';

import * as elementTypes from './elements/types';
import ElementBase from './elements/types/base/element-base';
import { FontVariables } from './utils/font-variables';

/**
 * @typedef {import('./container/container')} Container
 */
export default class EditorBase extends Marionette.Application {
	widgetsCache = {};

	config = {};

	loaded = false;

	previewLoadedOnce = false;

	activeBreakpointsUpdated = false;

	helpers = require( 'elementor-editor-utils/helpers' );
	imagesManager = require( 'elementor-editor-utils/images-manager' ); // TODO: Unused.
	presetsFactory = require( 'elementor-editor-utils/presets-factory' );
	templates = require( 'elementor-templates/manager' );

	// TODO = BC Since 2.3.0
	ajax = elementorCommon.ajax;
	conditions = new ControlConditions();
	history = require( 'elementor/modules/history/assets/js/module' );

	channels = {
		editor: Backbone.Radio.channel( 'ELEMENTOR:editor' ),
		data: Backbone.Radio.channel( 'ELEMENTOR:data' ),
		panelElements: Backbone.Radio.channel( 'ELEMENTOR:panelElements' ),
		dataEditMode: Backbone.Radio.channel( 'ELEMENTOR:editmode' ),
		deviceMode: Backbone.Radio.channel( 'ELEMENTOR:deviceMode' ),
		templates: Backbone.Radio.channel( 'ELEMENTOR:templates' ),
		responsivePreview: Backbone.Radio.channel( 'ELEMENTOR:responsivePreview' ),
	};

	/**
	 * @deprecated since 3.0.0, use `elementorCommon.debug` instead.
	 */
	get debug() {
		elementorDevTools.deprecation.deprecated(
			'elementor.debug',
			'3.0.0',
			'elementorCommon.debug',
		);

		return elementorCommon.debug;
	}

	backgroundClickListeners = {
		tooltip: {
			element: '.dialog-tooltip-widget',
			ignore: '.dialog-widget, .elementor-controls-popover, .pcr-selection',
		},
		popover: {
			element: '.elementor-controls-popover',
			ignore: '.elementor-control-popover-toggle-toggle, .elementor-control-popover-toggle-toggle-label, .select2-container, .pcr-app, .dialog-tooltip-widget',
		},
		globalControlsSelect: {
			element: '.e-global__popover',
			ignore: '.e-global__popover-toggle',
		},
		tagsList: {
			element: '.elementor-tags-list',
			ignore: '.elementor-control-dynamic-switcher',
		},
		panelFooterSubMenus: {
			element: '.elementor-panel-footer-tool.elementor-toggle-state',
			ignore: '.elementor-panel-footer-tool.elementor-toggle-state, #elementor-panel-saver-button-publish-label',
			callback: ( $elementsToHide ) => {
				$elementsToHide.removeClass( 'e-open' );
			},
		},
		panelResponsiveSwitchers: {
			element: '.elementor-control-responsive-switchers',
			callback: ( $elementsToHide ) => {
				$elementsToHide.removeClass( 'elementor-responsive-switchers-open' );
			},
		},
		panelUnitControlSwitchers: {
			element: '.e-units-choices',
			callback: ( $elementsToHide ) => {
				$elementsToHide.removeClass( 'e-units-choices-open' );
			},
		},
		promotion: {
			ignore: '.elementor-responsive-panel',
			callback: () => {
				const dialog = elementor.promotion.dialog;

				if ( dialog ) {
					dialog.hide();
				}
			},
		},
	};

	/**
	 * Exporting modules that can be used externally
	 * TODO: All of the following entries should move to `elementorModules.editor`
	 */
	modules = {
		/**
		 * @deprecated since 2.3.0, use `elementorModules.Module` instead.
		 */
		get Module() {
			elementorDevTools.deprecation.deprecated( 'elementor.modules.Module', '2.3.0', 'elementorModules.Module' );

			return elementorModules.Module;
		},
		components: {
			templateLibrary: {
				views: {
					/**
					 * @deprecated since 2.4.0, use `lementorModules.common.views.modal.Layout` instead.
					 */
					get BaseModalLayout() {
						elementorDevTools.deprecation.deprecated( 'elementor.modules.components.templateLibrary.views.BaseModalLayout', '2.4.0', 'elementorModules.common.views.modal.Layout' );

						return elementorModules.common.views.modal.Layout;
					},
				},
			},
			saver: {
				behaviors: {
					FooterSaver: require( './document/save/behaviors/footer-saver' ),
				},
			},
		},
		saver: {
			/**
			 * @deprecated since 2.9.0, use `elementor.modules.components.saver.behaviors.FooterSaver` instead.
			 */
			get footerBehavior() {
				elementorDevTools.deprecation.deprecated( 'elementor.modules.saver.footerBehavior.',
					'2.9.0',
					'elementor.modules.components.saver.behaviors.FooterSaver' );

				return elementor.modules.components.saver.behaviors.FooterSaver;
			},
		},
		controls: {
			Animation: require( 'elementor-controls/select2' ),
			Base: require( 'elementor-controls/base' ),
			BaseData: require( 'elementor-controls/base-data' ),
			BaseMultiple: require( 'elementor-controls/base-multiple' ),
			Box_shadow: require( 'elementor-controls/box-shadow' ),
			Button: require( 'elementor-controls/button' ),
			Choose: require( 'elementor-controls/choose' ),
			Code: require( 'elementor-controls/code' ),
			Color: ColorControl,
			Date_time: DateTimeControl,
			Dimensions: require( 'elementor-controls/dimensions' ),
			Exit_animation: require( 'elementor-controls/select2' ),
			Font: require( 'elementor-controls/font' ),
			Gaps: require( 'elementor-controls/gaps' ),
			Gallery: require( 'elementor-controls/gallery' ),
			Hidden: require( 'elementor-controls/hidden' ),
			Hover_animation: require( 'elementor-controls/select2' ),
			Icon: require( 'elementor-controls/icon' ),
			Icons: require( 'elementor-controls/icons' ),
			Image_dimensions: require( 'elementor-controls/image-dimensions' ),
			Media: require( 'elementor-controls/media' ),
			Notice: require( 'elementor-controls/notice' ),
			Number: require( 'elementor-controls/number' ),
			Popover_toggle: PopoverToggleControl,
			Repeater: require( 'elementor-controls/repeater' ),
			RepeaterRow: require( 'elementor-controls/repeater-row' ),
			Section: require( 'elementor-controls/section' ),
			Select: require( 'elementor-controls/select' ),
			Select2: require( 'elementor-controls/select2' ),
			Slider: require( 'elementor-controls/slider' ),
			Structure: require( 'elementor-controls/structure' ),
			Switcher: require( 'elementor-controls/switcher' ),
			Tab: require( 'elementor-controls/tab' ),
			Text_shadow: require( 'elementor-controls/box-shadow' ),
			Url: require( 'elementor-controls/url' ),
			Wp_widget: require( 'elementor-controls/wp_widget' ),
			Wysiwyg: require( 'elementor-controls/wysiwyg' ),
		},
		elements: {
			types: {
				Base: ElementBase,
				... elementTypes,
			},
			models: {
				/**
				 * @deprecated since 2.4.0, use `elementorModules.editor.elements.models.BaseSettings` instead.
				 */
				get BaseSettings() {
					elementorDevTools.deprecation.deprecated( 'elementor.modules.elements.models.BaseSettings', '2.4.0', 'elementorModules.editor.elements.models.BaseSettings' );

					return elementorModules.editor.elements.models.BaseSettings;
				},
				Element: require( 'elementor-elements/models/element' ),
			},
			views: {
				BaseElement: require( 'elementor-elements/views/base' ),
				BaseWidget: require( 'elementor-elements/views/base-widget' ),
				Widget: require( 'elementor-elements/views/widget' ),
			},
		},
		layouts: {
			panel: {
				pages: {
					elements: {
						views: {
							Global: require( 'elementor-panel/pages/elements/views/global' ),
							Elements: require( 'elementor-panel/pages/elements/views/elements' ),
						},
					},
					menu: {
						Menu: PanelMenu,
					},
				},
			},
		},
		views: {
			/**
			 * @deprecated since 2.4.0, use `elementorModules.editor.views.ControlsStack` instead.
			 */
			get ControlsStack() {
				elementorDevTools.deprecation.deprecated( 'elementor.modules.views.ControlsStack', '2.4.0', 'elementorModules.editor.views.ControlsStack' );

				return elementorModules.editor.views.ControlsStack;
			},
		},
	};

	userCan( capability ) {
		return -1 === this.config.user.restrictions.indexOf( capability );
	}

	addControlView( controlID, ControlView ) {
		this.modules.controls[ elementorCommon.helpers.upperCaseWords( controlID ) ] = ControlView;
	}

	checkEnvCompatibility() {
		return environment.firefox || environment.webkit;
	}

	getElementData( model ) {
		const elType = model.get( 'elType' );

		if ( 'widget' === elType ) {
			const widgetType = model.get( 'widgetType' );

			if ( ! this.widgetsCache[ widgetType ] ) {
				return false;
			}

			if ( ! this.widgetsCache[ widgetType ].commonMerged && ! this.widgetsCache[ widgetType ].atomic_controls ) {
				jQuery.extend( this.widgetsCache[ widgetType ].controls, this.widgetsCache.common.controls );

				if ( ! this.widgetsCache[ widgetType ].has_widget_inner_wrapper && elementorCommon.config.experimentalFeatures.e_optimized_markup ) {
					jQuery.extend( this.widgetsCache[ widgetType ].controls, this.widgetsCache[ 'common-optimized' ].controls );
				}

				this.widgetsCache[ widgetType ].controls = elementor.hooks.applyFilters( 'elements/widget/controls/common', this.widgetsCache[ widgetType ].controls, widgetType, this.widgetsCache[ widgetType ] );

				// TODO: Move this code to own file.
				if ( this.widgetsCache[ widgetType ].controls?._element_cache ) {
					let elementCacheDescription = __( 'The default cache status for this element:', 'elementor' );

					elementCacheDescription += ' <strong>';
					if ( this.widgetsCache[ widgetType ]?.is_dynamic_content ) {
						elementCacheDescription += __( 'Inactive', 'elementor' );
					} else {
						elementCacheDescription += __( 'Active', 'elementor' );
					}
					elementCacheDescription += '</strong><br />';
					elementCacheDescription += __( 'Activating cache improves loading times by storing a static version of this element.', 'elementor' );
					elementCacheDescription += ' <a href="https://go.elementor.com/element-caching-help/" target="_blank">' + __( 'Learn more', 'elementor' ) + '</a>.';

					this.widgetsCache[ widgetType ].controls._element_cache.description = elementCacheDescription;
				}
				// TODO: End of code to move.

				this.widgetsCache[ widgetType ].commonMerged = true;
			}

			return this.widgetsCache[ widgetType ];
		}

		if ( ! this.config.elements[ elType ] ) {
			return false;
		}

		const elementConfig = structuredClone( this.config.elements[ elType ] );

		if ( 'section' === elType && model.get( 'isInner' ) ) {
			elementConfig.title = __( 'Inner Section', 'elementor' );
		}

		return elementConfig;
	}

	getElementControls( modelElement ) {
		const elementData = this.getElementData( modelElement );

		if ( ! elementData ) {
			return false;
		}

		const isInner = modelElement.get( 'isInner' ),
			controls = {};

		_.each( elementData.controls, ( controlData, controlKey ) => {
			if ( ( isInner && controlData.hide_in_inner ) || ( ! isInner && controlData.hide_in_top ) ) {
				return;
			}

			controls[ controlKey ] = controlData;
		} );

		return controls;
	}

	mergeControlsSettings( controls ) {
		_.each( controls, ( controlData, controlKey ) => {
			controls[ controlKey ] = jQuery.extend( true, {}, this.config.controls[ controlData.type ], controlData );
		} );

		return controls;
	}

	getControlView( controlID ) {
		const capitalizedControlName = elementorCommon.helpers.upperCaseWords( controlID );
		let View = this.modules.controls[ capitalizedControlName ];

		if ( ! View ) {
			const controlData = this.config.controls[ controlID ],
				isUIControl = controlData && -1 !== controlData.features.indexOf( 'ui' );

			View = this.modules.controls[ isUIControl ? 'Base' : 'BaseData' ];
		}

		return View;
	}

	getPanelView() {
		return this.panel.currentView;
	}

	getPreviewView() {
		return this.previewView;
	}

	/**
	 * @return {Container} container
	 */
	getPreviewContainer() {
		return this.getPreviewView().getContainer();
	}

	getContainer( id ) {
		if ( 'document' === id ) {
			return this.getPreviewContainer();
		}

		return $e.components.get( 'document' ).utils.findContainerById( id );
	}

	initComponents() {
		const EventManager = require( 'elementor-utils/hooks' ),
			DynamicTags = require( 'elementor-dynamic-tags/manager' ),
			Settings = require( 'elementor-editor/components/settings/settings' ),
			Notifications = require( 'elementor-utils/notifications' );

		this.elementsManager = new ElementsManager();

		this.hooks = new EventManager();

		this.selection = new Selection();

		this.settings = new Settings();

		this.dynamicTags = new DynamicTags();

		this.initDialogsManager();

		this.notifications = new Notifications();

		this.kitManager = new KitManager();

		this.hotkeysScreen = new HotkeysScreen();

		this.iconManager = new IconsManager();

		this.noticeBar = new NoticeBar();

		this.favorites = new Favorites();

		this.history = new HistoryManager();

		this.promotion = new Promotion();

		this.browserImport = new BrowserImport();

		this.introductionTooltips = new IntroductionTooltipsManager();

		this.editorEvents = new EditorEvents();

		this.documents = $e.components.register( new EditorDocuments() );

		// Adds the Landing Page tab to the Template library modal when editing Landing Pages.
		if ( elementorCommon.config.experimentalFeatures[ 'landing-pages' ] ) {
			this.modules.landingLibraryPageModule = new LandingPageLibraryModule();
		}

		if ( elementorCommon.config.experimentalFeatures.container ) {
			this.modules.floatingButtonsLibraryModule = new FloatingButtonsLibraryModule();
		}

		this.modules.linkInBioLibraryModule = new LinkInBioLibraryModule();

		this.modules.floatingBarsLibraryModule = new FloatingBarsLibraryModule();

		this.modules.elementsColorPicker = new ElementsColorPicker();

		this.modules.promotionModule = new PromotionModule();

		// TODO: Move to elementor:init-data-components
		$e.components.register( new DataGlobalsComponent() );

		$e.components.register( new DocumentComponent() );

		$e.components.register( new PreviewComponent() );

		// TODO: Remove, BC Since 2.9.0.
		elementor.saver = $e.components.get( 'document/save' );

		new FontVariables();

		Events.dispatch( elementorCommon.elements.$window, 'elementor/init-components', null, 'elementor:init-components' );
	}

	/**
	 * Toggle sortable state globally.
	 *
	 * @param {boolean} state
	 */
	toggleSortableState( state = true ) {
		const sections = [
			jQuery( '#elementor-navigator' ),
			elementor.documents.getCurrent()?.$element,
		];

		for ( const $section of sections ) {
			if ( $section ) {
				$section.find( '.ui-sortable' ).each( () => {
					const $element = jQuery( this );

					if ( $element.sortable( 'instance' ) ) {
						$element.sortable( state ? 'enable' : 'disable' );
					}
				} );
			}
		}
	}

	// TODO: BC method since 2.3.0
	initDialogsManager() {
		this.dialogsManager = elementorCommon.dialogsManager;
	}

	initElements() {
		let config = this.config.document.elements;

		// If it's an reload, use the not-saved data
		if ( this.elements && this.elements.length && this.config.document.id === this.config.initial_document.id ) {
			config = this.elements.toJSON();
		}

		this.elements = this.createBackboneElementsCollection( config );

		this.elementsModel = this.createBackboneElementsModel( this.elements );
	}

	createBackboneElementsCollection( json ) {
		const ElementCollection = require( 'elementor-elements/collections/elements' );

		return new ElementCollection( json );
	}

	createBackboneElementsModel( elementsCollection ) {
		return new Backbone.Model( {
			elements: elementsCollection,
		} );
	}

	initPreview() {
		const $ = jQuery,
			previewIframeId = 'elementor-preview-iframe';

		this.$previewWrapper = $( '#elementor-preview' );

		this.$previewResponsiveWrapper = $( '#elementor-preview-responsive-wrapper' );

		// Make sure the iFrame does not exist.
		if ( ! this.$preview ) {
			this.$preview = $( '<iframe>', {
				id: previewIframeId,
				src: this.config.initial_document.urls.preview,
				title: __( 'Preview', 'elementor' ),
				allowfullscreen: 1,
			} );

			this.$previewResponsiveWrapper.append( this.$preview );
		}

		this.$preview.on( 'load', this.onPreviewLoaded.bind( this ) );
	}

	initPreviewView( document ) {
		elementor.trigger( 'document:before:preview', document );

		this.previewView = this.createPreviewView( document.$element[ 0 ],	elementor.elementsModel );

		this.renderPreview( this.previewView );
	}

	createPreviewView( targetElement, model, config = {} ) {
		const preview = new Preview( {
			el: targetElement,
			model,
		} );

		preview.setConfig( config );

		preview.$el.empty();

		return preview;
	}

	renderPreview( preview ) {
		// In order to force rendering of children
		preview.isRendered = true;

		preview._renderChildren();

		preview.triggerMethod( 'render' );
	}

	initFrontend() {
		const frontendWindow = this.$preview[ 0 ].contentWindow;

		window.elementorFrontend = frontendWindow.elementorFrontend;

		frontendWindow.elementor = this;

		frontendWindow.elementorCommon = elementorCommon;

		elementorFrontend.init();

		this.trigger( 'frontend:init' );
	}

	initClearPageDialog() {
		let dialog;

		this.getClearPageDialog = () => {
			if ( dialog ) {
				return dialog;
			}

			dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-clear-page-dialog',
				headerMessage: __( 'Delete All Content', 'elementor' ),
				message: __( 'Attention: We are going to DELETE ALL CONTENT from this page. Are you sure you want to do that?', 'elementor' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: __( 'Delete', 'elementor' ),
					cancel: __( 'Cancel', 'elementor' ),
				},
				onConfirm: () => $e.run( 'document/elements/empty', { force: true } ),
			} );

			return dialog;
		};
	}

	getCurrentElement() {
		// eslint-disable-next-line @wordpress/no-global-active-element
		const isPreview = ( -1 !== [ 'BODY', 'IFRAME' ].indexOf( document.activeElement.tagName ) && 'BODY' === elementorFrontend.elements.window.document.activeElement.tagName );

		if ( ! isPreview ) {
			return false;
		}

		let targetElement = elementor.channels.editor.request( 'contextMenu:targetView' );

		if ( ! targetElement ) {
			const panel = elementor.getPanelView();

			if ( $e.routes.isPartOf( 'panel/editor' ) ) {
				targetElement = panel.getCurrentPageView().getOption( 'editedElementView' );
			}
		}

		if ( ! targetElement ) {
			targetElement = elementor.getPreviewView();
		}

		return targetElement;
	}

	initPanel() {
		this.addRegions( { panel: require( 'elementor-regions/panel/panel' ) } );

		window.dispatchEvent( new CustomEvent( 'elementor/panel/init' ) );

		this.trigger( 'panel:init' );
	}

	initNavigator() {
		if ( ! $e.components.get( 'document/elements' ).utils.showNavigator() ) {
			return;
		}

		this.addRegions( {
			navigator: {
				el: '#elementor-navigator',
				regionClass: Navigator,
			},
		} );

		this.trigger( 'navigator:init' );
	}

	setAjax() {
		elementorCommon.ajax.addRequestConstant( 'editor_post_id', this.config.document.id );
		elementorCommon.ajax.addRequestConstant( 'initial_document_id', this.config.initial_document.id );

		elementorCommon.ajax.on( 'request:unhandledError', ( xmlHttpRequest ) => {
			elementor.notifications.showToast( {
				message: elementor.createAjaxErrorMessage( xmlHttpRequest ),
			} );
		} );
	}

	createAjaxErrorMessage( xmlHttpRequest ) {
		let message;

		if ( 4 === xmlHttpRequest.readyState ) {
			message = __( 'Server Error', 'elementor' );

			if ( 200 !== xmlHttpRequest.status ) {
				message += ' (' + xmlHttpRequest.status + ' ' + xmlHttpRequest.statusText + ')';
			}
		} else if ( 0 === xmlHttpRequest.readyState ) {
			message = __( 'Connection Lost', 'elementor' );
		} else {
			message = __( 'Unknown Error', 'elementor' );
		}

		return message + '.';
	}

	activatePreviewResizable() {
		const $responsiveWrapper = this.$previewResponsiveWrapper;

		if ( $responsiveWrapper.resizable( 'instance' ) ) {
			return;
		}

		$responsiveWrapper.resizable( {
			handles: 'e, s, w',
			stop: () => {
				$responsiveWrapper.css( { width: '', height: '', left: '', right: '', top: '', bottom: '' } );
			},
			resize: ( event, ui ) => {
				$responsiveWrapper.css( {
					right: '0',
					left: '0',
					top: '0',
					bottom: '0',
				} );

				// Old versions of jQuery don't support custom properties
				const style = $responsiveWrapper[ 0 ].style;

				style.setProperty( '--e-editor-preview-width', ui.size.width + 'px' );
				style.setProperty( '--e-editor-preview-height', ui.size.height + 'px' );
			},
		} );
	}

	destroyPreviewResizable() {
		if ( this.$previewResponsiveWrapper.resizable( 'instance' ) ) {
			this.$previewResponsiveWrapper.resizable( 'destroy' );
		}
	}

	broadcastPreviewResize() {
		this.channels.responsivePreview
			.reply( 'size', {
				width: this.$preview.innerWidth(),
				height: this.$preview.innerHeight(),
			} )
			.trigger( 'resize' );
	}

	getCurrentDeviceConstrains() {
		const currentBreakpoint = elementor.channels.deviceMode.request( 'currentMode' ),
			{ activeBreakpoints } = elementorFrontend.config.responsive,
			currentBreakpointData = activeBreakpoints[ currentBreakpoint ],
			currentBreakpointMaxPoint = ( 'widescreen' === currentBreakpoint ) ? 9999 : currentBreakpointData.value;

		let currentBreakpointMinPoint = this.breakpoints.getDeviceMinBreakpoint( currentBreakpoint );

		// If the device under the current device mode's breakpoint has a larger max value - use the current device's
		// value as the min width point.
		if ( currentBreakpointMinPoint > currentBreakpointData.value ) {
			currentBreakpointMinPoint = currentBreakpointData.value;
		}

		return {
			maxWidth: currentBreakpointMaxPoint,
			minWidth: currentBreakpointMinPoint,
		};
	}

	getBreakpointResizeOptions( currentBreakpoint ) {
		const previewHeight = elementor.$previewWrapper.height() - 80, // 80 = responsive bar height + ui-resizable-handle
			specialBreakpointsHeights = {
				mobile: {
					minHeight: 480,
					height: 736,
					width: 360,
					maxHeight: 896,
				},
				mobile_extra: {
					minHeight: 480,
					height: 736,
					maxHeight: 896,
				},
				tablet: {
					minHeight: 320,
					height: previewHeight,
					maxHeight: 1024,
				},
				tablet_extra: {
					minHeight: 320,
					height: previewHeight,
					maxHeight: 1024,
				},
				laptop: {
					minHeight: 320,
					height: previewHeight,
					maxHeight: 1024,
				},
				widescreen: {
					minHeight: 320,
					height: previewHeight,
					maxHeight: 1200,
				},
			};

		let deviceConstrains = this.getCurrentDeviceConstrains();

		if ( specialBreakpointsHeights[ currentBreakpoint ] ) {
			deviceConstrains = { ...deviceConstrains, ...specialBreakpointsHeights[ currentBreakpoint ] };
		}

		return deviceConstrains;
	}

	updatePreviewResizeOptions( preserveCurrentSize = false ) {
		const $responsiveWrapper = this.$previewResponsiveWrapper,
			currentBreakpoint = elementor.channels.deviceMode.request( 'currentMode' );

		if ( 'desktop' === currentBreakpoint ) {
			this.destroyPreviewResizable();

			// Old versions of jQuery don't support custom properties
			const style = $responsiveWrapper[ 0 ].style;

			style.setProperty( '--e-editor-preview-width', '' );
			style.setProperty( '--e-editor-preview-height', '' );
		} else {
			this.activatePreviewResizable();

			const breakpointResizeOptions = this.getBreakpointResizeOptions( currentBreakpoint );

			let widthToShow = breakpointResizeOptions.width ?? breakpointResizeOptions.minWidth;

			if ( preserveCurrentSize ) {
				const currentSize = elementor.channels.responsivePreview.request( 'size' );

				if ( currentSize.width > breakpointResizeOptions.maxWidth ) {
					widthToShow = breakpointResizeOptions.maxWidth;
				} else if ( currentSize.width >= breakpointResizeOptions.minWidth ) {
					widthToShow = currentSize.width;
				}
			}

			$responsiveWrapper.resizable( 'option', { ...breakpointResizeOptions } );

			// Old versions of jQuery don't support custom properties
			const style = $responsiveWrapper[ 0 ].style;

			style.setProperty( '--e-editor-preview-width', widthToShow + 'px' );
			style.setProperty( '--e-editor-preview-height', breakpointResizeOptions.height + 'px' );
		}
	}

	preventClicksInsideEditor() {
		this.$previewContents.on( 'submit', ( event ) =>
			event.preventDefault(),
		);

		// Cannot use arrow function here since it use `this.contains`.
		this.$previewContents.on( 'click', function( event ) {
			const $target = jQuery( event.target ),
				isClickInsideElementor = !! $target.closest( '.elementor-edit-area, .pen-menu' ).length,
				isTargetInsideDocument = this.contains( $target[ 0 ] );

			if ( $target.closest( 'a:not(.elementor-clickable)' ).length ) {
				event.preventDefault();
			}

			if ( ( isClickInsideElementor && elementor.getPreviewContainer().isEditable() ) || ! isTargetInsideDocument ) {
				return;
			}

			// It's a click on the preview area, not in the edit area,
			// and a document is open and has an edit area.
			if ( ! isClickInsideElementor && elementor.documents.getCurrent()?.$element ) {
				$e.run( 'document/elements/deselect-all' );
			}
		} );
	}

	addBackgroundClickArea( element ) {
		element.addEventListener( 'click', this.onBackgroundClick.bind( this ), true );
	}

	addBackgroundClickListener( key, listener ) {
		this.backgroundClickListeners[ key ] = listener;
	}

	removeBackgroundClickListener( key ) {
		delete this.backgroundClickListeners[ key ];
	}

	showFatalErrorDialog( options ) {
		const defaultOptions = {
			id: 'elementor-fatal-error-dialog',
			headerMessage: '',
			message: '',
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: __( 'Learn More', 'elementor' ),
				cancel: __( 'Go Back', 'elementor' ),
			},
			onConfirm: null,
			onCancel: () => parent.history.go( -1 ),
			hide: {
				onBackgroundClick: false,
				onButtonClick: false,
			},
		};

		options = jQuery.extend( true, defaultOptions, options );

		elementorCommon.dialogsManager.createWidget( 'confirm', options ).show();
	}

	showFlexBoxAttentionDialog() {
		const introduction = new elementorModules.editor.utils.Introduction( {
			introductionKey: 'flexbox',
			dialogType: 'confirm',
			dialogOptions: {
				id: 'elementor-flexbox-attention-dialog',
				headerMessage: __( 'Note: Flexbox Changes', 'elementor' ),
				message: __( 'Elementor 2.5 introduces key changes to the layout using CSS Flexbox. Your existing pages might have been affected, please review your page before publishing.', 'elementor' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: __( 'Learn More', 'elementor' ),
					cancel: __( 'Got It', 'elementor' ),
				},
				hide: {
					onButtonClick: false,
				},
				onCancel: () => {
					introduction.setViewed();

					introduction.getDialog().hide();
				},
				onConfirm: () => open( this.config.help_flexbox_bc_url, '_blank' ),
			},
		} );

		introduction.show();
	}

	checkPageStatus() {
		if ( elementor.documents.getCurrent().isDraft() ) {
			this.notifications.showToast( {
				message: __( 'This is just a draft. Play around and when you\'re done - click update.', 'elementor' ),
				buttons: [
					{
						name: 'view_revisions',
						text: __( 'View All Revisions', 'elementor' ),
						callback: () => $e.route( 'panel/history/revisions' ),
					},
				],
			} );
		}
	}

	enterDeviceMode() {
		this.channels.responsivePreview.trigger( 'open' );

		elementorCommon.elements.$body.addClass( 'e-is-device-mode' );

		this.activatePreviewResizable();

		this.resizeListenerThrottled = false;

		this.broadcastPreviewResize();

		elementorFrontend.elements.$window.on( 'resize.deviceModeDesktop', () => {
			if ( this.resizeListenerThrottled ) {
				return;
			}

			this.resizeListenerThrottled = true;

			this.broadcastPreviewResize();

			setTimeout( () => {
				this.resizeListenerThrottled = false;

				this.broadcastPreviewResize();
			}, 300 );
		} );
	}

	exitDeviceMode() {
		elementorCommon.elements.$body.removeClass( 'e-is-device-mode' );

		this.destroyPreviewResizable();

		elementorCommon.elements.$window.off( 'resize.deviceModeDesktop' );

		this.channels.deviceMode.trigger( 'close' );
	}

	isDeviceModeActive() {
		return elementorCommon.elements.$body.hasClass( 'e-is-device-mode' );
	}

	updatePreviewSize( size ) {
		// Old versions of jQuery don't support custom properties
		const style = this.$previewResponsiveWrapper[ 0 ].style;

		style.setProperty( '--e-editor-preview-width', size.width + 'px' );
		style.setProperty( '--e-editor-preview-height', size.height + 'px' );
	}

	enterPreviewMode( hidePanel ) {
		let $elements = elementorFrontend.elements.$body;

		if ( hidePanel ) {
			$elements = $elements.add( elementorCommon.elements.$body );
		}

		$elements
			.removeClass( 'elementor-editor-active' )
			.addClass( 'elementor-editor-preview' );

		const $element = this.documents.getCurrent().$element;

		if ( $element ) {
			$element.removeClass( 'elementor-edit-area-active' );
		}
	}

	exitPreviewMode() {
		elementorFrontend.elements.$body.add( elementorCommon.elements.$body )
			.removeClass( 'elementor-editor-preview' )
			.addClass( 'elementor-editor-active' );

		if ( elementor.config.document.panel.has_elements ) {
			this.documents.getCurrent().$element.addClass( 'elementor-edit-area-active' );
		}
	}

	changeEditMode( newMode ) {
		const dataEditMode = elementor.channels.dataEditMode,
			oldEditMode = dataEditMode.request( 'activeMode' );

		dataEditMode.reply( 'activeMode', newMode );

		if ( newMode !== oldEditMode ) {
			dataEditMode.trigger( 'switch', newMode );
		}
	}

	reloadPreview() {
		// TODO: Should be command?
		jQuery( '#elementor-preview-loading' ).show();

		this.$preview[ 0 ].src = this.config.initial_document.urls.preview;
	}

	changeDeviceMode( newDeviceMode, hideBarOnDesktop = true ) {
		const oldDeviceMode = this.channels.deviceMode.request( 'currentMode' );

		if ( oldDeviceMode === newDeviceMode ) {
			return;
		}

		elementorCommon.elements.$body
			.removeClass( 'elementor-device-' + oldDeviceMode )
			.addClass( 'elementor-device-' + newDeviceMode );

		this.channels.deviceMode
			.reply( 'previousMode', oldDeviceMode )
			.reply( 'currentMode', newDeviceMode )
			.trigger( 'change' );

		if ( this.isDeviceModeActive() && hideBarOnDesktop ) {
			if ( 'desktop' === newDeviceMode ) {
				this.exitDeviceMode();
			}
		} else if ( 'desktop' !== newDeviceMode ) {
			this.enterDeviceMode();
		}

		dispatchEvent( new CustomEvent( 'elementor/device-mode/change', {
			detail: {
				activeMode: newDeviceMode,

			},
		} ) );
	}

	translate( stringKey, templateArgs, i18nStack ) {
		// TODO: BC since 2.3.0, it always should be `this.config.i18n`
		if ( ! i18nStack ) {
			i18nStack = this.config.i18n;
		}

		return elementorCommon.translate( stringKey, null, templateArgs, i18nStack );
	}

	requestWidgetsConfig() {
		const excludeWidgets = {};

		jQuery.each( this.widgetsCache, ( widgetName, widgetConfig ) => {
			if ( widgetConfig.controls ) {
				excludeWidgets[ widgetName ] = true;
			}
		} );

		elementorCommon.ajax.addRequest( 'get_widgets_config', {
			data: {
				exclude: excludeWidgets,
			},
			success: ( data ) => {
				this.addWidgetsCache( data );

				if ( elementor.config.locale !== elementor.config.user.locale ) {
					this.translateControlsDefaults( elementor.config.locale );
				}

				if ( this.loaded ) {
					this.kitManager.renderGlobalsDefaultCSS();

					$e.internal( 'panel/state-ready' );
				} else {
					this.once( 'panel:init', () => {
						$e.internal( 'panel/state-ready' );
					} );
				}
			},
		} );
	}

	translateControlsDefaults( locale ) {
		elementorCommon.ajax.addRequest( 'get_widgets_default_value_translations', {
			data: { locale },
			success: ( data ) => {
				this.addWidgetsCache( data );
			},
		}, true );
	}

	getPreferences( key ) {
		const settings = elementor.settings.editorPreferences.model.attributes;

		if ( key ) {
			return settings[ key ];
		}

		return settings;
	}

	getConfig() {
		return ElementorConfig;
	}

	onStart() {
		this.config = this.getConfig();

		Backbone.Radio.DEBUG = false;
		Backbone.Radio.tuneIn( 'ELEMENTOR' );

		this.populateActiveBreakpointsConfig();

		this.breakpoints = new Breakpoints( this.config.responsive );

		if ( elementorCommon.config.experimentalFeatures.additional_custom_breakpoints ) {
			// Duplicate responsive controls for section and column default configs.
			this.generateResponsiveControlsForElements();
		}

		this.elementsManager = new ElementsManager();

		this.initComponents();

		if ( ! this.checkEnvCompatibility() ) {
			this.onEnvNotCompatible();
		}

		this.initPreview();

		this.requestWidgetsConfig();

		this.channels.dataEditMode.reply( 'activeMode', 'edit' );

		this.listenTo( this.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		this.listenTo( elementor.channels.deviceMode, 'change', this.updatePreviewResizeOptions );

		this.initClearPageDialog();

		this.addBackgroundClickArea( document );

		this.addDeprecatedConfigProperties();

		Events.dispatch( elementorCommon.elements.$window, 'elementor/loaded', null, 'elementor:loaded' );

		$e.run( 'editor/documents/open', { id: this.config.initial_document.id } )
			.then( () => {
				Events.dispatch( elementorCommon.elements.$window, 'elementor/init', null, 'elementor:init' );
				this.initNavigator();
			} );
	}

	onPreviewLoaded() {
		const previewWindow = this.$preview[ 0 ].contentWindow;

		if ( ! previewWindow.elementorFrontend ) {
			this.onPreviewLoadingError();

			return;
		}

		// Cannot load editor without kit.
		if ( ! elementor.config.kit_id ) {
			this.kitNotExistsError();

			return;
		}

		this.$previewContents = this.$preview.contents();

		this.initFrontend();

		this.preventClicksInsideEditor();

		this.addBackgroundClickArea( elementorFrontend.elements.window.document );

		if ( ! this.previewLoadedOnce ) {
			this.onFirstPreviewLoaded();
		}

		this.$previewContents.children().addClass( 'elementor-html' );

		const $frontendBody = elementorFrontend.elements.$body;

		$frontendBody.addClass( 'elementor-editor-active' );

		if ( ! elementor.userCan( 'design' ) ) {
			$frontendBody.addClass( 'elementor-editor-content-only' );
		}

		this.changeDeviceMode( 'desktop' );

		_.defer( function() {
			elementorFrontend.elements.window.jQuery.holdReady( false );
		} );

		$e.shortcuts.bindListener( elementorFrontend.elements.$window );

		this.trigger( 'preview:loaded', ! this.loaded /* IsFirst */ );

		$e.internal( 'editor/documents/attach-preview' ).then( () => jQuery( '#elementor-loading, #elementor-preview-loading' ).fadeOut( 600 ) );

		this.loaded = true;
	}

	onFirstPreviewLoaded() {
		this.initPanel();

		this.previewLoadedOnce = true;
	}

	onEditModeSwitched() {
		const activeMode = this.channels.dataEditMode.request( 'activeMode' );

		dispatchEvent( new CustomEvent( 'elementor/edit-mode/change', {
			detail: {
				activeMode,
			},
		} ) );

		if ( 'edit' === activeMode ) {
			this.exitPreviewMode();
		} else {
			this.enterPreviewMode( 'preview' === activeMode );
		}
	}

	onEnvNotCompatible() {
		this.showFatalErrorDialog( {
			headerMessage: __( 'Your browser isn\'t compatible', 'elementor' ),
			message: __( 'Your browser isn\'t compatible with all of Elementor\'s editing features. We recommend you switch to another browser like Chrome or Firefox.', 'elementor' ),
			strings: {
				confirm: __( 'Proceed Anyway', 'elementor' ),
			},
			hide: {
				onButtonClick: true,
			},
			onConfirm: () => this.hide(),
		} );
	}

	kitNotExistsError() {
		this.showFatalErrorDialog( {
			className: 'elementor-preview-loading-error',
			headerMessage: __( 'Your site doesn\'t have a default kit', 'elementor' ),
			message: __( 'Seems like your kit was deleted, please create new one or try restore it from trash.', 'elementor' ),
			strings: {
				confirm: __( 'Recreate Kit', 'elementor' ),
				cancel: __( 'Go Back', 'elementor' ),
			},
			onConfirm: () => open( elementor.config.admin_tools_url, '_blank' ),
		} );
	}

	onPreviewLoadingError() {
		const debugUrl = this.config.document.urls.preview + '&preview-debug',
			previewDebugLinkText = __( 'Click here for preview debug', 'elementor' ),
			previewDebugLink = '<div id="elementor-preview-debug-link-text"><a href="' + debugUrl + '" target="_blank">' + previewDebugLinkText + '</a></div>',
			debugData = elementor.config.preview.debug_data,
			dialogOptions = {
				className: 'elementor-preview-loading-error',
				headerMessage: debugData.header,
				message: debugData.message + previewDebugLink,
				onConfirm: () => open( debugData.doc_url, '_blank' ),
			};

		if ( debugData.error ) {
			this.showFatalErrorDialog( dialogOptions );
			return;
		}

		jQuery.get( debugUrl, () => {
			this.showFatalErrorDialog( dialogOptions );
		} ).fail( ( response ) => { // Iframe can't be loaded
			this.showFatalErrorDialog( {
				className: 'elementor-preview-loading-error',
				headerMessage: debugData.header,
				message: response.statusText + ' ' + response.status + ' ' + previewDebugLink,
				onConfirm: () => {
					const url = 500 <= response.status ? elementor.config.preview.help_preview_http_error_500_url : elementor.config.preview.help_preview_http_error_url;
					open( url, '_blank' );
				},
			} );
		} );
	}

	onPreviewElNotFound() {
		let args = this.$preview[ 0 ].contentWindow.elementorPreviewErrorArgs;

		if ( ! args ) {
			args = {
				headerMessage: __( 'Sorry, the content area was not found in your page.', 'elementor' ),
				message: __( 'You must call \'the_content\' function in the current template, in order for Elementor to work on this page.', 'elementor' ),
				confirmURL: elementor.config.help_the_content_url,
			};
		}

		args.onConfirm = () => open( args.confirmURL, '_blank' );

		this.showFatalErrorDialog( args );
	}

	onBackgroundClick( event ) {
		jQuery.each( this.backgroundClickListeners, ( index, config ) => {
			let $clickedTarget = jQuery( event.target );
			// If it's a label that associated with an input
			if ( $clickedTarget[ 0 ].control ) {
				$clickedTarget = $clickedTarget.add( $clickedTarget[ 0 ].control );
			}

			if ( config.ignore && $clickedTarget.closest( config.ignore ).length ) {
				return;
			}

			const $clickedTargetClosestElement = $clickedTarget.closest( config.element ),
				$elementsToHide = jQuery( config.element ).not( $clickedTargetClosestElement );

			if ( config.callback ) {
				config.callback( $elementsToHide );
				return;
			}

			$elementsToHide.each( ( elementIndex, element ) => {
				const $element = jQuery( element );
				const isVisible = $element.is( ':visible' );

				$element.hide();

				if ( isVisible ) {
					$element.trigger( 'hide' );
				}
			} );
		} );
	}

	compileTemplate( template, data ) {
		return Marionette.TemplateCache.prototype.compileTemplate( template )( data );
	}

	addWidgetsCache( widgets ) {
		jQuery.each( widgets, ( widgetName, widgetConfig ) => {
			if ( elementorCommon.config.experimentalFeatures.additional_custom_breakpoints ) {
				// When the Responsive Optimization experiment is active, the responsive controls are generated on the
				// JS side instead of the PHP.
				widgetConfig.controls = this.generateResponsiveControls( widgetConfig.controls );
			}

			this.widgetsCache[ widgetName ] = jQuery.extend( true, {}, this.widgetsCache[ widgetName ], widgetConfig );
		} );
	}

	generateResponsiveControls( controls ) {
		const { activeBreakpoints } = this.config.responsive,
			devices = this.breakpoints.getActiveBreakpointsList( { largeToSmall: true, withDesktop: true } ),
			newControlsStack = {},
			secondDesktopChild = devices[ devices.indexOf( 'desktop' ) + 1 ];

		// Set the desktop to be the first device, so desktop will the the parent of all devices.
		devices.unshift(
			devices.splice( devices.indexOf( 'desktop' ), 1 )[ 0 ],
		);

		jQuery.each( controls, ( controlName, controlConfig ) => {
			let responsiveControlName,
				controlDevices;

			// Handle repeater controls.
			if ( 'object' === typeof controlConfig.fields ) {
				controlConfig.fields = this.generateResponsiveControls( controlConfig.fields );
			}

			// Only handle responsive controls in this loop.
			if ( ! controlConfig.is_responsive ) {
				newControlsStack[ controlName ] = controlConfig;

				return;
			}

			if ( controlConfig.responsive?.devices ) {
				// Because of an `array_intersect` that happens on the PHP side, the devices array can become an object.
				if ( 'object' === typeof controlConfig.responsive.devices ) {
					controlConfig.responsive.devices = Object.values( controlConfig.responsive.devices );
				}

				// Filter the devices list according to the control's passed devices list.
				controlDevices = devices.filter( ( device ) => controlConfig.responsive.devices.includes( device ) );

				delete controlConfig.responsive.devices;
			}

			const popoverEndProperty = controlConfig.popover?.end;

			// Since the `popoverEndProperty` variable now holds the value, we want to prevent this property from
			// being duplicated to all responsive control instances. It should only be applied in the LAST responsive
			// control.
			if ( popoverEndProperty ) {
				delete controlConfig.popover?.end;
			}

			// Move the control's default to the desktop control
			if ( controlConfig.default ) {
				controlConfig.desktop_default = controlConfig.default;
			}

			const multipleDefaultValue = this.config.controls[ controlConfig.type ].default_value;

			let deleteControlDefault = true;

			// For multiple controls that implement get_default_value() in the control class, make sure the duplicated
			// controls receive that default value.
			if ( multipleDefaultValue ) {
				controlConfig.default = multipleDefaultValue;

				deleteControlDefault = false;
			}

			// If the control passed its own 'devices' array, run through that. Otherwise, use the default devices list.
			const devicesArrayToDuplicate = controlDevices || devices;

			devicesArrayToDuplicate.forEach( ( device, index ) => {
				let controlArgs = structuredClone( controlConfig );

				if ( controlArgs.device_args ) {
					if ( controlArgs.device_args[ device ] ) {
						controlArgs = { ...controlArgs, ...controlArgs.device_args[ device ] };
					}

					delete controlArgs.device_args;
				}

				// If there is a prefix class with a device modifier in it, add in the device modifier.
				if ( controlArgs.prefix_class && -1 !== controlArgs.prefix_class.indexOf( '%s' ) ) {
					const deviceModifier = 'desktop' === device ? '' : '-' + device;

					controlArgs.prefix_class = controlArgs.prefix_class.replace( '%s', deviceModifier );
				}

				// If the 'responsive' property is empty, it is transferred from the PHP to JS as an array and not an
				// object.
				if ( Array.isArray( controlArgs.responsive ) ) {
					controlArgs.responsive = {};
				}

				let direction = 'max';

				controlArgs.parent = null;

				if ( 'desktop' !== device ) {
					direction = activeBreakpoints[ device ].direction;

					// Set the parent to be the previous device
					controlArgs.parent = device === secondDesktopChild ? controlName : responsiveControlName;
				}

				controlArgs.responsive[ direction ] = device;

				if ( controlArgs.min_affected_device ) {
					if ( controlArgs.min_affected_device[ device ] ) {
						controlArgs.responsive.min = controlArgs.min_affected_device[ device ];
					}

					delete controlArgs.min_affected_device;
				}

				if ( controlArgs[ device + '_default' ] ) {
					if ( 'object' === typeof controlArgs[ device + '_default' ] ) {
						controlArgs.default = { ...controlArgs.default, ...controlArgs[ device + '_default' ] };
					} else {
						controlArgs.default = controlArgs[ device + '_default' ];
					}
				} else if ( deleteControlDefault ) {
					// In the Editor, controls without default values should have an empty string as the default value.
					controlArgs.default = '';
				}

				// If the control is the first inside a popover, only the first device starts the popover,
				// so the 'start' property has to be deleted from all other devices.
				if ( 0 !== index && controlArgs.popover?.start ) {
					delete controlArgs.popover.start;
				}

				// If the control is inside a popover, AND this control is the last one in the popover, AND this is the
				// last device in the devices array - add the 'popover.end = true' value to it to make sure it closes
				// the popover.
				if ( index === ( devicesArrayToDuplicate.length - 1 ) && popoverEndProperty ) {
					controlArgs.popover = {
						end: true,
					};
				}

				// For each new responsive control, delete the responsive defaults
				devicesArrayToDuplicate.forEach( ( breakpoint ) => {
					delete controlArgs[ breakpoint + '_default' ];
				} );

				delete controlArgs.is_responsive;

				responsiveControlName = 'desktop' === device ? controlName : controlName + '_' + device;

				if ( controlArgs.parent ) {
					const parentControlArgs = newControlsStack[ controlArgs.parent ];

					if ( ! parentControlArgs.inheritors ) {
						parentControlArgs.inheritors = [];
					}

					parentControlArgs.inheritors.push( responsiveControlName );
				}

				controlArgs.name = responsiveControlName;

				newControlsStack[ responsiveControlName ] = controlArgs;
			} );
		} );

		return newControlsStack;
	}

	generateResponsiveControlsForElements() {
		// Handle the default config for section and column.
		const elementNames = Object.keys( this.config.elements );

		elementNames.forEach( ( elementName ) => {
			this.config.elements[ elementName ].controls = this.generateResponsiveControls( this.config.elements[ elementName ].controls );
		} );
	}

	populateActiveBreakpointsConfig() {
		this.config.responsive.activeBreakpoints = {};

		Object.entries( this.config.responsive.breakpoints ).forEach( ( [ breakpointKey, breakpointData ] ) => {
			if ( breakpointData.is_enabled ) {
				this.config.responsive.activeBreakpoints[ breakpointKey ] = breakpointData;
			}
		} );
	}

	addDeprecatedConfigProperties() {
		const map = {
			data: {
				replacement: 'elements',
				value: () => elementor.config.document.elements,
			},
			current_user_can_publish: {
				replacement: 'user.can_publish',
				value: () => elementor.config.document.user.can_publish,
			},
			locked_user: {
				replacement: '',
				value: () => elementor.config.document.user.locked,
			},
			revisions_enabled: {
				replacement: 'revisions.enabled',
				value: () => elementor.config.document.revisions.enabled,
			},
			current_revision_id: {
				replacement: 'revisions.current_id',
				value: () => elementor.config.document.revisions.current_id,
			},
		};

		jQuery.each( map, ( key, data ) => {
			// Use `defineProperty` because `get property()` fails during the `Marionette...extend`.
			Object.defineProperty( this.config, key, {
				get() {
					const replacement = data.replacement ? 'elementor.config.document.' + data.replacement : '';
					elementorDevTools.deprecation.deprecated( 'elementor.config.' + key, '2.9.0', replacement );
					// Return from current document.
					return data.value();
				},
				set() {
					elementorDevTools.deprecation.deprecated( 'elementor.config.' + key, '2.9.0', 'elementor.config.document.' + data.replacement );
					throw Error( 'Deprecated' );
				},
			} );
		} );

		Object.defineProperty( this.config.settings, 'page', {
			get() {
				elementorDevTools.deprecation.deprecated( 'elementor.config.settings.page', '2.9.0', 'elementor.config.document.settings' );
				return elementor.config.document.settings;
			},
		} );

		Object.defineProperty( this.config, 'widgets', {
			get() {
				elementorDevTools.deprecation.deprecated( 'elementor.config.widgets', '2.9.0', 'elementor.widgetsCache' );
				return elementor.widgetsCache;
			},
		} );

		Object.defineProperty( this, '$previewElementorEl', {
			get() {
				elementorDevTools.deprecation.deprecated( 'elementor.$previewElementorEl', '2.9.4', 'elementor.documents.getCurrent().$element' );

				return elementor.documents.getCurrent().$element;
			},
		} );
	}

	toggleDocumentCssFiles( document, state ) {
		const selectors = [
				`#elementor-post-${ document.config.id }-css`,
				`#elementor-preview-${ document.config.revisions.current_id }`,
			],
			$files = this.$previewContents.find( selectors.join( ',' ) ),
			type = state ? 'text/css' : 'elementor/disabled-css';

		$files.attr( { type } );
	}
}
