<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
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
		return esc_html__( 'Tools', 'elementor' );
	}

	public function get_id() {
		return 'tools';
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
	public function get_category_items( array $options = array() ) {
		$tools_url = ElementorTools::get_url();

		$items = array(
			'tools' => array(
				'title' => esc_html__( 'Tools', 'elementor' ),
				'icon' => 'tools',
				'url' => $tools_url,
				'keywords' => array( 'tools', 'regenerate css', 'safe mode', 'debug bar', 'sync library', 'elementor' ),
			),
			'replace-url' => array(
				'title' => esc_html__( 'Replace URL', 'elementor' ),
				'icon' => 'tools',
				'url' => $tools_url . '#tab-replace_url',
				'keywords' => array( 'tools', 'replace url', 'domain', 'elementor' ),
			),
			'maintenance-mode' => array(
				'title' => esc_html__( 'Maintenance Mode', 'elementor' ),
				'icon' => 'tools',
				'url' => $tools_url . '#tab-maintenance_mode',
				'keywords' => array( 'tools', 'maintenance', 'coming soon', 'elementor' ),
			),
			'import-export' => array(
				'title' => esc_html__( 'Import Export', 'elementor' ),
				'icon' => 'import-export',
				'url' => $tools_url . '#tab-import-export-kit',
				'keywords' => array( 'tools', 'import export', 'import', 'export', 'kit' ),
			),
		);

		if ( ElementorTools::can_user_rollback_versions() ) {
			$items['version-control'] = array(
				'title' => esc_html__( 'Version Control', 'elementor' ),
				'icon' => 'time-line',
				'url' => $tools_url . '#tab-versions',
				'keywords' => array( 'tools', 'version', 'control', 'rollback', 'beta', 'elementor' ),
			);
		}

		return $items;
	}
}
