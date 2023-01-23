export default class BaseLoader extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			isInserted: false,
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

	insertAPI() {
		this.elements.$firstScript.before( jQuery( '<script>', { src: this.getApiURL() } ) );

		this.setSettings( 'isInserted', true );
	}

	getVideoIDFromURL( url ) {
		const videoIDParts = url.match( this.getURLRegex() );

		return videoIDParts && videoIDParts[ 1 ];
	}

	onApiReady( callback ) {
		if ( ! this.getSettings( 'isInserted' ) ) {
			this.insertAPI();
		}

		if ( this.isApiLoaded() ) {
			callback( this.getApiObject() );
		} else {
			// If not ready check again by timeout..
			setTimeout( () => {
				this.onApiReady( callback );
			}, 350 );
		}
	}

	getAutoplayURL( videoURL ) {
		return videoURL.replace( '&autoplay=0', '' ) + '&autoplay=1';
	}
}
