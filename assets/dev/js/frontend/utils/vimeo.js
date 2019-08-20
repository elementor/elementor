export default class VimeoModule extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			isInserted: false,
			APISrc: 'https://player.vimeo.com/api/player.js',
			selectors: {
				firstScript: 'script:first',
			},
		};
	}

	getDefaultElements() {
		return {
			$firstScript: jQuery( this.getSettings( 'selectors.firstScript' ) ),
		};
	}

	insertVimeoAPI() {
		this.setSettings( 'isInserted', true );

		this.elements.$firstScript.before( jQuery( '<script>', { src: this.getSettings( 'APISrc' ) } ) );
	}

	getVimeoIDFromURL( url ) {
		var videoIDParts = url.match( /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(\d+))([^?&#"'>]?)/ );

		return videoIDParts && videoIDParts[ 1 ];
	}

	onVimeoApiReady( callback ) {
		if ( ! this.getSettings( 'IsInserted' ) ) {
			this.insertVimeoAPI();
		}

		if ( window.Vimeo ) {
			callback( window.Vimeo );
		} else {
			// If not ready check again by timeout..
			setTimeout( () => {
				this.onVimeoApiReady( callback );
			}, 350 );
		}
	}
}
