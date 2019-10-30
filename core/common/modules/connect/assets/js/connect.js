export default class extends elementorModules.ViewModule {
	addPopupPlugin() {
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

			this.each( function( index ) {
				const $this = jQuery( this ),
					callbackId = 'cb' + ( index + 1 );

				$this.attr( {
					target: '_blank',
					href: $this.attr( 'href' ) + '&mode=popup&callback_id=' + callbackId,
				} );

				elementorCommon.elements.$window
				.on( 'elementorConnectSuccess-' + callbackId, settings.success )
				.on( 'elementorConnectError-' + callbackId, settings.error );
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

	onHideLibraryConnect() {
		elementorCommon.ajax.addRequest( 'library_connect_popup_showed' );
		$e.components.get( 'library' ).manager.layout.modal.off( 'hide', this.onHideLibraryConnect );
	}

	maybeShowLibraryConnectPopup() {
		if ( elementor.config.library_connect.show_popup ) {
			$e.route( 'library/connect', {
				onAfter: () => {
					$e.components.get( 'library' ).manager.layout.modal.on( 'hide', this.onHideLibraryConnect );
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
