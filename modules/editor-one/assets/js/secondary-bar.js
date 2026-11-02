const TAB_KEY_STEP = {
	ArrowRight: 1,
	ArrowLeft: -1,
};

export const getNextTabIndex = ( currentIndex, key, tabCount, isRtl ) => {
	if ( tabCount < 1 ) {
		return 0;
	}

	if ( 'Home' === key ) {
		return 0;
	}

	if ( 'End' === key ) {
		return tabCount - 1;
	}

	const direction = TAB_KEY_STEP[ key ];

	if ( ! direction ) {
		return currentIndex;
	}

	const step = isRtl ? -direction : direction;

	return ( currentIndex + step + tabCount ) % tabCount;
};

export const openFinder = ( route ) => {
	if ( 'function' !== typeof route ) {
		return false;
	}

	route( 'finder' );

	return true;
};

export const scrollActiveTabIntoView = ( container, reduceMotion ) => {
	const activeTab = container.querySelector( '.is-active' );

	if ( ! activeTab || 'function' !== typeof activeTab.scrollIntoView ) {
		return;
	}

	activeTab.scrollIntoView( {
		inline: 'nearest',
		block: 'nearest',
		behavior: reduceMotion ? 'auto' : 'smooth',
	} );
};

export class SecondaryBar {
	constructor( root, { route = null, isRtl = false, reduceMotion = false } = {} ) {
		this.root = root;
		this.route = route;
		this.isRtl = isRtl;
		this.reduceMotion = reduceMotion;
	}

	init() {
		this.tabsContainer = this.root.querySelector( '.e-admin-secondary-bar__tabs' );
		this.tabs = this.tabsContainer ? [ ...this.tabsContainer.querySelectorAll( 'a' ) ] : [];
		this.finder = this.root.querySelector( '.e-admin-secondary-bar__finder' );
		this.addons = this.root.querySelector( '.e-admin-secondary-bar__addons' );

		this.bindTabs();
		this.bindFinder();
		this.bindAddons();
		scrollActiveTabIntoView( this.tabsContainer || this.root, this.reduceMotion );
	}

	bindTabs() {
		this.tabs.forEach( ( tab, index ) => {
			tab.addEventListener( 'keydown', ( event ) => {
				const nextIndex = getNextTabIndex( index, event.key, this.tabs.length, this.isRtl );

				if ( nextIndex === index ) {
					return;
				}

				event.preventDefault();
				this.tabs[ nextIndex ].focus();
			} );
		} );
	}

	bindFinder() {
		if ( ! this.finder ) {
			return;
		}

		this.finder.addEventListener( 'click', () => {
			openFinder( this.route );
		} );
	}

	bindAddons() {
		if ( ! this.addons ) {
			return;
		}

		const summary = this.addons.querySelector( 'summary' );
		const links = [ ...this.addons.querySelectorAll( 'a' ) ];

		this.addons.addEventListener( 'keydown', ( event ) => {
			this.handleAddonsKeydown( event, summary, links );
		} );

		document.addEventListener( 'click', ( event ) => {
			if ( ! this.addons.open || this.addons.contains( event.target ) ) {
				return;
			}

			this.addons.open = false;
		} );
	}

	handleAddonsKeydown( event, summary, links ) {
		if ( 'Escape' === event.key ) {
			this.addons.open = false;
			summary.focus();
			event.preventDefault();
			return;
		}

		if ( ! links.length || ( 'ArrowDown' !== event.key && 'ArrowUp' !== event.key && 'Home' !== event.key && 'End' !== event.key ) ) {
			return;
		}

		event.preventDefault();
		this.addons.open = true;

		const currentIndex = links.indexOf( document.activeElement );
		let nextIndex = 0;

		if ( 'End' === event.key ) {
			nextIndex = links.length - 1;
		} else if ( 'ArrowDown' === event.key ) {
			nextIndex = currentIndex < 0 ? 0 : ( currentIndex + 1 ) % links.length;
		} else if ( 'ArrowUp' === event.key ) {
			nextIndex = currentIndex < 0 ? links.length - 1 : ( currentIndex - 1 + links.length ) % links.length;
		}

		links[ nextIndex ].focus();
	}
}

const initSecondaryBar = () => {
	const root = document.querySelector( '.e-admin-secondary-bar' );

	if ( ! root ) {
		return;
	}

	const isRtl = document.body.classList.contains( 'rtl' ) || 'rtl' === document.documentElement.dir;
	const reduceMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	const route = window.$e && 'function' === typeof window.$e.route ? window.$e.route.bind( window.$e ) : null;

	new SecondaryBar( root, { route, isRtl, reduceMotion } ).init();
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initSecondaryBar );
} else {
	initSecondaryBar();
}
