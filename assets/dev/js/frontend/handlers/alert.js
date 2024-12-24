export default class Alert extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				dismissButton: '.elementor-alert-dismiss',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$dismissButton: this.$element.find( selectors.dismissButton ),
		};
	}

	bindEvents() {
		this.elements.$dismissButton.on( 'click', this.onDismissButtonClick.bind( this ) );
	}

	onDismissButtonClick() {
		this.$element.fadeOut();
	}
}

window.elementorModules.frontend.widgets = elementorModules.frontend.widgets || {};
window.elementorModules.frontend.widgets[ 'alert.default' ] = Alert;

