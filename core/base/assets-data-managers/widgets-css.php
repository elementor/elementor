<?php
namespace Elementor\Core\Base\Assets_Data_Managers;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Assets Data.
 *
 * @since 3.3.0
 */
class Widgets_Css extends Base {
	protected $content_type = 'css';

	protected $assets_category = 'widgets';

	protected function get_asset_content() {
		$content_type = $this->content_type;

		$assets_category = $this->assets_category;

		$asset_key = $this->get_asset_key();

		$asset_path = $this->get_asset_path();

		$asset_css_file_size = Plugin::$instance->assets_loader->get_file_data( $content_type, $assets_category, $asset_key, $asset_path, 'size' );

		$widget_css = '';

		if ( $asset_css_file_size ) {
			// If the file size is larger than 8KB then calling the external CSS file, otherwise, printing inline CSS.
			if ( $asset_css_file_size > 8000 ) {
				$asset_url = $this->get_config_data( 'asset_url' );

				$widget_css = sprintf( '<link rel="stylesheet" href="%s">', $asset_url );
			} else {
				$widget_css = Plugin::$instance->assets_loader->get_file_data( $content_type, $assets_category, $asset_key, $asset_path, 'content' );
				$widget_css = sprintf( '<style>%s</style>', $widget_css );
			}
		}

		return $widget_css;
	}
}
