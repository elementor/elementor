import Component from './component';
import PanelView from './panel';
import PanelMenuView from './panel-menu';
import PanelHeaderBehavior from './panel-header-behavior';
import Repeater from './repeater';
import GlobalControlSelect from './globals/global-select-behavior';
import ControlsCSSParser from 'elementor-assets-js/editor/utils/controls-css-parser';

export default class extends elementorModules.editor.utils.Module {
	loadingTriggers = {
		preview: false,
		globals: false,
	};

	/**
	 * @type {ControlsCSSParser}
	 */
	variablesCSS = null;

	addPanelPages() {
		elementor.getPanelView().addPage( 'kit_settings', {
			view: PanelView,
			title: elementor.translate( 'site_settings' ),
		} );

		elementor.getPanelView().addPage( 'kit_menu', {
			view: PanelMenuView,
			title: elementor.translate( 'site_settings' ),
		} );
	}

	addPanelMenuItem() {
		const menu = elementor.modules.layouts.panel.pages.menu.Menu;

		menu.addItem( {
			name: 'global-settings',
			icon: 'eicon-global-settings',
			title: elementor.translate( 'site_settings' ),
			type: 'page',
			callback: () => {
				$e.run( 'panel/global/open', {
					route: $e.routes.getHistory( 'panel' ).reverse()[ 0 ].route,
				} );
			},
		}, 'style', 'editor-preferences' );

		menu.addItem( {
			name: 'site-editor',
			icon: 'eicon-theme-builder',
			title: elementor.translate( 'theme_builder' ),
			type: 'page',
			callback: () => $e.run( 'app/open' ),
		}, 'style', 'editor-preferences' );
	}

	addHeaderBehavior( behaviors ) {
			behaviors.kit = {
				behaviorClass: PanelHeaderBehavior,
			};

			return behaviors;
	}

	addGlobalsBehavior( behaviors, view ) {
		// The view can be a UI control which does not have this method.
		if ( ! view.isGlobalActive ) {
			return;
		}

		const isGlobalActive = view.isGlobalActive();

		if ( 'color' === view.options.model.get( 'type' ) && isGlobalActive ) {
			behaviors.globals = {
				behaviorClass: GlobalControlSelect,
				popoverTitle: elementor.translate( 'global_colors_title' ),
				manageButtonText: elementor.translate( 'manage_global_colors' ),
				tooltipText: elementor.translate( 'global_colors_info' ),
				newGlobalConfirmTitle: elementor.translate( 'create_global_color' ),
			};
		}

		if ( 'popover_toggle' === view.options.model.get( 'type' ) && 'typography' === view.options.model.get( 'groupType' ) && isGlobalActive ) {
			behaviors.globals = {
				behaviorClass: GlobalControlSelect,
				popoverTitle: elementor.translate( 'global_fonts_title' ),
				manageButtonText: elementor.translate( 'manage_global_fonts' ),
				tooltipText: elementor.translate( 'global_fonts_info' ),
				newGlobalConfirmTitle: elementor.translate( 'create_global_font' ),
			};
		}

		return behaviors;
	}

	/**
	 * In case there is a new global color/typography convert current globals to CSS variables.
	 */
	renderGlobalVariables() {
		if ( ! this.variablesCSS ) {
			this.variablesCSS = new ControlsCSSParser( {
				id: 'e-kit-variables',
				settingsModel: new elementorModules.editor.elements.models.BaseSettings( {}, {} ),
			} );
		}

		// The kit document has its own CSS.
		if ( 'kit' === elementor.documents.getCurrent().config.type ) {
			this.variablesCSS.removeStyleFromDocument();
			return;
		}

		$e.data.get( 'globals/index' ).then( ( { data } ) => {
			if ( data.colors ) {
				Object.values( data.colors ).forEach( ( item ) => {
					const controls = elementor.config.kit_config.design_system_controls.colors,
						values = {
							_id: item.id,
							color: item.value,
						};

					this.variablesCSS.addStyleRules( controls, values, controls, [ '{{WRAPPER}}' ], [ 'body' ] );
				} );
			}

			if ( data.typography ) {
				Object.values( data.typography ).forEach( ( item ) => {
					const controls = elementor.config.kit_config.design_system_controls.typography,
						values = {
							_id: item.id,
							...item.value,
						};

					// Enqueue fonts.
					if ( item.value.typography_font_family ) {
						elementor.helpers.enqueueFont( item.value.typography_font_family );
					}

					this.variablesCSS.addStyleRules( controls, values, controls, [ '{{WRAPPER}}' ], [ 'body' ] );
				} );
			}

			this.variablesCSS.addStyleToDocument();
		} );
	}

	// Use the Controls CSS Parser to add the global defaults CSS to the page.
	renderGlobalsDefaultCSS() {
		if ( ! this.loadingTriggers.preview || ! this.loadingTriggers.globals ) {
			return;
		}

		const cssParser = new ControlsCSSParser( {
			id: 'e-global-style',
		} ),
			defaultColorsEnabled = elementor.config.globals.defaults_enabled.colors,
			defaultTypographyEnabled = elementor.config.globals.defaults_enabled.typography;

		// If both default colors and typography are disabled, there is no need to render schemes and default global css.
		if ( ! defaultColorsEnabled && ! defaultTypographyEnabled ) {
			return;
		}

		Object.values( elementor.widgetsCache ).forEach( ( widget ) => {
			if ( ! widget.controls ) {
				return;
			}

			const globalControls = [],
				globalValues = {};

			Object.values( widget.controls ).forEach( ( control ) => {
				const isColorControl = 'color' === control.type,
					isTypographyControl = 'typography' === control.groupType;

				if ( ( isColorControl && ! defaultColorsEnabled ) || ( isTypographyControl && ! defaultTypographyEnabled ) ) {
					return;
				}

				let globalControl = control;

				if ( control.groupType ) {
					globalControl = widget.controls[ control.groupPrefix + control.groupType ];
				}

				if ( control.global?.default ) {
					globalValues[ control.name ] = globalControl.global.default;
				}

				if ( globalControl.global?.default ) {
					globalControls.push( control );
				}
			} );

			globalControls.forEach( ( control ) => {
				cssParser.addControlStyleRules(
					control,
					widget.controls, // values
					widget.controls, // controls
					[ '{{WRAPPER}}' ],
					[ '.elementor-widget-' + widget.widget_type ],
					globalValues
				);
			} );
		} );

		cssParser.addStyleToDocument();
	}

	onInit() {
		super.onInit();

		elementorCommon.elements.$window.on( 'elementor:loaded', () => {
			if ( ! elementor.config.initial_document.panel.support_kit ) {
				return;
			}

			if ( ! elementor.config.user.can_edit_kit ) {
				return;
			}

			$e.components.register( new Component( { manager: this } ) );

			elementor.addControlView( 'global-style-repeater', Repeater );

			elementor.hooks.addFilter( 'panel/header/behaviors', this.addHeaderBehavior );

			elementor.hooks.addFilter( 'controls/base/behaviors', this.addGlobalsBehavior );

			elementor.on( 'preview:loaded', () => {
				this.loadingTriggers.preview = true;

				this.renderGlobalsDefaultCSS();
			} );

			elementor.on( 'document:loaded', () => {
				this.renderGlobalVariables();
			} );

			elementor.once( 'globals:loaded', () => {
				this.loadingTriggers.globals = true;

				this.renderGlobalsDefaultCSS();
			} );

			elementor.on( 'panel:init', () => {
				this.addPanelPages();

				this.addPanelMenuItem();
			} );
		} );
	}
}
