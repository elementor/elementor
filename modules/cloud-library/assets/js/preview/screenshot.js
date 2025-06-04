/* global ElementorScreenshotConfig */
class Screenshot extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			empty_content_headline: 'Empty Content.',
			crop: {
				width: ElementorScreenshotConfig?.crop?.width || 1200,
				height: ElementorScreenshotConfig?.crop?.height || 1500,
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
			image_placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
			isDebug: elementorCommonConfig.isElementorDebug,
			isDebugSvg: false,
			...ElementorScreenshotConfig,
		};
	}

	getDefaultElements() {
		const $elementor = jQuery( ElementorScreenshotConfig.selector );
		const $sections = $elementor.find( '.elementor-section-wrap > .elementor-section, .elementor > .elementor-section' );

		return {
			$elementor,
			$sections,
			$firstSection: $sections.first(),
			$notElementorElements: elementorCommon.elements.$body.find( '> *:not(style, link)' ).not( $elementor ),
			$head: jQuery( 'head' ),
		};
	}

	onInit() {
		super.onInit();

		this.log( 'Screenshot init', 'time' );

		/**
		 * Hold the timeout timer
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
		if ( ! this.elements.$elementor.length && ! this.getSettings( 'kit_id' ) ) {
			elementorCommon.helpers.consoleWarn(
				'Screenshots: The content of this page is empty, the module will create a fake conent just for this screenshot.',
			);

			this.createFakeContent();
		}

		this.removeUnnecessaryElements();
		this.handleIFrames();
		this.removeFirstSectionMargin();
		this.handleLinks();
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
			jQuery( '<h1>' ).css( { fontSize: '85px' } ).html( this.getSettings( 'empty_content_headline' ) ),
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
	 * Remove all the sections that should not be in the screenshot.
	 */
	removeUnnecessaryElements() {
		let currentHeight = 0;

		// We need to keep all elements as for Kit we render the entire homepage
		if ( this.getSettings( 'kit_id' ) ) {
			return;
		}

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

		// Some 3rd party plugins inject elements into the dom, so this method removes all
		// the elements that was injected, to make sure that it capture a screenshot only of the post itself.
		this.elements.$notElementorElements.remove();
	}

	/**
	 * Some urls make some problems to the svg parser.
	 * this method convert all the urls to just '/'.
	 */
	handleLinks() {
		elementorCommon.elements.$body.find( 'a' ).attr( 'href', '/' );
	}

	/**
	 * Remove unnecessary margin from the first element of the post (singles and footers).
	 */
	removeFirstSectionMargin() {
		this.elements.$firstSection.css( { marginTop: 0 } );
	}

	/**
	 * Creates a png image.
	 *
	 * @return {Promise<unknown>} URI containing image data
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

				if ( this.getSettings( 'isDebugSvg' ) ) {
					domtoimage.toSvg( document.body, {
						imagePlaceholder: this.getSettings( 'image_placeholder' ),
					} ).then( ( svg ) => this.download( svg ) );

					return Promise.reject( 'Debug SVG.' );
				}

				// TODO: Extract to util function.
				const isSafari = /^((?!chrome|android).)*safari/i.test( window.userAgent );

				// Safari browser has some problems with the images that dom-to-images
				// library creates, so in this specific case the screenshot uses html2canvas.
				// Note that dom-to-image creates more accurate screenshot in "not safari" browsers.
				if ( isSafari ) {
					this.log( 'Creating screenshot with "html2canvas"' );
					return html2canvas( document.body ).then( ( canvas ) => {
						return canvas.toDataURL( 'image/png' );
					} );
				}

				this.log( 'Creating screenshot with "dom-to-image"' );
				return domtoimage.toPng( document.body, { imagePlaceholder: this.getSettings('image_placeholder') } )
					.catch( () => {
						return html2canvas( document.body ).then( ( canvas ) => canvas.toDataURL( 'image/png' ) );
					} );
			} );
	}

	/**
	 * Download a uri, use for debugging the svg that created from dom to image libraries.
	 *
	 * @param {string} uri
	 */
	download( uri ) {
		const $link = jQuery( '<a/>', {
			href: uri,
			download: 'debugSvg.svg',
			html: 'Download SVG',
		} );

		elementorCommon.elements.$body.append( $link );

		$link.trigger( 'click' );
	}

	/**
	 * Creates fake image element to get the size of the image later on.
	 *
	 * @param {string} dataUrl
	 * @return {Promise<HTMLImageElement>} Image Element
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
	 * @param {HTMLImageElement} image
	 * @return {Promise<unknown>} Canvas
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
	 * @param {HTMLCanvasElement} canvas
	 * @return {Promise<unknown>} Screenshot URL
	 */
	save( canvas ) {
		const { key, action } = this.getSaveAction();

		const data = {
			[ key ]: this.getSettings( key ),
			screenshot: canvas.toDataURL( 'image/png' ),
		};

		return new Promise( ( resolve, reject ) => {
			if ( 'kit_id' === key ) {
				return resolve( data.screenshot );
			}

			elementorCommon.ajax.addRequest( action, {
				data,
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
	 * Mark this post screenshot as failed.
	 * @param {Error} e
	 */
	markAsFailed( e ) {
		return new Promise( ( resolve, reject ) => {
			const templateId = this.getSettings( 'template_id' );
			const postId = this.getSettings( 'post_id' );
			const kitId = this.getSettings( 'kit_id' );

			if ( kitId ) {
				resolve();
			} else {
				const route = templateId ? 'template_screenshot_failed' : 'screenshot_failed';

				const data = templateId ? {
					template_id: templateId,
					error: e.message || e.toString(),
				} : {
					post_id: postId,
				};

				elementorCommon.ajax.addRequest( route, {
					data,
					success: () => {
						this.log( `Marked as failed.` );

						resolve();
					},
					error: () => {
						this.log( 'Failed to mark this screenshot as failed.' );

						reject();
					},
				} );
			}
		} );
	}

	/**
	 * @param {string} url
	 * @return {string} Screenshot Proxy URL
	 */
	getScreenshotProxyUrl( url ) {
		return `${ this.getSettings( 'home_url' ) }?screenshot_proxy&nonce=${ this.getSettings( 'nonce' ) }&href=${ url }`;
	}

	/**
	 * Notify that the screenshot has been succeed.
	 *
	 * @param {string} imageUrl
	 */
	screenshotSucceed( imageUrl ) {
		this.screenshotDone( true, imageUrl );
	}

	/**
	 * Notify that the screenshot has been failed.
	 *
	 * @param {Error} e
	 */
	screenshotFailed( e ) {
		this.log( e, null );

		this.markAsFailed( e )
			.then( () => this.screenshotDone( false ) );
	}

	/**
	 * Final method of the screenshot.
	 *
	 * @param {boolean} success
	 * @param {string}  imageUrl
	 */
	screenshotDone( success, imageUrl = null ) {
		clearTimeout( this.timeoutTimer );
		this.timeoutTimer = null;
		const { message, key } = this.getSaveAction();

		// Send the message to the parent window and not to the top.
		// e.g: The `Theme builder` is loaded into an iFrame so the message of the screenshot
		// should be sent to the `Theme builder` window and not to the top window.
		window.parent.postMessage( {
			name: message,
			success,
			id: this.getSettings( key ),
			imageUrl,
		}, '*' );

		this.log( `Screenshot ${ success ? 'Succeed' : 'Failed' }.`, 'timeEnd' );
	}

	/**
	 * Log messages for debugging.
	 *
	 * @param {any}     message
	 * @param {string?} timerMethod
	 */
	log( message, timerMethod = 'timeLog' ) {
		if ( ! this.getSettings( 'isDebug' ) ) {
			return;
		}

		// eslint-disable-next-line no-console
		console.log(
			'string' === typeof message
				? `${ this.getSettings( 'post_id' ) } - ${ message }`
				: message,
		);

		if ( timerMethod ) {
			// eslint-disable-next-line no-console
			console[ timerMethod ]( this.getSettings( 'timer_label' ) );
		}
	}

	getSaveAction() {
		const config = this.getSettings();

		if ( config.kit_id ) {
			return {
				message: 'kit-screenshot-done',
				action: 'update_kit_preview',
				key: 'kit_id',
			};
		}

		if ( config.template_id ) {
			return {
				message: 'library/capture-screenshot-done',
				action: 'save_template_screenshot',
				key: 'template_id',
			};
		}

		return {
			message: 'capture-screenshot-done',
			action: 'screenshot_save',
			key: 'post_id',
		};
	}
}

jQuery( () => {
	new Screenshot();
} );
