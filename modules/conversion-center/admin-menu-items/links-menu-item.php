<?php
namespace Elementor\Modules\ConversionCenter\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Links_Menu_Item implements Admin_Menu_Item {

	private $parent_slug;

	public function __construct( $parent_slug ) {
		$this->parent_slug = $parent_slug;
	}

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return $this->parent_slug;
	}

	public function get_label() {
		return esc_html__( 'Links', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Links', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}
}
