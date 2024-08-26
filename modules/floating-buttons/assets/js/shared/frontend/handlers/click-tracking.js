import Base from 'elementor-frontend/handlers/base';

export default class ClickTrackingHandler extends Base {
	clicks = [];

	getDefaultSettings() {
		return {
			selectors: {
				contentWrapper: '.e-contact-buttons__content-wrapper',
				contactButtonCore: '.e-contact-buttons__send-button',
				contentWrapperFloatingBars: '.e-floating-bars',
				floatingBarCTAButton: '.e-floating-bars__cta-button',
				elementorWrapper: '[data-elementor-type="floating-buttons"]',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			contentWrapper: this.$element[ 0 ].querySelector( selectors.contentWrapper ),
			contentWrapperFloatingBars: this.$element[ 0 ].querySelector( selectors.contentWrapperFloatingBars ),
		};
	}

	bindEvents() {
		if ( this.elements.contentWrapper ) {
			this.elements.contentWrapper.addEventListener( 'click', this.onChatButtonTrackClick.bind( this ) );
		}

		if ( this.elements.contentWrapperFloatingBars ) {
			this.elements.contentWrapperFloatingBars.addEventListener( 'click', this.onChatButtonTrackClick.bind( this ) );
		}

		window.addEventListener( 'beforeunload', () => {
			if ( this.clicks.length > 0 ) {
				this.sendClicks();
			}
		} );
	}

	onChatButtonTrackClick( event ) {
		const targetElement = event.target || event.srcElement;
		const selectors = this.getSettings( 'selectors' );

		if (
			targetElement.matches( selectors.contactButtonCore ) ||
			targetElement.closest( selectors.contactButtonCore ) ||
			targetElement.matches( selectors.floatingBarCTAButton ) ||
			targetElement.closest( selectors.floatingBarCTAButton )
		) {
			this.getDocumentIdAndTrack( targetElement, selectors );
		}
	}

	getDocumentIdAndTrack( targetElement, selectors ) {
		const documentId = targetElement.closest( selectors.elementorWrapper ).dataset.elementorId;

		this.trackClick( documentId );
	}

	trackClick( documentId ) {
		if ( ! documentId ) {
			return;
		}

		this.clicks.push( documentId );

		if ( this.clicks.length >= 10 ) {
			this.sendClicks();
		}
	}

	sendClicks() {
		const formData = new FormData();
		formData.append( 'action', 'elementor_send_clicks' );
		formData.append( '_nonce', elementorFrontendConfig?.nonces?.floatingButtonsClickTracking );
		this.clicks.forEach( ( documentId ) => formData.append( 'clicks[]', documentId ) );

		fetch( elementorFrontendConfig?.urls?.ajaxurl, {
			method: 'POST',
			body: formData,
		} )
			.then( () => {
				this.clicks = [];
			} );
	}
}
