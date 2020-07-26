<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Import Export Module
 *
 * Responsible for initializing Elementor App functionality
 */
class Module extends BaseModule {
	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'import-export';
	}

	public function get_init_settings() {
		return [
			'custom_post_types' => [
				'post' => 'Posts',
				'page' => 'Pages',
			],
		];
	}
}
