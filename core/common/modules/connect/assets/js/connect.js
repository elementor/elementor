export default class extends elementorModules.ViewModule {
	addPopupPlugin() {
		let counter = 0;

		jQuery.fn.elementorConnect = function( options ) {
			const settings = jQuery.extend( {
				// These are the defaults.
				success: () => location.reload(),
				error: () => {
					elementor.notifications.showToast( {
						message: __( 'Unable to connect', 'elementor' ),
					} );
				},
			}, options );

			this.each( function() {
				counter++;

				const $this = jQuery( this ),
					callbackId = 'cb' + ( counter );

				$this.attr( {
					target: '_blank',
					href: $this.attr( 'href' ) + '&mode=popup&callback_id=' + callbackId,
				} );

				elementorCommon.elements.$window
					.on( 'elementor/connect/success/' + callbackId, settings.success )
					.on( 'elementor/connect/error/' + callbackId, settings.error );
			} );

			return this;
		};
	}

	getDefaultSettings() {
		return {
			selectors: {
				connectButton: '#elementor-template-library-connect__button',
			},
		};
	}

	getDefaultElements() {
		return {
			$connectButton: jQuery( this.getSettings( 'selectors.connectButton' ) ),
		};
	}

	applyPopup() {
		this.elements.$connectButton.elementorConnect();
	}

	onInit() {
		super.onInit();

		this.addPopupPlugin();

		this.applyPopup();
	}
}
