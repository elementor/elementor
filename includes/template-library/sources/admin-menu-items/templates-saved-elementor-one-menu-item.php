<?php
namespace Elementor\Includes\TemplateLibrary\Sources\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;
use Elementor\Core\Editor\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Templates_Saved_Elementor_One_Menu_Item implements Flyout_Editor_Elementor_One_Menu_Item {

	private $url;

	public function __construct( $url ) {
		$this->url = $url;
	}

	public function get_capability() {
		return Editor::EDITING_CAPABILITY;
	}

	public function get_label() {
		return esc_html__( 'Saved Templates', 'elementor' );
	}

	public function get_parent_slug() {
		return 'elementor-templates';
	}

	public function is_visible() {
		return true;
	}
}

