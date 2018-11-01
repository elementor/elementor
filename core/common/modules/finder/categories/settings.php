<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
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
				'keywords' => [ 'General', 'Settings' ],
			],
			'style' => [
				'title' => __( 'Style', 'elementor' ),
				'link' => $settings_url . '#tab-style',
				'keywords' => [ 'Style', 'Settings' ],
			],
			'integrations' => [
				'title' => __( 'Integrations', 'elementor' ),
				'icon' => 'integration',
				'link' => $settings_url . '#tab-integrations',
				'keywords' => [ 'Integrations', 'Settings', 'TypeKit', 'Facebook', 'reCAPTCHA', 'MailChimp', 'Drip', 'ActiveCampaign', 'GetResponse', 'ConvertKit' ],
			],
			'advanced' => [
				'title' => __( 'Advanced', 'elementor' ),
				'link' => $settings_url . '#tab-advanced',
				'keywords' => [ 'Advanced', 'Settings' ],
			],
		];
	}
}
