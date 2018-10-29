<?php
namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class General extends Base_Category {

	public function get_title() {
		return __( 'General', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		return [
			[
				'title' => _x( 'My Templates', 'Template Library', 'elementor' ),
				'link' => admin_url( 'edit.php?post_type=' . Source_Local::CPT ),
			],
			[
				'title' => __( 'System Info', 'elementor' ),
				'icon' => 'info',
				'link' => admin_url( 'admin.php?page=elementor-system-info' ),
			],
			[
				'title' => __( 'Role Manager', 'elementor' ),
				'icon' => 'person',
				'link' => Role_Manager::get_url(),
			],
			[
				'title' => __( 'Knowledge Base', 'elementor' ),
				'link' => admin_url( 'admin.php?page=go_knowledge_base_site' ),
			],
		];
	}
}
