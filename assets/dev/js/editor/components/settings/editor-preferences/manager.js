import BaseManager from '../base/manager';

export default class extends BaseManager {
	getDefaultSettings() {
		return {
			darkModeLinkID: 'elementor-editor-dark-mode-css',
		};
	}

	constructor( ...args ) {
		super( ...args );

		this.changeCallbacks = {
			ui_theme: this.onUIThemeChanged,
			panel_width: this.onPanelWidthChanged,
			edit_buttons: this.onEditButtonsChanged,
			show_hidden_elements: this.onShowHiddenElementsChange,
		};
	}

	onUIThemeChanged( newValue ) {
		const $lightUi = jQuery( '#e-theme-ui-light-css' );
		const $darkUi = jQuery( '#e-theme-ui-dark-css' );

		if ( 'auto' === newValue ) {
			$lightUi.attr( 'media', '(prefers-color-scheme: light)' );
			$darkUi.attr( 'media', '(prefers-color-scheme: dark)' );

			return;
		}

		if ( 'light' === newValue ) {
			$lightUi.attr( 'media', 'all' );
			$darkUi.attr( 'media', 'none' );
		} else {
			$lightUi.attr( 'media', 'none' );
			$darkUi.attr( 'media', 'all' );
		}
	}

	onPanelWidthChanged( newValue ) {
		elementor.panel.saveSize( { width: newValue.size + newValue.unit } );

		elementor.panel.setSize();
	}

	onEditButtonsChanged() {
		// Let the button change before the high-performance action of rendering the entire page
		setTimeout( () => elementor.getPreviewView()._renderChildren(), 300 );
	}

	onShowHiddenElementsChange() {
		elementorFrontend.elements.$body.toggleClass( 'e-preview--show-hidden-elements' );
	}
}
