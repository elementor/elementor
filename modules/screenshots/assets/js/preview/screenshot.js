/* global ElementorScreenshotConfig, jQuery */
class Screenshot {
	constructor() {
		/**
		 * Holds the screen shot Iframe.
		 */
		this.$elementor = null;

		/**
		 * The config that provided from the backend.
		 *
		 * @var object
		 */
		this.config = {
			crop: {
				width: 1200,
				height: 1500,
			},
			allowedCssUrls: [
				'https://fonts.googleapis.com',
				'https://kit-pro.fontawesome.com',
				'https://use.typekit.net',
			],
			timeout: 5000, // 5 secs
			timerLabel: 'timer',
		};

		jQuery( () => this.init() );
	}

	/**
	 * The main method for this class.
	 */
	init() {
		this.log( 'Screeenshot init', 'time' );

		this.$elementor = jQuery( ElementorScreenshotConfig.selector );
		this.config = {
			...this.config,
			...ElementorScreenshotConfig,
		};

		if ( ! this.$elementor.length ) {
			elementorCommon.helpers.consoleWarn( 'Screenshots: Elementor content was not found.' );

			return;
		}

		this.handleIFrames();
		this.handleSlides();
		this.hideUnnecessaryElements();

		Promise.resolve()
			.then( this.loadExternalCss.bind( this ) )
			.then( this.createImage.bind( this ) )
			.then( this.createImageElement.bind( this ) )
			.then( this.cropCanvas.bind( this ) )
			.then( this.save.bind( this ) )
			.then( () => {
				this.log( 'Screeenshot End.', 'timeEnd' );
			} );
	}

	/**
	 * Html to images libraries can not snapshot IFrames
	 * this method convert all the IFrames to some other elements.
	 */
	handleIFrames() {
		this.$elementor.find( 'iframe' ).each( ( index, el ) => {
			const $iframe = jQuery( el );

			const $iframeMask = jQuery( '<div />', {
				css: {
					background: 'gray',
					width: $iframe.width(),
					height: $iframe.height(),
				},
			} );

			if ( $iframe.next().is( '.elementor-custom-embed-image-overlay' ) ) {
				this.handleCustomEmbedImageIFrame( $iframe, $iframeMask );
			} else if ( -1 !== $iframe.attr( 'src' ).search( 'youtu' ) ) {
				this.handleYouTubeIFrame( $iframe, $iframeMask );
			}

			$iframe.before( $iframeMask );
			$iframe.remove();
		} );
	}

