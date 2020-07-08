import Component from './component';
import panelView from './panel';
import panelMenuView from './panel-menu';
import PanelHeaderBehavior from './panel-header-behavior';
import Repeater from './repeater';
import GlobalControlSelect from './globals/global-select-behavior';
import ControlsCSSParser from 'elementor-assets-js/editor/utils/controls-css-parser';

export default class extends elementorModules.editor.utils.Module {
	addPanelPages() {
		elementor.getPanelView().addPage( 'kit_settings', {
			view: panelView,
			title: elementor.translate( 'global_settings' ),
		} );

		elementor.getPanelView().addPage( 'kit_menu', {
			view: panelMenuView,
			title: elementor.translate( 'global_settings' ),
		} );
	}

	addPanelMenuItem() {
		const menu = elementor.modules.layouts.panel.pages.menu.Menu;

		menu.addItem( {
			name: 'global-settings',
			icon: 'eicon-global-settings',
			title: elementor.translate( 'global_settings' ),
			type: 'page',
			callback: () => $e.route( 'panel/global/menu' ),
		}, 'style', 'editor-preferences' );

		menu.addItem( {
			name: 'site-editor',
			icon: 'eicon-theme-builder',
			title: elementor.translate( 'site_editor' ),
			type: 'page',
			callback: () => $e.run( 'panel/global/open-site-editor' ),
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
				popoverTitle: elementor.translate( 'global_typography_title' ),
				manageButtonText: elementor.translate( 'manage_global_typography' ),
				tooltipText: elementor.translate( 'global_typography_info' ),
				newGlobalConfirmTitle: elementor.translate( 'create_global_typography' ),
			};
		}

		return behaviors;
	}

	// Use the Controls CSS Parser to add the global defaults CSS to the page.
	renderGlobalsDefaultCSS() {
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

	refreshKitCssFiles() {
		const $link = elementor.$previewContents.find( `#elementor-post-${ elementor.config.kit_id }-css` ),
			href = $link.attr( 'href' ).split( '?' )[ 0 ];

		$link.attr( { href: `${ href }?ver=${ ( new Date() ).getTime() }` } );
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

			elementor.on( 'preview:loaded', () => this.renderGlobalsDefaultCSS() );

			elementor.on( 'panel:init', () => {
				this.addPanelPages();

				this.addPanelMenuItem();
			} );
		} );
	}
}
