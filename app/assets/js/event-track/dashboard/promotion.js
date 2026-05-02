import WpDashboardTracking from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const PROMO_SELECTORS = {
	PROMO_PAGE: '.e-feature-promotion, .elementor-settings-form-page, #elementor-element-manager-wrap',
	PROMO_BLANK_STATE: '.elementor-blank_state',
	CTA_BUTTON: '.go-pro',
	TITLE: 'h3',
};

class PromotionTracking extends BaseTracking {
	static init() {
		this.attachDelegatedTracking();
	}

	static attachDelegatedTracking() {
		this.addEventListenerTracked(
			document,
			'click',
			( event ) => {
				const target = event.target;

				if ( ! target ) {
					return;
				}

				const button = target.closest( `a${ PROMO_SELECTORS.CTA_BUTTON }` );

				if ( ! button ) {
					return;
				}

				const promoPage = button.closest( `${ PROMO_SELECTORS.PROMO_PAGE }, ${ PROMO_SELECTORS.PROMO_BLANK_STATE }` );

				if ( ! promoPage ) {
					return;
				}

				this.handlePromoClick( button, promoPage );
			},
			{ capture: true },
		);
	}

	static handlePromoClick( button, promoPage ) {
		const promoTitle = this.extractPromoTitle( promoPage, button );
		const destination = button.getAttribute( 'href' );
		const path = this.extractPromoPath();

		WpDashboardTracking.trackPromoClicked( promoTitle, destination, path );
	}

	static extractPromoTitle( promoPage, button ) {
		const titleElement = promoPage.querySelector( PROMO_SELECTORS.TITLE );
		return titleElement ? titleElement.textContent.trim() : button.textContent.trim();
	}

	static extractPromoPath() {
		const urlParams = new URLSearchParams( window.location.search );
		const page = urlParams.get( 'page' );

		if ( ! page ) {
			return 'elementor';
		}

		return page.replace( 'elementor_', '' ).replace( /_/g, '/' );
	}
}

export default PromotionTracking;

