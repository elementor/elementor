<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Toggle_Open;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Toggle_Open extends Atomic_Menu_Locked_Element {
	public static function get_type() {
		return 'e-menu-toggle-open';
	}

	public function get_title() {
		return esc_html__( 'Menu toggle open', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'div';
	}
}
