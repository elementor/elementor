/* global ElementorScreenshotConfig, elementorFrontendConfig, jQuery */
class Screenshot {

	/**
	 * Holds the screen shot Iframe
	 */
	$elementor;

	/**
	 * The current post id
	 */
	postId;

	constructor() {
		jQuery( () => this.init() )
	}

	init() {
		this.$elementor = jQuery( ElementorScreenshotConfig.selector );
		this.postId = elementorFrontendConfig.post.id;

		if ( ! this.$elementor.length ) {
			console.warn( 'Screenshots: Elementor content was not found.' );
			return;
		}

		return Promise.resolve()
			.then( this.handleIFrames.bind( this ) )
			.then( this.handleSlides.bind( this ) )
			.then( this.createCanvas.bind( this ) )
			.then( this.cropCanvas.bind( this ) )
			.then( this.save.bind( this ) )
	}

	handleIFrames() {
		this.$elementor.find( 'iframe' ).each( () => {
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
					src: screenshotProxy( 'https://img.youtube.com/vi/' + matches[ 1 ] + '/0.jpg' ),
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
		return html2canvas( this.$elementor.get( 0 ), {
			useCORS: true,
			foreignObjectRendering: true,
		} );
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
		const ratio = 500 / canvas.width;

		cropCanvas.width = 500;
		cropCanvas.height = 700;

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
				post_id: this.postId,
				screenshot: canvas.toDataURL( 'image/png' ),
			},
		} );
	}
}

new Screenshot()
