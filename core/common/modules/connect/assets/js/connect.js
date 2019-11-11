export default class extends elementorModules.ViewModule {
	addPopupPlugin() {
		let counter = 0;

		jQuery.fn.elementorConnect = function( options ) {
			const settings = jQuery.extend( {
				// These are the defaults.
				success: () => location.reload(),
				error: () => {
					elementor.notifications.showToast( {
						message: elementor.translate( 'connect_error' ),
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

	onCloseLibraryConnect() {
		elementorCommon.ajax.addRequest( 'library_connect_popup_showed' );
		$e.components.get( 'library' ).off( 'route/close', this.onCloseLibraryConnect );
	}

	maybeShowLibraryConnectPopup() {
		if ( elementor.config.library_connect.show_popup ) {
			$e.route( 'library/connect', {
				onAfter: () => {
					$e.components.get( 'library' ).on( 'route/close', this.onCloseLibraryConnect );
				},
			} );
		}
	}

	onInit() {
		super.onInit();

		this.addPopupPlugin();

		this.applyPopup();

		jQuery( window ).on( 'elementor:init', this.maybeShowLibraryConnectPopup.bind( this ) );
	}
}
