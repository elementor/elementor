<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Widgets_Css extends Base {
	public function unique_element_action( Element_Base $element_data ) {
		if ( 'widget' === $element_data->get_type() ) {
			$this->save_widgets_css( $element_data->get_group_name() );
		}
	}

	public function is_action_needed() {
		return false;
	}

	private function save_widgets_css( $widget_type ) {
		Plugin::$instance->assets_loader->init_asset_inline_content( $this->get_widget_css_config( $widget_type ) );
	}

	private function get_widget_css_config( $widget_file_name ) {
		$direction = is_rtl() ? '-rtl' : '';

		$css_file_path = 'css/widget-' . $widget_file_name . $direction . '.min.css';

		return [
			'content_type' => 'css',
			'assets_category' => 'widgets',
			'asset_key' => $widget_file_name,
			'current_version' => ELEMENTOR_VERSION,
			'asset_path' => ELEMENTOR_ASSETS_PATH . $css_file_path,
			'data' => [
				'asset_url' => ELEMENTOR_ASSETS_URL . $css_file_path,
			],
		];
	}
}
