<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Entry;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Entry extends Atomic_Menu_Locked_Element {
	public static function get_type() {
		return 'e-menu-entry';
	}

	public function get_title() {
		return esc_html__( 'Menu entry', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'li';
	}

	protected function define_allowed_child_types() {
		return [ Atomic_Menu::ELEMENT_TYPE_ITEM ];
	}

	protected function define_base_style_props(): array {
		return [
			'width' => Size_Prop_Type::generate( [
				'size' => '',
				'unit' => 'auto',
			] ),
		];
	}
}
