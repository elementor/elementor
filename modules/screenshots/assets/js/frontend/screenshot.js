/* global ElementorScreenshotConfig, elementorFrontendConfig, jQuery */
class Screenshot {

	crop = {
		width: 1200,
		height: 1500,
	}

	/**
	 * Holds the screen shot Iframe
	 */
	$elementor;

	/**
	 * The config that provided from the backend
	 *
	 * @var object
	 */
	config;

	constructor() {
		jQuery( () => this.init() )
	}

	init() {
		this.$elementor = jQuery( ElementorScreenshotConfig.selector );
		this.config = { ...ElementorScreenshotConfig, ...{ post: { id: elementorFrontendConfig.post.id } } };

		if ( ! this.$elementor.length ) {
			console.warn( 'Screenshots: Elementor content was not found.' );
			return;
		}

		return Promise.resolve()
			.then( this.handleIFrames.bind( this ) )
			.then( this.handleSlides.bind( this ) )
			.then( this.hidePageHeaders.bind( this ) )
			.then( this.createCanvas.bind( this ) )
			.then( this.cropCanvas.bind( this ) )
			.then( this.save.bind( this ) )
	}

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

	handleSlides() {
		this.$elementor.find( '.elementor-slides' ).each( () => {
			const $this = jQuery( this );

			$this
				.attr(
					'data-slider_options',
					$this.attr( 'data-slider_options' )
						.replace( '"autoplay":true', '"autoplay":false' )
				);
		} );

		return Promise.resolve();
	}

	/**
	 * Creates the canvas capture the screenshot.
	 *
	 * @returns {Promise<unknown>}
	 */
	createCanvas() {
		return new Promise( ( resolve ) => {
			setTimeout( () => {
				html2canvas( this.$elementor.get( 0 ), {
					useCORS: true,
					foreignObjectRendering: false,
				} ).then( ( canvas ) => {
					jQuery( 'body' ).prepend( canvas )

					resolve( canvas )
				} );
			}, 5000 )
		} )
	}

	/**
	 * Crop canvas.
	 *
	 * @param canvas
	 * @returns {Promise<unknown>}
	 */
	cropCanvas( canvas ) {
		const cropCanvas = document.createElement( 'canvas' );
		const cropContext = cropCanvas.getContext( '2d' );
		const ratio = this.crop.width / canvas.width;

		cropCanvas.width = this.crop.width;
		cropCanvas.height = this.crop.height;

		cropContext.drawImage( canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width * ratio, canvas.height * ratio );

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
	 * @returns {Promise<void>}
	 */
	hidePageHeaders() {
		jQuery( 'body > *' )
			.not( this.$elementor.parents( 'body > *' ) )
			.css( 'display', 'none' );

		return Promise.resolve();
	}
}

new Screenshot()
