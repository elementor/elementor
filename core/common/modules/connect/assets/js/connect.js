export default class extends elementorModules.ViewModule {
	addPopupPlugin() {
		jQuery.fn.elementorConnect = function( options ) {
			const settings = jQuery.extend( {
				// These are the defaults.
				callback: () => location.reload(),
			}, options );

			this.attr( {
				target: '_blank',
				href: this.attr( 'href' ) + '&mode=popup',
			} );

			elementorCommon.elements.$window.on( 'elementorConnected', settings.callback );

			return this;
		};
	}

	getDefaultSettings() {
		return {
			selectors: {
				connectPopup: '.elementor-connect-popup',
			},
		};
	}

	getDefaultElements() {
		return {
			$connectPopup: jQuery( this.getSettings( 'selectors.connectPopup' ) ),
		};
	}

	applyPopup() {
		this.elements.$connectPopup.elementorConnect();
	}

	onInit() {
		super.onInit();

		this.addPopupPlugin();

		this.applyPopup();
	}
}
