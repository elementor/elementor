<?php
namespace Elementor\Modules\LandingPages;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Landing_Pages_Menu_Item implements Renderable_Admin_Menu_Item {

	private $callback;

	public function __construct( callable $callback ) {
		$this->callback = $callback;
	}

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Source_Local::ADMIN_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Landing Pages', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Landing Pages', 'elementor' );
	}

	public function get_position() {
		return 2;
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function callback() {
		$callback = $this->callback;

		$callback();
	}
}
