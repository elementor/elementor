<?php
namespace Elementor\Core\Page_Assets\Data_Managers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Font Icon Svg.
 *
 * @since 3.4.0
 */
class Font_Icon_Svg extends Base {
	protected $content_type = 'svg';

	protected $assets_category = 'font-icon';

	protected function get_asset_content() {
		$icon_data = $this->get_config_data( 'icon_data' );

		$file_data = json_decode( $this->get_file_data( 'content', $icon_data['library'] ), true );

		$icon_name = $icon_data['name'];

		$svg_data = $file_data['icons'][ $icon_name ];

		return [
			'width' => $svg_data[0],
			'height' => $svg_data[1],
			'path' => $svg_data[4],
			'key' => $this->get_key(),
		];
	}
}
