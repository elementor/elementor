<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Settings as ElementorSettings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Settings Category
 *
 * Provides items related to Elementor's settings.
 */
class Settings extends Base_Category {

	/**
	 * Get title.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'Settings', 'elementor' );
	}

	public function get_id() {
		return 'settings';
	}

	/**
	 * Get category items.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function get_category_items( array $options = [] ) {
		$settings_url = ElementorSettings::get_url();

		return [
			'general-settings' => [
				'title' => esc_html__( 'General Settings', 'elementor' ),
				'url' => $settings_url,
				'keywords' => [ 'general', 'settings', 'elementor' ],
			],
			'advanced' => [
				'title' => esc_html__( 'Advanced', 'elementor' ),
				'url' => $settings_url . '#tab-advanced',
				'keywords' => [ 'advanced', 'settings', 'elementor' ],
			],
			'experiments' => [
				'title' => esc_html__( 'Experiments', 'elementor' ),
				'url' => $settings_url . '#tab-experiments',
				'keywords' => [ 'settings', 'elementor', 'experiments' ],
			],
		];
	}
}
