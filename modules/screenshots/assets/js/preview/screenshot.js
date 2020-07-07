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
			excludedCssUrls: [
				'https://kit-pro.fontawesome.com',
			],
			timeout: 15000, // Wait until screenshot taken or fail in 15 secs.
			render_timeout: 5000, // Wait until all the element will be loaded or 5 sec and then take screenshot.
			timerLabel: null,
		};

		/**
		 * hold the timeout timer
		 *
		 * @type {number|null}
		 */
		this.timeoutTimer = setTimeout( this.screenshotFailed.bind( this ), this.config.timeout );

		jQuery( () => this.init() );
	}

	/**
	 * The main method for this class.
	 */
	init() {
		this.$elementor = jQuery( ElementorScreenshotConfig.selector );
		this.config = {
			...this.config,
			...ElementorScreenshotConfig,
			timerLabel: `${ ElementorScreenshotConfig.post_id } - timer`,
		};

		this.log( 'Screenshot init', 'time' );

		if ( ! this.$elementor.length ) {
			elementorCommon.helpers.consoleWarn( 'Screenshots: Elementor content was not found.' );

			this.screenshotFailed();

			return;
		}

		this.handleIFrames();
		this.handleSlides();
		this.hideUnnecessaryElements();
		this.removeUnnecessaryElements();
		this.loadExternalCss();

		Promise.resolve()
			.then( this.createImage.bind( this ) )
			.then( this.createImageElement.bind( this ) )
			.then( this.cropCanvas.bind( this ) )
			.then( this.save.bind( this ) )
			.then( this.screenshotSucceed.bind( this ) )
			.catch( this.screenshotFailed.bind( this ) );
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
	 * CSS from another server cannot be loaded with the current dom to image library.
	 * this method take all the links from another domain and proxy them.
	 */
	loadExternalCss() {
		const excludedUrls = [
			this.config.home_url,
			...this.config.excludedCssUrls,
		];

		const notSelector = excludedUrls
			.map( ( url ) => `[href^="${ url }"]` )
			.join( ', ' );

		jQuery( 'link' ).not( notSelector ).each( ( index, el ) => {
			const $link = jQuery( el );
			const $newLink = $link.clone();

			$newLink.attr( 'href', this.getScreenshotProxyUrl( $link.attr( 'href' ) ) );

			jQuery( 'head' ).append( $newLink );
			$link.remove();
		} );
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
	 * Remove all the sections that should not be in the screenshot.
	 */
	removeUnnecessaryElements() {
		let currentHeight = 0;

		this.$elementor
			.find( ' .elementor-section-wrap > .elementor-section' )
			.filter( ( index, el ) => {
				let shouldBeRemoved = false;

				if ( currentHeight >= this.config.crop.height ) {
					shouldBeRemoved = true;
				}

				currentHeight += jQuery( el ).outerHeight();

				return shouldBeRemoved;
			} )
			.each( ( index, el ) => {
				el.remove();
			} );
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
			}, this.config.render_timeout );
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
			image.onload = () => resolve( image );
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
		cropCanvas.height = this.config.crop.height > image.height ? image.height : this.config.crop.height;

		cropContext.drawImage( image, 0, 0, image.width, image.height, 0, 0, image.width * ratio, image.height * ratio );

		return Promise.resolve( cropCanvas );
	}

	/**
	 * Send the image to the server.
	 *
	 * @param canvas
	 * @returns {Promise<unknown>}
	 */
	save( canvas ) {
		return new Promise( ( resolve, reject ) => {
			elementorCommon.ajax.addRequest( 'screenshot_save', {
				data: {
					post_id: this.config.post_id,
					screenshot: canvas.toDataURL( 'image/png' ),
				},
				success: ( url ) => {
					this.log( `Screenshot created: ${ encodeURI( url ) }` );

					resolve( url );
				},
				error: () => {
					this.log( 'Failed to create screenshot.' );

					reject();
				},
			} );
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
	 * Notify that the screenshot has been succeed.
	 */
	screenshotSucceed( imageUrl ) {
		this.screenshotDone( true, imageUrl );
	}

	/**
	 * Notify that the screenshot has been failed.
	 */
	screenshotFailed() {
		this.screenshotDone( false );
	}

	/**
	 * Final method of the screenshot.
	 *
	 * @param success
	 * @param imageUrl
	 */
	screenshotDone( success, imageUrl = null ) {
		clearTimeout( this.timeoutTimer );
		this.timeoutTimer = null;

		window.top.postMessage( {
			name: 'capture-screenshot-done',
			success,
			id: this.config.post_id,
			imageUrl,
		}, '*' );

		this.log( `Screenshot ${ success ? 'Succeed' : 'Failed' }.`, 'timeEnd' );
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
		console.log( `${ this.config.post_id } - ${ message }` );

		// eslint-disable-next-line no-console
		console[ timerMethod ]( this.config.timerLabel );
	}
}

new Screenshot();
