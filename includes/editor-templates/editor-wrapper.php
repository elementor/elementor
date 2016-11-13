<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

?>
<!DOCTYPE html>
<!--[if lt IE 7]>
<html class="no-js lt-ie9 lt-ie8 lt-ie7" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>
<html class="no-js lt-ie9 lt-ie8" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>
<html class="no-js lt-ie9" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" <?php language_attributes(); ?>> <!--<![endif]-->
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?php echo __( 'Elementor', 'elementor' ) . ' | ' . get_the_title(); ?></title>
	<?php wp_head(); ?>
</head>
<body class="elementor-editor-active">
<div id="elementor-editor-wrapper">
	<div id="elementor-preview">
		<div id="elementor-loading">
			<div class="elementor-loader-wrapper">
				<div class="elementor-loader">
					<div class="elementor-loader-box"></div>
					<div class="elementor-loader-box"></div>
					<div class="elementor-loader-box"></div>
					<div class="elementor-loader-box"></div>
				</div>
				<div class="elementor-loading-title"><?php _e( 'Loading', 'elementor' ) ?></div>
			</div>
		</div>
		<div id="elementor-preview-responsive-wrapper" class="elementor-device-desktop elementor-device-rotate-portrait">
			<div id="elementor-preview-loading">
				<i class="fa fa-spin fa-circle-o-notch"></i>
			</div>
			<?php
			// IFrame will be create here by the Javascript later.
			?>
		</div>
	</div>
	<div id="elementor-panel" class="elementor-panel"></div>
</div>
<?php wp_footer(); ?>
</body>
</html>
