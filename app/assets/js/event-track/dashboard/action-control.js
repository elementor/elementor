import WpDashboardTracking, { CONTROL_TYPES } from '../wp-dashboard-tracking';
import { DashboardUtils } from './utils';

const EXCLUDED_SELECTORS = {
	ADMIN_MENU: '#adminmenu',
	TOP_BAR: '.e-admin-top-bar',
	WP_ADMIN_BAR: '#wpadminbar',
	SUBMENU: '.wp-submenu',
};

class ActionControlTracking {
	static init() {
		if ( ! DashboardUtils.isElementorPage() ) {
			return;
		}

		this.attachControlTracking();
	}

	static isExcludedElement( element ) {
		for ( const selector of Object.values( EXCLUDED_SELECTORS ) ) {
			if ( element.closest( selector ) ) {
				return true;
			}
		}

		return false;
	}

	static attachControlTracking() {
		this.attachButtonTracking();
		this.attachCheckboxTracking();
		this.attachRadioTracking();
		this.attachSelectTracking();
		this.attachLinkTracking();
		this.attachToggleTracking();
	}

	static attachButtonTracking() {
		const buttons = document.querySelectorAll( 'button, input[type="submit"], input[type="button"], .button, .e-btn' );

		buttons.forEach( ( button ) => {
			if ( this.isExcludedElement( button ) ) {
				return;
			}

			button.addEventListener( 'click', ( event ) => {
				this.trackControl( event.currentTarget, CONTROL_TYPES.BUTTON );
			}, { capture: false } );
		} );

		this.observeNewControls( 'button, input[type="submit"], input[type="button"], .button, .e-btn', CONTROL_TYPES.BUTTON );
	}

	static attachCheckboxTracking() {
		const checkboxes = document.querySelectorAll( 'input[type="checkbox"]' );

		checkboxes.forEach( ( checkbox ) => {
			if ( this.isExcludedElement( checkbox ) ) {
				return;
			}

			checkbox.addEventListener( 'change', ( event ) => {
				this.trackControl( event.currentTarget, CONTROL_TYPES.CHECKBOX );
			} );
		} );

		this.observeNewControls( 'input[type="checkbox"]', CONTROL_TYPES.CHECKBOX, 'change' );
	}

	static attachRadioTracking() {
		const radios = document.querySelectorAll( 'input[type="radio"]' );

		radios.forEach( ( radio ) => {
			if ( this.isExcludedElement( radio ) ) {
				return;
			}

			radio.addEventListener( 'change', ( event ) => {
				this.trackControl( event.currentTarget, CONTROL_TYPES.RADIO );
			} );
		} );

		this.observeNewControls( 'input[type="radio"]', CONTROL_TYPES.RADIO, 'change' );
	}

	static attachSelectTracking() {
		const selects = document.querySelectorAll( 'select' );

		selects.forEach( ( select ) => {
			if ( this.isExcludedElement( select ) ) {
				return;
			}

			select.addEventListener( 'change', ( event ) => {
				this.trackControl( event.currentTarget, CONTROL_TYPES.SELECT );
			} );
		} );

		this.observeNewControls( 'select', CONTROL_TYPES.SELECT, 'change' );
	}

	static attachLinkTracking() {
		const links = document.querySelectorAll( 'a' );

		links.forEach( ( link ) => {
			if ( this.isExcludedElement( link ) ) {
				return;
			}

			if ( this.isNavigationLink( link ) ) {
				return;
			}

			link.addEventListener( 'click', ( event ) => {
				this.trackControl( event.currentTarget, CONTROL_TYPES.LINK );
			}, { capture: false } );
		} );

		this.observeNewControls( 'a', CONTROL_TYPES.LINK );
	}

	static attachToggleTracking() {
		const toggles = document.querySelectorAll( '.elementor-control-type-switcher input, [role="switch"], .toggle-control input' );

		toggles.forEach( ( toggle ) => {
			if ( this.isExcludedElement( toggle ) ) {
				return;
			}

			toggle.addEventListener( 'change', ( event ) => {
				this.trackControl( event.currentTarget, CONTROL_TYPES.TOGGLE );
			} );
		} );

		this.observeNewControls( '.elementor-control-type-switcher input, [role="switch"], .toggle-control input', CONTROL_TYPES.TOGGLE, 'change' );
	}

	static isNavigationLink( link ) {
		const href = link.getAttribute( 'href' );

		if ( ! href ) {
			return false;
		}

		if ( href.startsWith( '#' ) && ! href.includes( 'tab' ) ) {
			return false;
		}

		if ( link.classList.contains( 'nav-tab' ) ) {
			return false;
		}

		const isInNavigation = link.closest( '.wp-submenu, #adminmenu, .e-admin-top-bar, #wpadminbar' );

		return !! isInNavigation;
	}

	static observeNewControls( selector, controlType, eventType = 'click' ) {
		const observer = new MutationObserver( ( mutations ) => {
			mutations.forEach( ( mutation ) => {
				if ( 'childList' === mutation.type ) {
					mutation.addedNodes.forEach( ( node ) => {
						if ( 1 === node.nodeType ) {
							let elements = [];

							if ( node.matches && node.matches( selector ) ) {
								elements.push( node );
							}

							if ( node.querySelectorAll ) {
								const foundElements = node.querySelectorAll( selector );
								elements = [ ...elements, ...foundElements ];
							}

							elements.forEach( ( element ) => {
								if ( this.isExcludedElement( element ) ) {
									return;
								}

								if ( CONTROL_TYPES.LINK === controlType && this.isNavigationLink( element ) ) {
									return;
								}

								element.addEventListener( eventType, ( event ) => {
									this.trackControl( event.currentTarget, controlType );
								}, { capture: false } );
							} );
						}
					} );
				}
			} );
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );
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
