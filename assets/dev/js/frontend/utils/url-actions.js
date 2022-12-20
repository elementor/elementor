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
					// If the settings has an ID - the lightbox target content is an image - the ID is an attachment ID.
					if ( settings.id ) {
						settings.type = 'image';
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

		const actionMatch = url.match( /action=(.+?)&/ );

		if ( ! actionMatch ) {
			return;
		}

		const action = this.actions[ actionMatch[ 1 ] ];

		if ( ! action ) {
			return;
		}

		let settings = {};

		const settingsMatch = url.match( /settings=(.+)/ );
		if ( settingsMatch ) {
			settings = JSON.parse( atob( settingsMatch[ 1 ] ) );
		}

		action( settings, ...restArgs );
	}

	runLinkAction( event ) {
		event.preventDefault();

		this.runAction( jQuery( event.currentTarget ).attr( 'href' ), event );
	}

	runHashAction() {
		if ( ! location.hash ) {
			return;
		}

		// Only if an element with this action hash exists on the page do we allow running the action.
		const elementWithHash = document.querySelector( `[data-e-action-hash="${ location.hash }"], a[href*="${ location.hash }"]` );

		if ( elementWithHash ) {
			this.runAction( elementWithHash.getAttribute( 'data-e-action-hash' ) );
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
