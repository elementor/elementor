import WpDashboardTracking, { CONTROL_TYPES } from '../wp-dashboard-tracking';
import { DashboardUtils } from './utils';
import BaseTracking from './base-tracking';

const EXCLUDED_SELECTORS = {
	ADMIN_MENU: '#adminmenu',
	TOP_BAR: '.e-admin-top-bar',
	WP_ADMIN_BAR: '#wpadminbar',
	SUBMENU: '.wp-submenu',
	PROMO_PAGE: '.e-feature-promotion',
	PROMO_BLANK_STATE: '.elementor-blank_state',
	HOME_SCREEN: '#e-home-screen',
};

class ActionControlTracking extends BaseTracking {
	static init() {
		if ( ! DashboardUtils.isElementorPage() ) {
			return;
		}

		this.attachDelegatedHandlers();
	}

	static isExcludedElement( element ) {
		for ( const selector of Object.values( EXCLUDED_SELECTORS ) ) {
			if ( element.closest( selector ) ) {
				return true;
			}
		}

		if ( element.classList.contains( 'go-pro' ) ) {
			return true;
		}

		return false;
	}

	static attachDelegatedHandlers() {
		const FILTER_BUTTON_IDS = [ 'search-submit', 'post-query-submit' ];

		this.addEventListenerTracked(
			document,
			'click',
			( event ) => {
				const base = event.target && 1 === event.target.nodeType ? event.target : event.target?.parentElement;
				if ( ! base ) {
					return;
				}

				const button = base.closest( 'button, input[type="submit"], input[type="button"], .button, .e-btn' );
				if ( button && ! this.isExcludedElement( button ) ) {
					if ( FILTER_BUTTON_IDS.includes( button.id ) ) {
						this.trackControl( button, CONTROL_TYPES.FILTER );
						return;
					}

					this.trackControl( button, CONTROL_TYPES.BUTTON );
					return;
				}

				const link = base.closest( 'a' );
				if ( link && ! this.isExcludedElement( link ) && ! this.isNavigationLink( link ) ) {
					this.trackControl( link, CONTROL_TYPES.LINK );
				}
			},
			{ capture: false },
		);

		this.addEventListenerTracked(
			document,
			'change',
			( event ) => {
				const base = event.target && 1 === event.target.nodeType ? event.target : event.target?.parentElement;
				if ( ! base ) {
					return;
				}

				const toggle = base.closest( '.components-form-toggle, .elementor-control-type-switcher input, [role="switch"], .toggle-control input' );
				if ( toggle && ! this.isExcludedElement( toggle ) ) {
					this.trackControl( toggle, CONTROL_TYPES.TOGGLE );
					return;
				}

				const checkbox = base.closest( 'input[type="checkbox"]' );
				if ( checkbox && ! this.isExcludedElement( checkbox ) ) {
					this.trackControl( checkbox, CONTROL_TYPES.CHECKBOX );
					return;
				}

				const radio = base.closest( 'input[type="radio"]' );
				if ( radio && ! this.isExcludedElement( radio ) ) {
					this.trackControl( radio, CONTROL_TYPES.RADIO );
					return;
				}

				const select = base.closest( 'select' );
				if ( select && ! this.isExcludedElement( select ) ) {
					this.trackControl( select, CONTROL_TYPES.SELECT );
				}
			},
		);
	}

	static isNavigationLink( link ) {
		const href = link.getAttribute( 'href' );

		if ( ! href ) {
			return false;
		}

		if ( href.startsWith( '#' ) && href.includes( 'tab' ) ) {
			return true;
		}

		if ( link.classList.contains( 'nav-tab' ) ) {
			return true;
		}

		const isInNavigation = link.closest( '.wp-submenu, #adminmenu, .e-admin-top-bar, #wpadminbar' );

		return !! isInNavigation;
	}

	static trackControl( element, controlType ) {
		const controlData = this.extractControlData( element, controlType );

		WpDashboardTracking.trackActionControl( controlData, controlType );
	}

	static extractControlData( element, controlType ) {
		const data = {};

		const id = element.getAttribute( 'id' );
		if ( id ) {
			data.id = id;
		}

		const name = element.getAttribute( 'name' );
		if ( name ) {
			data.name = name;
		}

		let text = '';
		if ( CONTROL_TYPES.BUTTON === controlType ) {
			text = element.value || element.textContent.trim() || element.getAttribute( 'aria-label' );
		} else if ( CONTROL_TYPES.LINK === controlType ) {
			text = element.textContent.trim() || element.getAttribute( 'aria-label' ) || element.getAttribute( 'title' );
		} else if ( CONTROL_TYPES.SELECT === controlType ) {
			const selectedOption = element.options[ element.selectedIndex ];
			text = selectedOption ? selectedOption.textContent.trim() : '';
		} else if ( CONTROL_TYPES.CHECKBOX === controlType || CONTROL_TYPES.TOGGLE === controlType || CONTROL_TYPES.RADIO === controlType ) {
			const label = element.labels ? element.labels[ 0 ] : null;
			text = label ? label.textContent.trim() : '';

			data.checked = element.checked;
		}

		if ( text ) {
			data.text = text;
		}

		const classes = element.className;
		if ( classes && 'string' === typeof classes ) {
			const relevantClasses = classes.split( ' ' ).filter( ( cls ) =>
				cls && ! cls.startsWith( 'elementor-control-' ) && ! cls.startsWith( 'wp-' ),
			).slice( 0, 3 );

			if ( relevantClasses.length > 0 ) {
				data.classes = relevantClasses.join( ' ' );
			}
		}

		if ( CONTROL_TYPES.LINK === controlType ) {
			const href = element.getAttribute( 'href' );
			if ( href && ! href.startsWith( '#' ) ) {
				data.href = href;
			}
		}

		return data;
	}
}

export default ActionControlTracking;
