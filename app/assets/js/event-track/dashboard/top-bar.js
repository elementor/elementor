import WpDashboardTracking, { NAV_AREAS } from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const TOP_BAR_SELECTORS = {
	TOP_BAR_ROOT: '.e-admin-top-bar',
	BAR_BUTTON: '.e-admin-top-bar__bar-button',
	BUTTON_TITLE: '.e-admin-top-bar__bar-button-title',
	MAIN_AREA: '.e-admin-top-bar__main-area',
	SECONDARY_AREA: '.e-admin-top-bar__secondary-area',
};

class TopBarTracking extends BaseTracking {
	static init() {
		this.waitForTopBar();
	}

	static waitForTopBar() {
		const topBar = document.querySelector( TOP_BAR_SELECTORS.TOP_BAR_ROOT );

		if ( topBar ) {
			this.attachTopBarTracking( topBar );
			return;
		}

		const observer = this.addObserver(
			document.body,
			{
				childList: true,
				subtree: true,
			},
			() => {
				const foundTopBar = document.querySelector( TOP_BAR_SELECTORS.TOP_BAR_ROOT );

				if ( foundTopBar ) {
					this.attachTopBarTracking( foundTopBar );
					observer.disconnect();
					clearTimeout( timeoutId );
				}
			},
		);

		const timeoutId = setTimeout( () => {
			observer.disconnect();
		}, 10000 );
	}

	static attachTopBarTracking( topBar ) {
		const buttons = topBar.querySelectorAll( TOP_BAR_SELECTORS.BAR_BUTTON );

		buttons.forEach( ( button ) => {
			this.addEventListenerTracked(
				button,
				'click',
				( event ) => {
					this.handleTopBarClick( event );
				},
			);
		} );

		this.observeTopBarChanges( topBar );
	}

	static observeTopBarChanges( topBar ) {
		this.addObserver(
			topBar,
			{
				childList: true,
				subtree: true,
			},
			( mutations ) => {
				mutations.forEach( ( mutation ) => {
					if ( 'childList' === mutation.type ) {
						mutation.addedNodes.forEach( ( node ) => {
							if ( 1 === node.nodeType ) {
								if ( node.matches && node.matches( TOP_BAR_SELECTORS.BAR_BUTTON ) ) {
									this.addEventListenerTracked(
										node,
										'click',
										( event ) => {
											this.handleTopBarClick( event );
										},
									);
								} else {
									const buttons = node.querySelectorAll ? node.querySelectorAll( TOP_BAR_SELECTORS.BAR_BUTTON ) : [];
									buttons.forEach( ( button ) => {
										this.addEventListenerTracked(
											button,
											'click',
											( event ) => {
												this.handleTopBarClick( event );
											},
										);
									} );
								}
							}
						} );
					}
				} );
			},
		);
	}

	static handleTopBarClick( event ) {
		const button = event.currentTarget;
		const itemId = this.extractItemId( button );

		WpDashboardTracking.trackNavClicked( itemId, null, NAV_AREAS.TOP_BAR );
	}

	static extractItemId( button ) {
		const titleElement = button.querySelector( TOP_BAR_SELECTORS.BUTTON_TITLE );

		if ( titleElement && titleElement.textContent.trim() ) {
			return titleElement.textContent.trim();
		}

		const textContent = button.textContent.trim();
		if ( textContent ) {
			return textContent;
		}

		const href = button.getAttribute( 'href' );
		if ( href ) {
			const urlParams = new URLSearchParams( href.split( '?' )[ 1 ] || '' );
			const page = urlParams.get( 'page' );

			if ( page ) {
				return page;
			}

			if ( href.includes( '/wp-admin/' ) ) {
				const pathParts = href.split( '/wp-admin/' )[ 1 ];
				if ( pathParts ) {
					return pathParts.split( '?' )[ 0 ];
				}
			}

			try {
				const url = new URL( href, window.location.origin );
				return url.pathname.split( '/' ).filter( Boolean ).pop() || url.hostname;
			} catch ( error ) {
				return href;
			}
		}

		const dataInfo = button.getAttribute( 'data-info' );
		if ( dataInfo ) {
			return dataInfo;
		}

		const classes = button.className.split( ' ' ).filter( ( cls ) => cls && 'e-admin-top-bar__bar-button' !== cls );
		if ( classes.length > 0 ) {
			return classes.join( '-' );
		}

		return 'unknown-top-bar-button';
	}
}

export default TopBarTracking;