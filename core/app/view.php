<?php
namespace Elementor\Core\App;

use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$editor_preferences = SettingsManager::get_settings_managers( 'editorPreferences' );
$ui_theme = $editor_preferences->get_model()->get_settings( 'ui_theme' );

/**
 * @var App $this
 */

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title><?php echo __( 'Elementor', 'elementor' ) . ' ... '; ?></title>
		<base target="_parent">
		<?php wp_print_styles(); ?>
	</head>
	<body class="<?php echo $ui_theme; ?>">
		<?php if ( 'auto' === $ui_theme ) { ?>
			<script>
				if ( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
					document.body.classList.add('dark');
				}
			</script>
		<?php } ?>
		<div id="e-app"></div>
		<?php wp_print_footer_scripts(); ?>
	</body>
</html>
