<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Tools as ElementorTools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Tools extends Base_Category {

	public function get_title() {
		return __( 'Tools', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		$tools_url = ElementorTools::get_url();

		return [
			'tools' => [
				'title' => __( 'Tools', 'elementor' ),
				'icon' => 'tools',
				'link' => $tools_url,
				'keywords' => [ 'Tools' ],
			],
			'replace-url' => [
				'title' => __( 'Replace URL', 'elementor' ),
				'icon' => 'tools',
				'link' => $tools_url . '#tab-replace_url',
				'keywords' => [ 'Tools', 'Replace URL', 'Domain' ],
			],
			'version-control' => [
				'title' => __( 'Version Control', 'elementor' ),
				'icon' => 'time-line',
				'link' => $tools_url . '#tab-versions',
				'keywords' => [ 'Tools', 'Version', 'Control', 'Beta' ],
			],
			'maintenance-mode' => [
				'title' => __( 'Maintenance Mode', 'elementor' ),
				'icon' => 'tools',
				'link' => $tools_url . '#tab-maintenance_mode',
				'keywords' => [ 'Tools', 'Maintenance', 'Coming Soon' ],
			],
		];
	}
}
