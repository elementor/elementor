<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Tools as ElementorTools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Tools Category
 *
 * Provides items related to Elementor's tools.
 */
class Tools extends Base_Category {

	/**
	 * Get title.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Tools', 'elementor' );
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
		$tools_url = ElementorTools::get_url();

		return [
			'tools' => [
				'title' => __( 'Tools', 'elementor' ),
				'icon' => 'tools',
				'url' => $tools_url,
				'keywords' => [ 'tools', 'regenerate css', 'safe mode', 'debug bar', 'sync library', 'elementor' ],
			],
			'replace-url' => [
				'title' => __( 'Replace URL', 'elementor' ),
				'icon' => 'tools',
				'url' => $tools_url . '#tab-replace_url',
				'keywords' => [ 'tools', 'replace url', 'domain', 'elementor' ],
			],
			'version-control' => [
				'title' => __( 'Version Control', 'elementor' ),
				'icon' => 'time-line',
				'url' => $tools_url . '#tab-versions',
				'keywords' => [ 'tools', 'version', 'control', 'rollback', 'beta', 'elementor' ],
			],
			'maintenance-mode' => [
				'title' => __( 'Maintenance Mode', 'elementor' ),
				'icon' => 'tools',
				'url' => $tools_url . '#tab-maintenance_mode',
				'keywords' => [ 'tools', 'maintenance', 'coming soon', 'elementor' ],
			],
		];
	}
}
