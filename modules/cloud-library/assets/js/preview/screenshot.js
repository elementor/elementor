import { toCanvas } from 'html-to-image';

/* global ElementorScreenshotConfig */
class Screenshot extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			empty_content_headline: 'Empty Content.',
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
			image_placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
			isDebug: elementorCommonConfig.isElementorDebug,
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
		return Promise.resolve()
			.then( this.createImage.bind( this ) )
			.then( this.save.bind( this ) )
			.then( this.screenshotSucceed.bind( this ) )
			.catch( this.screenshotFailed.bind( this ) );
	}

	/**
	 * Creates a WebP image using html-to-image library.
	 *
	 * @return {Promise<string>} URI containing image data
	 */
	async createImage() {
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

		await Promise.race( [ pageLoadedPromise, timeOutPromise ] );

		try {
			// Re-select element if not found (DOM might not be ready during init)
			let $elementorElement = this.elements.$elementor;
			if ( ! $elementorElement.length ) {
				$elementorElement = jQuery( ElementorScreenshotConfig.selector );
			}

			// Fallback: Find the main Elementor container if the specific selector fails
			if ( ! $elementorElement.length ) {
				// Look for the main Elementor container (not header/footer)
				$elementorElement = jQuery( 'body > div.elementor:not(.elementor-location-header):not(.elementor-location-footer)' );
			}

			if ( ! $elementorElement.length ) {
				throw new Error( 'Elementor container not found. Selector: ' + ElementorScreenshotConfig.selector );
			}

			const canvas = await toCanvas( $elementorElement[ 0 ], {
				quality: 0.15,
				imagePlaceholder: this.getSettings( 'image_placeholder' ),
				backgroundColor: null, // Use actual background
				style: {
					transform: 'scale(1)',
					transformOrigin: 'top left',
				},
			} );

			return canvas.toDataURL( 'image/webp', 0.15 );
		} catch ( error ) {
			throw error;
		}
	}

	/**
	 * Send the image to the server.
	 *
	 * @param {string} dataUrl
	 * @return {Promise<string>} Screenshot URL
	 */
	save( dataUrl ) {
		const { key, action } = this.getSaveAction();

		const data = {
			[ key ]: this.getSettings( key ),
			screenshot: dataUrl,
		};

		return new Promise( ( resolve, reject ) => {
			if ( 'kit_id' === key ) {
				return resolve( data.screenshot );
			}

			elementorCommon.ajax.addRequest( action, {
				data,
				success: ( url ) => {
					resolve( url );
				},
				error: () => {
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
						resolve();
					},
					error: () => {
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
