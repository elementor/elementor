<?php
namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * General Category
 *
 * Provides general items related to Elementor Admin.
 */
class General extends Base_Category {

	/**
	 * Get title.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'General', 'elementor' );
	}

	/**
	 * Get category items.
	 *
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function get_category_items( array $options = [] ) {
		return [
			'my-templates' => [
				'title' => _x( 'My Templates', 'Template Library', 'elementor' ),
				'icon' => 'library-save',
				'url' => admin_url( 'edit.php?post_type=' . Source_Local::CPT ),
				'keywords' => [ 'template', 'header', 'footer', 'single', 'archive', 'search', '404 page' ],
			],
			'system-info' => [
				'title' => __( 'System Info', 'elementor' ),
				'icon' => 'info',
				'url' => admin_url( 'admin.php?page=elementor-system-info' ),
				'keywords' => [ 'system', 'info', 'environment', 'elementor' ],
			],
			'role-manager' => [
				'title' => __( 'Role Manager', 'elementor' ),
				'icon' => 'person',
				'url' => Role_Manager::get_url(),
				'keywords' => [ 'role', 'manager', 'user', 'elementor' ],
			],
			'knowledge-base' => [
				'title' => __( 'Knowledge Base', 'elementor' ),
				'url' => admin_url( 'admin.php?page=go_knowledge_base_site' ),
				'keywords' => [ 'help', 'knowledge', 'docs', 'elementor' ],
			],
		];
	}
}
