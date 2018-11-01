<?php

namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Settings as ElementorSettings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Settings extends Base_Category {

	public function get_title() {
		return __( 'Settings', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		$settings_url = ElementorSettings::get_url();

		return [
			'general-settings' => [
				'title' => __( 'General Settings', 'elementor' ),
				'link' => $settings_url,
			],
			'style' => [
				'title' => __( 'Style', 'elementor' ),
				'link' => $settings_url . '#tab-style',
			],
			'integrations' => [
				'title' => __( 'Integrations', 'elementor' ),
				'icon' => 'integration',
				'link' => $settings_url . '#tab-integrations',
			],
			'advanced' => [
				'title' => __( 'Advanced', 'elementor' ),
				'link' => $settings_url . '#tab-advanced',
			],
		];
	}
}
