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
			empty_content_headline: 'Empty Content.',
			crop: {
				width: 1200,
				height: 1500,
			},
			excluded_external_css_urls: [
				'https://kit-pro.fontawesome.com',
			],
			external_images_urls: [
				'https://i.ytimg.com', // Youtube images domain.
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
			timer_label: `${ ElementorScreenshotConfig.post_id } - timer`,
		};

		this.log( 'Screenshot init', 'time' );

		if ( ! this.$elementor.length ) {
			elementorCommon.helpers.consoleWarn(
				'Screenshots: The content of this page is empty, the module will create a fake conent just for this screenshot.'
			);

			this.createFakeContent();
		}

		this.hideUnnecessaryElements();
		this.removeUnnecessaryElements();
		this.handleIFrames();
		this.loadExternalCss();
		this.loadExternalImages();

		Promise.resolve()
			.then( this.createImage.bind( this ) )
			.then( this.createImageElement.bind( this ) )
			.then( this.cropCanvas.bind( this ) )
			.then( this.save.bind( this ) )
			.then( this.screenshotSucceed.bind( this ) )
			.catch( this.screenshotFailed.bind( this ) );
	}

	/**
	 * Fake content for documents that dont have any content.
	 */
	createFakeContent() {
		this.$elementor = jQuery( '<div></div>' ).css( {
			height: this.config.crop.height,
			width: this.config.crop.width,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		} );

		this.$elementor.append(
			jQuery( '<h1></h1>' ).css( { fontSize: '85px' } ).html( this.config.empty_content_headline )
		);

		document.body.prepend( this.$elementor );
	}

	/**
	 * CSS from another server cannot be loaded with the current dom to image library.
	 * this method take all the links from another domain and proxy them.
	 */
	loadExternalCss() {
		const excludedUrls = [
			this.config.home_url,
			...this.config.excluded_external_css_urls,
		];

		const notSelector = excludedUrls
			.map( ( url ) => `[href^="${ url }"]` )
			.join( ', ' );

		jQuery( 'link' ).not( notSelector ).each( ( index, el ) => {
			const $link = jQuery( el ),
				$newLink = $link.clone();

			$newLink.attr( 'href', this.getScreenshotProxyUrl( $link.attr( 'href' ) ) );

			jQuery( 'head' ).append( $newLink );
			$link.remove();
		} );
	}

	/**
	 * Make a proxy to images urls that has some problems with cross origin (like youtube).
	 */
	loadExternalImages() {
		const selector = this.config.external_images_urls
			.map( ( url ) => `img[src^="${ url }"]` )
			.join( ', ' );

		jQuery( selector ).each( ( index, el ) => {
			const $img = jQuery( el );

			$img.attr( 'src', this.getScreenshotProxyUrl( $img.attr( 'src' ) ) );
		} );
	}

	/**
	 * Html to images libraries can not snapshot IFrames
	 * this method convert all the IFrames to some other elements.
	 */
	handleIFrames() {
		this.$elementor.find( 'iframe' ).each( ( index, el ) => {
			const $iframe = jQuery( el ),
				$iframeMask = jQuery( '<div />', {
					css: {
						background: 'gray',
						width: $iframe.width(),
						height: $iframe.height(),
					},
				} );

			$iframe.before( $iframeMask );
			$iframe.remove();
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

				const isSafari = /^((?!chrome|android).)*safari/i.test( navigator.userAgent );

				if ( isSafari ) {
					this.log( 'Creating screenshot with "html2canvas"' );
					return html2canvas( document.body ).then( ( canvas ) => {
						return canvas.toDataURL( 'image/png' );
					} );
				}

				this.log( 'Creating screenshot with "dom-to-image"' );
				return domtoimage.toPng( document.body );
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
		const cropCanvas = document.createElement( 'canvas' ),
			cropContext = cropCanvas.getContext( '2d' ),
			ratio = this.config.crop.width / image.width;

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
		console[ timerMethod ]( this.config.timer_label );
	}
}

new Screenshot();
