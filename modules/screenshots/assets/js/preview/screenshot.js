import environment from 'elementor-common/utils/environment';

/* global ElementorScreenshotConfig, jQuery */
class Screenshot extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
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
			timer_label: `${ ElementorScreenshotConfig.post_id } - timer`,
			...ElementorScreenshotConfig,
		};
	}

	getDefaultElements() {
		const $elementor = jQuery( ElementorScreenshotConfig.selector );

		return {
			$elementor,
			$bodyElementsWithOutElementor: jQuery( 'body > *' ).not( $elementor ),
			$sections: $elementor.find( ' .elementor-section-wrap > .elementor-section' ),
			$head: jQuery( 'head' ),
		};
	}

	onInit() {
		super.onInit();

		this.log( 'Screenshot init', 'time' );

		/**
		 * hold the timeout timer
		 *
		 * @type {number|null}
		 */
		this.timeoutTimer = setTimeout( this.screenshotFailed.bind( this ), this.getSettings( 'timeout' ) );

		return this.captureScreenshot();
	}

	/**
	 * The main method for this class.
	 */
	captureScreenshot() {
		if ( ! this.elements.$elementor.length ) {
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

		return Promise.resolve()
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
		this.elements.$elementor = jQuery( '<div>' ).css( {
			height: this.getSettings( 'crop.height' ),
			width: this.getSettings( 'crop.width' ),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		} );

		this.elements.$elementor.append(
			jQuery( '<h1>' ).css( { fontSize: '85px' } ).html( this.getSettings( 'empty_content_headline' ) )
		);

		document.body.prepend( this.elements.$elementor );
	}

	/**
	 * CSS from another server cannot be loaded with the current dom to image library.
	 * this method take all the links from another domain and proxy them.
	 */
	loadExternalCss() {
		const excludedUrls = [
			this.getSettings( 'home_url' ),
			...this.getSettings( 'excluded_external_css_urls' ),
		];

		const notSelector = excludedUrls
			.map( ( url ) => `[href^="${ url }"]` )
			.join( ', ' );

		jQuery( 'link' ).not( notSelector ).each( ( index, el ) => {
			const $link = jQuery( el ),
				$newLink = $link.clone();

			$newLink.attr( 'href', this.getScreenshotProxyUrl( $link.attr( 'href' ) ) );

			this.elements.$head.append( $newLink );
			$link.remove();
		} );
	}

	/**
	 * Make a proxy to images urls that has some problems with cross origin (like youtube).
	 */
	loadExternalImages() {
		const selector = this.getSettings( 'external_images_urls' )
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
		this.elements.$elementor.find( 'iframe' ).each( ( index, el ) => {
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
			this.elements.$elementor
		);

		this.elements.$bodyElementsWithOutElementor.css( 'display', 'none' );
	}

	/**
	 * Remove all the sections that should not be in the screenshot.
	 */
	removeUnnecessaryElements() {
		let currentHeight = 0;

		this.elements.$sections
			.filter( ( index, el ) => {
				let shouldBeRemoved = false;

				if ( currentHeight >= this.getSettings( 'crop.height' ) ) {
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
			}, this.getSettings( 'render_timeout' ) );
		} );

		return Promise.race( [ pageLoadedPromise, timeOutPromise ] )
			.then( () => {
				this.log( 'Start creating screenshot.' );

				// Safari browser has some problems with the images that dom-to-images
				// library creates, so in this specific case the screenshot uses html2canvas.
				// Note that dom-to-image creates more accurate screenshot in "not safari" browsers.
				if ( environment.safari ) {
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
		const width = this.getSettings( 'crop.width' );
		const height = this.getSettings( 'crop.height' );

		const cropCanvas = document.createElement( 'canvas' ),
			cropContext = cropCanvas.getContext( '2d' ),
			ratio = width / image.width;

		cropCanvas.width = width;
		cropCanvas.height = height > image.height ? image.height : height;

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
					post_id: this.getSettings( 'post_id' ),
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
		return `${ this.getSettings( 'home_url' ) }?screenshot_proxy&nonce=${ this.getSettings( 'nonce' ) }&href=${ url }`;
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
			id: this.getSettings( 'post_id' ),
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
		console.log( `${ this.getSettings( 'post_id' ) } - ${ message }` );

		// eslint-disable-next-line no-console
		console[ timerMethod ]( this.getSettings( 'timer_label' ) );
	}
}

jQuery( () => {
	new Screenshot();
} );
