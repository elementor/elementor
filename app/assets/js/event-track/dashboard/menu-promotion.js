import WpDashboardTracking from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const PROMO_MENU_ITEMS = {
	go_elementor_pro: 'Upgrade',
};

class MenuPromotionTracking extends BaseTracking {
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
			},
			{ capture: true },
		);
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