	/**
	 * @param $iframe
	 * @param $iframeMask
	 */
	handleCustomEmbedImageIFrame( $iframe, $iframeMask ) {
		const regex = /url\(\"(.*)\"/gm;
		const url = $iframe.next().css( 'backgroundImage' );
		const matches = regex.exec( url );

		$iframeMask.css( { background: $iframe.next().css( 'background' ) } );

		$iframeMask.append( jQuery( '<img />', {
			src: matches[ 1 ],
			css: {
				width: $iframe.width(),
				height: $iframe.height(),
			},
		} ) );

		$iframe.next().remove();
	}

	/**
	 * @param $iframe
	 * @param $iframeMask
	 */
	handleYouTubeIFrame( $iframe, $iframeMask ) {
		const regex = /^.*(?:youtu.be\/|youtube(?:-nocookie)?.com\/(?:(?:watch)??(?:.*&)?vi?=|(?:embed|v|vi|user)\/))([^?&"'>]+)/;
		const matches = regex.exec( $iframe.attr( 'src' ) );

		$iframeMask.append( jQuery( '<img />', {
			src: this.getScreenshotProxyUrl( `https://img.youtube.com/vi/${ matches[ 1 ] }/0.jpg` ),
			crossOrigin: 'Anonymous',
			css: {
				width: $iframe.width(),
				height: $iframe.height(),
			},
		} ) );
	}

	/**
	 * Slides should show only the first slide, all the other slides will be removed.
	 */
	handleSlides() {
		this.$elementor.find( '.elementor-slides' ).each( ( index, el ) => {
			const $this = jQuery( el );

			$this.find( '> *' ).not( $this.find( '> :first-child' ) ).each( ( childIndex, childEl ) => {
				jQuery( childEl ).remove();
			} );
		} );
	}

	/**
	 * CSS from another server cannot be loaded,
	 * that is the reason behind this method, fetching the content of the CSS and set it as an inline css.
	 *
	 * @returns {Promise<unknown[]>}
	 */
	loadExternalCss() {
		const selector = this.config.allowedCssUrls.map( ( allowedCssUrl ) => {
			return `link[href^="${ allowedCssUrl }"]`;
		} ).join( ', ' );

		return Promise.all( jQuery( selector ).map( ( index, el ) => {
			const $link = jQuery( el );

			return this.loadCss( $link.attr( 'href' ) )
				.then( () => $link.remove() );
		} ) );
	}

	/**
	 * Hide all the element except for the target element.
	 */
	hideUnnecessaryElements() {
		jQuery( 'body' ).prepend(
			this.$elementor
		);

		jQuery( 'body > *' ).not( this.$elementor ).css( 'display', 'none' );
	}

	/**
	 * Creates a png image.
	 *
	 * @returns {Promise<unknown>}
	 */
	createImage() {
		const pageLoadedPromise = new Promise( ( resolve ) => {
			window.addEventListener( 'load', () => {
				resolve();
			} );
		} );

		const timeOutPromise = new Promise( ( resolve ) => {
			setTimeout( () => {
				resolve();
			}, this.config.timeout );
		} );

		return Promise.race( [ pageLoadedPromise, timeOutPromise ] )
			.then( () => {
				this.log( 'Start creating screenshot.' );

				return domtoimage.toPng( document.body, {} );
			} );
	}

	/**
	 * Creates fake image element to get the size of the image later on.
	 *
	 * @param dataUrl
	 * @returns {Promise<HTMLImageElement>}
	 */
	createImageElement( dataUrl ) {
		const image = new Image();
		image.src = dataUrl;

		return new Promise( ( resolve ) => {
			image.onload = () => {
				resolve( image );
			};
		} );
	}

	/**
	 * Crop the image to requested sizes.
	 *
	 * @param image
	 * @returns {Promise<unknown>}
	 */
	cropCanvas( image ) {
		const cropCanvas = document.createElement( 'canvas' );
		const cropContext = cropCanvas.getContext( '2d' );
		const ratio = this.config.crop.width / image.width;

		cropCanvas.width = this.config.crop.width;
		cropCanvas.height = this.config.crop.height;

		cropContext.drawImage( image, 0, 0, image.width, image.height, 0, 0, image.width * ratio, image.height * ratio );

		return Promise.resolve( cropCanvas );
	}

	/**
	 * Send the image to the server.
	 *
	 * @param canvas
	 * @returns {*}
	 */
	save( canvas ) {
		return elementorCommon.ajax.addRequest( 'screenshot_save', {
			data: {
				post_id: this.config.post_id,
				screenshot: canvas.toDataURL( 'image/png' ),
			},
			success: ( url ) => {
				this.log( `Screenshot created: ${ encodeURI( url ) }` );
			},
			error: () => {
				this.log( 'Failed to create screenshot.' );
			},
		} );
	}

	/**
	 * @param url
	 * @returns {string}
	 */
	getScreenshotProxyUrl( url ) {
		return `${ this.config.home_url }?screenshot_proxy&nonce=${ this.config.nonce }&href=${ url }`;
	}

	/**
	 * Load one css file.
	 *
	 * @param url
	 * @returns {Promise<void>}
	 */
	loadCss( url ) {
		return fetch( url )
			.then( ( response ) => response.text() )
			.then( ( data ) => {
				// This is a specific use case when we need
				// to load the fonts of the library so we replace all the relative url with absolute.
				if ( url.startsWith( 'https://kit-pro.fontawesome.com' ) ) {
					data = data.replace( /url\(\.\.\/webfonts/g, 'url(https://kit-pro.fontawesome.com/releases/latest/webfonts' );
				}

				return data;
			} )
			.then( ( data ) => {
				const head = document.getElementsByTagName( 'head' )[ 0 ];
				const style = document.createElement( 'style' );

				style.appendChild( document.createTextNode( data ) );
				head.appendChild( style );

				return Promise.resolve();
			} );
	}

	/**
	 * Log messages for debugging.
	 *
	 * @param message
	 * @param timerMethod
	 */
	log( message, timerMethod = 'timeLog' ) {
		if ( ! elementorCommonConfig.isDebug ) {
			return;
		}

		// eslint-disable-next-line no-console
		console.log( message );

		// eslint-disable-next-line no-console
		console[ timerMethod ]( this.config.timerLabel );
	}
}

new Screenshot();
