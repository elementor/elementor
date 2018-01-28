<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<?php if ( ! current_theme_supports( 'title-tag' ) ) : ?>
		<title><?php echo wp_get_document_title(); ?></title>
	<?php endif; ?>
	<?php wp_head(); ?>

</head>
<body <?php body_class(); ?>>
<?php

while ( have_posts() ) :
	the_post();
	the_content();
endwhile;

add_filter('show_admin_bar', '__return_false');
wp_footer();
?>

<script>
	var ScreenshotModule = function() {
		var self = this;

		var createScreenshot = function() {
			var $elementor = jQuery( 'body > .elementor' );

			var canvas = document.createElement( 'canvas' );

			canvas.width=$elementor.width();
				canvas.height=$elementor.height();
			var	context = canvas.getContext('2d');

			// This tags causes browser crash
			jQuery( 'head' ).find( 'link[rel=prev], link[rel=next]' ).remove();

			var $html = jQuery( 'html' ).clone();

			$html.find( 'script' ).remove();

			rasterizeHTML.drawHTML( $html.html(), canvas, {
				width:$elementor.width(),
				height:$elementor.height()
			} ).then(function (renderResult) {
				var cropCanvas = document.createElement( 'canvas' ),
					cropContext = cropCanvas.getContext( '2d' ),
					ratio = 250 / canvas.width;

				cropCanvas.width = 500;
				cropCanvas.height = 700;

				jQuery( 'body' ) .append( renderResult.image );

				cropContext.drawImage( canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width * ratio, canvas.height * ratio );

				jQuery.ajax( '<?php echo admin_url( '/admin-ajax.php' ) ?>', {
					method: 'POST' +
					'' +
					'',
					data: {
						action: 'elementor_save_screenshot',
						post_id: <?php echo get_the_ID() ?>,
						screenshot: cropCanvas.toDataURL( 'image/png' )
					}
				} );
			});
		};

		createScreenshot();
	};

	var $elementor = jQuery( 'body > .elementor' );

	$elementor.find( 'iframe' ).before( '<div style="background: gray;' +
		'position: absolute;' +
		'z-index: 99999;' +
		'width: 100%;' +
		'height: 100%;' +
		'}"></div>');

	$elementor.find('.elementor-slides').each( function () {
		var $this = jQuery( this );
		$this.attr('data-slider_options', $this.attr('data-slider_options').replace( '"autoplay":true', '"autoplay":false'));
	});

	jQuery( function () {

		setTimeout( function () {
			new ScreenshotModule();
		}, 2000	);

	});

</script>
</body>
</html>
