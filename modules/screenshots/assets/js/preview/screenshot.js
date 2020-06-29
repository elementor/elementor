/* global ElementorScreenshotConfig, elementorFrontendConfig, jQuery */
class Screenshot {
	constructor() {
		/**
		 * Holds the screen shot Iframe
		 */
		this.$elementor = null

		/**
		 * The config that provided from the backend
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
				'https://use.typekit.net'
			]
		};

		jQuery( () => this.init() )
	}

	init() {
		this.$elementor = jQuery( ElementorScreenshotConfig.selector );
		this.config = {
			...this.config,
			...ElementorScreenshotConfig,
			...{ post: { id: elementorFrontendConfig.post.id } }
		};

		if ( ! this.$elementor.length ) {
			console.warn( 'Screenshots: Elementor content was not found.' );
			return;
		}

		return Promise.resolve()
			.then( this.handleIFrames.bind( this ) )
			.then( this.handleSlides.bind( this ) )
			.then( this.loadExternalCss.bind( this ) )
			.then( this.hideUnnecessaryElements.bind( this ) )
			.then( this.createImage.bind( this ) )
			.then( this.createImageElement.bind( this ) )
			.then( this.cropCanvas.bind( this ) )
			.then( this.save.bind( this ) )
	}

	/**
	 * Html to images libraries can not snapshot iframes
	 * This method convert all the iframes to some other elements.
	 *
	 * @returns {Promise<void>}
	 */
	handleIFrames() {
		const $self = this;

		this.$elementor.find( 'iframe' ).each( function () {
			const $iframe = jQuery( this )
			const $iframeMask = jQuery( '<div />', {
				css: {
					background: 'gray',
					width: $iframe.width(),
					height: $iframe.height(),
				},
			} );

			if ( $iframe.next().is( '.elementor-custom-embed-image-overlay' ) ) {
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

			} else if ( -1 !== $iframe.attr( 'src' ).search( 'youtu' ) ) {
				const regex = /^.*(?:youtu.be\/|youtube(?:-nocookie)?.com\/(?:(?:watch)??(?:.*&)?vi?=|(?:embed|v|vi|user)\/))([^?&"'>]+)/;
				const matches = regex.exec( $iframe.attr( 'src' ) );

				$iframeMask.append( jQuery( '<img />', {
					src: $self.getScreenshotProxyUrl( `https://img.youtube.com/vi/${matches[ 1 ]}/0.jpg`, $self.config ),
					crossOrigin: 'Anonymous',
					css: {
						width: $iframe.width(),
						height: $iframe.height(),
					},
				} ) );
			}

			$iframe.before( $iframeMask );
			$iframe.remove();
		} );

		return Promise.resolve();
	}

	/**
	 * Slides should show only the first slide, all the other slides will be removed
	 *
	 * @returns {Promise<void>}
	 */
	handleSlides() {
		this.$elementor.find( '.elementor-slides' ).each( function () {
			const $this = jQuery( this );

			$this.find( '> *' ).not( $this.find( '> :first-child' ) ).each( function () {
				jQuery( this ).remove()
			} );
		} );

		return Promise.resolve();
	}

	/**
	 * CSS from another server cannot be loaded,
	 * That is the reason behind this method, fetching the content of the CSS and set it as an inline css.
	 *
	 * @returns {Promise<unknown[]>}
	 */
	loadExternalCss() {
		const $self = this;

		const selector = this.config.allowedCssUrls.map( allowedCssUrl => {
			return `link[href^="${allowedCssUrl}"]`;
		} ).join( ', ' );

		return Promise.all( jQuery( selector ).map( function () {
			return $self.loadCss( jQuery( this ).attr( 'href' ) )
				.then( () => jQuery( this ).remove() )
		} ) )
	}

	/**
	 * hide all the element except for the target element.
	 *
	 * @returns {Promise<void>}
	 */
	hideUnnecessaryElements() {
		jQuery( 'body' ).prepend(
			this.$elementor
		);

		jQuery( 'body > *' ).not( this.$elementor ).css( 'display', 'none' );

		return Promise.resolve();
	}

	/**
	 * Creates a png image
	 *
	 * @returns {Promise<unknown>}
	 */
	createImage() {
		return new Promise( ( resolve ) => {
			setTimeout( () => {
				domtoimage.toPng( this.$elementor.parents( 'body' ).get( 0 ), {} )
					.then( ( dataUrl ) => {
						resolve( dataUrl )
					} )
			}, 5000 )
		} )
	}

	/**
	 * Creates fake image element to get the size of the image later on.
	 *
	 * @param dataUrl
	 * @returns {Promise<HTMLImageElement>}
	 */
	createImageElement( dataUrl ) {
		const image = new Image()
		image.src = dataUrl

		return new Promise( resolve => {
			image.onload = () => {
				resolve( image )
			}
		} )
	}

	/**
	 * Crop the image to requested sizes
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

		return Promise.resolve( cropCanvas )
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
				post_id: this.config.post.id,
				screenshot: canvas.toDataURL( 'image/png' ),
			},
		} );
	}

	/**
	 * @param url
	 * @param config
	 * @returns {string}
	 */
	getScreenshotProxyUrl( url, config ) {
		return `${config.home_url}?screenshot_proxy&nonce=${config.nonce}&href=${url}`;
	}

	/**
	 * load one css file
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
					data = data.replace( /url\(\.\.\/webfonts/g, 'url(https://kit-pro.fontawesome.com/releases/latest/webfonts' )
				}

				return data
			} )
			.then( data => {
				const head = document.getElementsByTagName( 'head' )[ 0 ];
				const style = document.createElement( 'style' );

				style.appendChild( document.createTextNode( data ) );
				head.appendChild( style );

				return Promise.resolve()
			} )
	}
}

new Screenshot()
