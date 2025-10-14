import WpDashboardTracking from '../wp-dashboard-tracking';

const PROMO_MENU_ITEMS = {
	go_elementor_pro: 'Upgrade',
	elementor_custom_fonts: 'Custom Fonts',
	elementor_custom_icons: 'Custom Icons',
	elementor_custom_code: 'Custom Code',
	popup_templates: 'Popups',
	'e-form-submissions': 'Form Submissions',
};

class MenuPromotionTracking {
	static init() {
		this.attachDelegatedTracking();
	}

	static attachDelegatedTracking() {
		document.addEventListener( 'click', ( event ) => {
			const target = event.target;

			if ( ! target ) {
				return;
			}

			const link = target.closest( 'a' );

			if ( ! link ) {
				return;
			}

			const href = link.getAttribute( 'href' );

			if ( ! href ) {
				return;
			}

			const menuItemKey = this.extractPromoMenuKey( href );

			if ( ! menuItemKey ) {
				return;
			}

			this.handleMenuPromoClick( link, menuItemKey );
		}, { capture: true } );
	}

	static extractPromoMenuKey( href ) {
		for ( const menuItemKey of Object.keys( PROMO_MENU_ITEMS ) ) {
			if ( href.includes( `page=${ menuItemKey }` ) ) {
				return menuItemKey;
			}
		}

		return null;
	}

	static handleMenuPromoClick( menuItem, menuItemKey ) {
		const destination = menuItem.getAttribute( 'href' );
		const promoName = PROMO_MENU_ITEMS[ menuItemKey ];
		const path = menuItemKey.replace( 'elementor_', '' ).replace( /_/g, '/' );

		WpDashboardTracking.trackPromoClicked( promoName, destination, path );
	}
}

export default MenuPromotionTracking;

