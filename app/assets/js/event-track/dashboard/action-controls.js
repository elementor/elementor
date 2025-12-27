import WpDashboardTracking, { CONTROL_TYPES } from '../wp-dashboard-tracking';
import { DashboardUtils } from './utils';
import BaseTracking from './base-tracking';

const EXCLUDED_SELECTORS = {
	ADMIN_MENU: '#adminmenu',
	TOP_BAR: '#editor-one-top-bar',
	WP_ADMIN_BAR: '#wpadminbar',
	SUBMENU: '.wp-submenu',
	PROMO_PAGE: '.e-feature-promotion',
	PROMO_BLANK_STATE: '.elementor-blank_state',
	APP: '.e-app',
	SIDEBAR_NAVIGATION: '#editor-one-sidebar-navigation',
	FLYOUT_MENU: '.elementor-submenu-flyout',
};

class ActionControlTracking extends BaseTracking {
	static init() {
		if ( ! DashboardUtils.isElementorPage() ) {
			return;
		}

		this.attachDelegatedHandlers();
		this.addTrackingAttributesToFilterButtons();
		this.initializeLinkDataIds();
	}

	static initializeLinkDataIds() {
		const initializeLinks = () => {
			const links = document.querySelectorAll( 'a[href]' );

			links.forEach( ( link ) => {
				if ( this.isExcludedElement( link ) || this.isNavigationLink( link ) || link.hasAttribute( 'data-id' ) ) {
					return;
				}

				const href = link.getAttribute( 'href' );
				if ( ! href ) {
					return;
				}

				const cleanedHref = this.removeNonceFromUrl( href );
				if ( cleanedHref ) {
					link.setAttribute( 'data-id', cleanedHref );
				}
			} );
		};

		if ( 'loading' === document.readyState ) {
			document.addEventListener( 'DOMContentLoaded', initializeLinks );
		} else {
			initializeLinks();
		}
	}

	static addTrackingAttributesToFilterButtons() {
		const body = document.body;
		if ( ! body ) {
			return;
		}

		let screenPrefix = '';

		switch ( true ) {
			case body.classList.contains( 'post-type-elementor_library' ):
				screenPrefix = 'elementor_library-library';
				break;
			case body.classList.contains( 'post-type-e-floating-buttons' ):
				screenPrefix = 'e-floating-buttons';
				break;
			default:
				return;
		}

		const addDataIdToListTableButtons = () => {
			const buttonConfigs = [
				{ id: 'post-query-submit', suffix: 'filter' },
				{ id: 'search-submit', suffix: 'search' },
				{ id: 'doaction', suffix: 'apply' },
				{ id: 'doaction2', suffix: 'apply-bottom' },
			];

			buttonConfigs.forEach( ( config ) => {
				const button = document.getElementById( config.id );
				if ( ! button || button.hasAttribute( 'data-id' ) ) {
					return;
				}

				button.setAttribute( 'data-id', `${ screenPrefix }-button-${ config.suffix }` );
			} );
		};

		if ( 'loading' === document.readyState ) {
			document.addEventListener( 'DOMContentLoaded', addDataIdToListTableButtons );
		} else {
			addDataIdToListTableButtons();
		}
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

				const toggle = base.closest( '.elementor-role-toggle' );

				if ( toggle && ! this.isExcludedElement( toggle ) ) {
					this.trackControl( toggle, CONTROL_TYPES.TOGGLE );
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

				const toggle = base.closest( '.MuiSwitch-switchBase' );

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
		const controlIdentifier = this.extractControlIdentifier( element, controlType );

		if ( ! controlIdentifier ) {
			return;
		}

		WpDashboardTracking.trackActionControl( controlIdentifier, controlType );
	}

	static extractControlIdentifier( element, controlType ) {
		if ( CONTROL_TYPES.RADIO === controlType ) {
			const name = element.getAttribute( 'name' );
			const value = element.value || element.getAttribute( 'value' );
			if ( name && value ) {
				return `${ name }-${ value }`;
			}
			if ( name ) {
				return name;
			}
		}

		if ( CONTROL_TYPES.SELECT === controlType ) {
			const name = element.getAttribute( 'name' );
			if ( name ) {
				return name;
			}
		}

		if ( CONTROL_TYPES.CHECKBOX === controlType ) {
			const name = element.getAttribute( 'name' );
			if ( name ) {
				const checkboxesWithSameName = document.querySelectorAll( `input[type="checkbox"][name="${ CSS.escape( name ) }"]` );
				if ( checkboxesWithSameName.length > 1 ) {
					const value = element.value || element.getAttribute( 'value' );
					if ( value ) {
						return `${ name }-${ value }`;
					}
				}
				return name;
			}
		}

		if ( CONTROL_TYPES.LINK === controlType ) {
			const dataId = element.getAttribute( 'data-id' );
			if ( dataId ) {
				return dataId;
			}

			const href = element.getAttribute( 'href' );
			if ( href ) {
				return this.removeNonceFromUrl( href );
			}
		}

		console.log( element, controlType );
		if ( CONTROL_TYPES.BUTTON === controlType || CONTROL_TYPES.TOGGLE === controlType || CONTROL_TYPES.FILTER === controlType ) {
			const dataId = element.getAttribute( 'data-id' );
			console.log( dataId );
			if ( dataId ) {
				return dataId;
			}

			const classIdMatch = this.extractClassId( element );
			if ( classIdMatch ) {
				return classIdMatch;
			}
		}

		return '';
	}

	static extractClassId( element ) {
		const classes = element.className;
		if ( ! classes || 'string' !== typeof classes ) {
			return '';
		}

		const classList = classes.split( ' ' );
		for ( const cls of classList ) {
			if ( cls.startsWith( 'e-id-' ) ) {
				return cls.substring( 5 );
			}
		}

		return '';
	}

	static removeNonceFromUrl( url ) {
		try {
			const urlObj = new URL( url, window.location.origin );
			urlObj.searchParams.delete( '_wpnonce' );
			const postParam = urlObj.searchParams.get( 'post' );
			if ( postParam !== null && /^[0-9]+$/.test( postParam ) ) {
				urlObj.searchParams.delete( 'post' );
			}

			return urlObj.pathname + urlObj.search + urlObj.hash;
		} catch ( e ) {
			return url;
		}
	}
}

export default ActionControlTracking;
