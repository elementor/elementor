export default class extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				links: 'a[href^="%23elementor-action"], a[href^="#elementor-action"]',
			},
		};
	}

	bindEvents() {
		elementorFrontend.elements.$document.on( 'click', this.getSettings( 'selectors.links' ), this.runLinkAction.bind( this ) );
	}

	initActions() {
		this.actions = {
			lightbox: async ( settings ) => {
				const lightbox = await elementorFrontend.utils.lightbox;

				if ( settings.slideshow ) {
					// Handle slideshow display
					lightbox.openSlideshow( settings.slideshow, settings.url );
				} else {
					if ( settings.html ) {
						delete settings.html;
					}

					lightbox.showModal( settings );
				}
			},
		};
	}

	addAction( name, callback ) {
		this.actions[ name ] = callback;
	}

	runAction( url, ...restArgs ) {
		url = decodeURIComponent( url );

		const actionMatch = url.match( /action=(.+?)&/ ),
			settingsMatch = url.match( /settings=(.+)/ );

		if ( ! actionMatch ) {
			return;
		}

		const action = this.actions[ actionMatch[ 1 ] ];

		if ( ! action ) {
			return;
		}

		let settings = {};

		if ( settingsMatch ) {
			settings = JSON.parse( atob( settingsMatch[ 1 ] ) );
		}

		action( settings, ...restArgs );
	}

	runLinkAction( event ) {
		event.preventDefault();

		this.runAction( jQuery( event.currentTarget ).attr( 'href' ), event );
	}

	findElementWithHash() {
		return document.querySelector( `[e-action-hash="${ location.hash }"]` ) || document.querySelector( `a[href*="${ location.hash }"]` );
	}

	runHashAction() {
		// Look for elements with the action hash attribute.
		if ( location.hash && this.findElementWithHash() ) {
			this.runAction( location.hash );
		}
	}

	createActionHash( action, settings ) {
		// We need to encode the hash tag (#) here, in order to support share links for a variety of providers
		return encodeURIComponent( `#elementor-action:action=${ action }&settings=${ btoa( JSON.stringify( settings ) ) }` );
	}

	onInit() {
		super.onInit();

		this.initActions();

		elementorFrontend.on( 'components:init', this.runHashAction.bind( this ) );
	}
}
