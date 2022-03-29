<?php
namespace Elementor\Core\Admin\Notices;

use Elementor\Core\Admin\Notices\Base_Notice;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Update_Php_Notice extends Base_Notice {

	/**
	 * Notice ID.
	 */
	const ID = 'elementor_update_php_warning';

	/**
	 * @inheritDoc
	 */
	public function should_print() {
		return ! is_php_version_compatible( '7.0' );
	}

	/**
	 * @inheritDoc
	 */
	public function get_config() {
		return [
			'id' => static::ID,
			'title' => esc_html__( 'Update your PHP to keep getting Elementor updates', 'elementor' ),
			'description' => esc_html__( 'Elementor\'s upcoming v3.7 will include a deprecation of PHP v5.6 that prevents you from receiving future updates. Make sure you update now - either manually or with your hosting provider.', 'elementor' ),
			'button' => [
				'text' => '<i class="dashicons dashicons-update" aria-hidden="true"></i>' . esc_html__( 'Show me how', 'elementor' ),
				'url' => 'https://go.elementor.com/wp-dash-php-deprecated/',
				'new_tab' => true,
				'type' => 'cta',
			],
		];
	}
}
