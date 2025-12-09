<?php
namespace Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems;

use Elementor\Core\Admin\Menu\Elementor_One_Menu_Manager;
use Elementor\Core\Admin\Menu\Interfaces\Editor_Elementor_One_Menu_Item;
use Elementor\Core\Editor\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Templates_Elementor_One_Menu_Item implements Editor_Elementor_One_Menu_Item {

	private $url;

	public function __construct( $url ) {
		$this->url = $url;
	}

	public function get_capability() {
		return Editor::EDITING_CAPABILITY;
	}

	public function get_label() {
		return esc_html__( 'Templates', 'elementor' );
	}

	public function get_parent_slug() {
		return Elementor_One_Menu_Manager::ROOT_MENU_SLUG;
	}

	public function is_visible() {
		return true;
	}
}

