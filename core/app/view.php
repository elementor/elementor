<?php
namespace Elementor\Core\App;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @var App $this
 */

$e_icons_css_url = $this->get_css_assets_url( 'elementor-icons', 'assets/lib/eicons/css/' ) . '?ver=5.6.2';
$common_css_url = $this->get_css_assets_url( 'common' ) . '?ver=' . ELEMENTOR_VERSION;

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?php echo __( 'Elementor', 'elementor' ) . ' | ' . get_the_title(); ?></title>
	<link type="text/css" rel="stylesheet" href="<?php echo $e_icons_css_url; ?>">
	<link type="text/css" rel="stylesheet" href="<?php echo $common_css_url; ?>">
</head>
<body>
<div id="elementor-app"></div>
<?php wp_print_footer_scripts(); ?>
</body>
</html>
