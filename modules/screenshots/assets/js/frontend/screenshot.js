var ScreenshotModule = function() {
	var createScreenshot = function() {
		var $elementor = jQuery( ElementorScreenshotConfig.selector ),
			canvas = document.createElement( 'canvas' );
		if ( ! $elementor.length ) {
			console.log( 'Screenshots: Elementor content was not found.' );
			return;
		}

		canvas.width = $elementor.width();
		canvas.height = $elementor.height();

		// This tags causes browser crash
		jQuery( 'head' ).find( 'link[rel=prev], link[rel=next]' ).remove();

		var $html = jQuery( 'html' ).clone();

		$html.find( 'script' ).remove();

		rasterizeHTML.drawHTML( $html.html(), canvas, {
			width: $elementor.width(),
			height: $elementor.height()
		} ).then( function( renderResult ) {
			var cropCanvas = document.createElement( 'canvas' ),
				cropContext = cropCanvas.getContext( '2d' ),
				ratio = 500 / canvas.width;

			cropCanvas.width = 500;
			cropCanvas.height = 700;

			jQuery( 'body' ) .append( renderResult.image );

			cropContext.drawImage( canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width * ratio, canvas.height * ratio );

			jQuery.ajax( ElementorScreenshotConfig.ajax_url, {
				method: 'POST',
				data: {
					action: 'elementor_save_screenshot',
					post_id: ElementorScreenshotConfig.post_id,
			screenshot: cropCanvas.toDataURL( 'image/png' )
		}
		} );
		});
	};

	createScreenshot();
};

jQuery( function() {
	var $elementor = jQuery( ElementorScreenshotConfig.selector );

// Iframes cannot be captured.
	$elementor.find( 'iframe' ).each( function() {
		var $iframe = jQuery( this ),
			$iframeMask = jQuery( '<div />', {
				css: {
					'background': 'gray',
					'width': $iframe.width(),
					'height': $iframe.height()
				}
		} );

		if ( $iframe.next().is( '.elementor-custom-embed-image-overlay' ) ) {
			var regex = /url\(\"(.*)\"/gm;
			var url = $iframe.next().css( 'backgroundImage' );
			var matches = regex.exec( url );

			$iframeMask.css( {
				background: $iframe.next().css( 'background' )
			} );

			$iframeMask.append( jQuery( '<img />', {
				src: matches[1],
				css: {
					'width': $iframe.width(),
					'height': $iframe.height()
				}
			} ) );

			$iframe.next().remove();
		}

		$iframe.before( $iframeMask );
		$iframe.remove();
	});

	$elementor.find( '.elementor-slides' ).each( function() {
		var $this = jQuery( this );
		$this.attr( 'data-slider_options', $this.attr( 'data-slider_options' ).replace( '"autoplay":true', '"autoplay":false'));
	});

	setTimeout( function() {
		new ScreenshotModule();
	}, 5000	);
});
