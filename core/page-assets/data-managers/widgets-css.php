<?php
namespace Elementor\Core\Page_Assets\Data_Managers;

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
		$asset_css_file_exists = $this->get_file_data( 'exists' );

		$widget_css = '';

		if ( $asset_css_file_exists ) {
			$asset_url = $this->get_config_data( 'file_url' );
			$widget_css = sprintf( '<link rel="stylesheet" href="%s">', $asset_url );
		}

		return $widget_css;
	}
}
