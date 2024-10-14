<?php
namespace Elementor\Core\Page_Assets\Data_Managers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Responsive Widgets Data.
 *
 * @since 3.5.0
 */
class Responsive_Widgets extends Base {
	const RESPONSIVE_WIDGETS_DATABASE_KEY = 'responsive-widgets';

	const RESPONSIVE_WIDGETS_FILE_PATH = 'data/responsive-widgets.json';

	protected $content_type = 'json';

	protected $assets_category = 'widgets';

	protected function get_asset_content() {
		$data = $this->get_file_data( 'content' );

		if ( $data ) {
			$data = json_decode( $data, true );
		}

		return $data;
	}
}
