<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Items;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Items extends Atomic_Menu_Locked_Element {
	public static function get_type() {
		return 'e-menu-items';
	}

	public function get_title() {
		return esc_html__( 'Menu items', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'ul';
	}

	protected function define_allowed_child_types() {
		return [ Atomic_Menu::ELEMENT_TYPE_ENTRY ];
	}

	protected function define_base_style_props(): array {
		return [
			'display' => String_Prop_Type::generate( 'flex' ),
			'flex-direction' => String_Prop_Type::generate( 'row' ),
			'gap' => Size_Prop_Type::generate( [
				'size' => 16,
				'unit' => 'px',
			] ),
			'list-style-type' => String_Prop_Type::generate( 'none' ),
		];
	}
}
