<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Element_Base;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Font_Icon_Svg extends Base {
	public function element_action( Element_Base $element_data ) {
		if ( 'icon' === $element_data->get_name() ) {
			$icon = $element_data->get_settings( 'selected_icon' );

			if ( 'svg' !== $icon['library'] ) {
				//$font_icon_svg_config = Font_Icon_Svg::get_icon_svg_config( $icon );

				// Saving font icon svg in the DB.
				//Plugin::$instance->assets_loader->init_asset_inline_content( $font_icon_svg_config );
			}
		}
	}

	public function is_action_needed() {
		return false;
	}
}
