export default class extends elementorModules.ViewModule {
	addPopupPlugin() {
		let counter = 0;

		jQuery.fn.elementorConnect = function( options ) {
			// Open the Connect Dialog in a popup window.
			if ( options?.popup ) {
				jQuery( this ).on( 'click', ( event ) => {
					event.preventDefault();

					const width = options.popup?.width || 600,
						height = options.popup?.height || 700;

					window.open( jQuery( this ).attr( 'href' ) + '&mode=popup', 'elementorConnect', `toolbar=no, menubar=no, width=${ width }, height=${ height }, top=200, left=0` );
				} );

				delete options.popup;
			}

			const settings = jQuery.extend( {
				// These are the defaults.
				success: () => location.reload(),
				error: () => {
					elementor.notifications.showToast( {
						message: __( 'Unable to connect', 'elementor' ),
					} );
				},
				parseUrl: ( url ) => url, // Allow to change the url, e.g: replace placeholders like '%%template_type%%' with actual value.
			}, options );

			this.each( function() {
				counter++;

				const $this = jQuery( this ),
					callbackId = 'cb' + ( counter );

				$this.attr( {
					target: '_blank',
					rel: 'opener',
					href: settings.parseUrl( $this.attr( 'href' ) + '&mode=popup&callback_id=' + callbackId ),
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
