<?php
namespace Elementor\Modules\LandingPages\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Flyout_Editor_Elementor_One_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Landing_Pages_Elementor_One_Menu_Item implements Flyout_Editor_Elementor_One_Menu_Item {

	private $function;

	public function __construct( $function ) {
		$this->function = $function;
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_label() {
		return esc_html__( 'Landing Pages', 'elementor' );
	}

	public function get_parent_slug() {
		return 'elementor-templates';
	}

	public function is_visible() {
		return is_callable( $this->function );
	}
}

