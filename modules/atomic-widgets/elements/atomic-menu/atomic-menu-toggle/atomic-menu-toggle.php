<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Toggle;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Toggle extends Atomic_Menu_Locked_Element {
	public static $widget_description = 'The button that opens and closes the collapsed menu. Holds an e-menu-toggle-closed and an e-menu-toggle-open container, each with ordinary editable children. Icon-only by default.';

	public static function get_type() {
		return Atomic_Menu::ELEMENT_TYPE_TOGGLE;
	}

	public function get_title() {
		return esc_html__( 'Menu toggle', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-menu-bar';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'button';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'label-open' => String_Prop_Type::make()
				->default( esc_html__( 'Open menu', 'elementor' ) ),
			'label-close' => String_Prop_Type::make()
				->default( esc_html__( 'Close menu', 'elementor' ) ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_allowed_child_types() {
		return [ Atomic_Menu::ELEMENT_TYPE_TOGGLE_CLOSED, Atomic_Menu::ELEMENT_TYPE_TOGGLE_OPEN ];
	}

	protected function define_base_style_props(): array {
		return [
			'display' => String_Prop_Type::generate( 'flex' ),
			'cursor' => String_Prop_Type::generate( 'pointer' ),
			'border-style' => String_Prop_Type::generate( 'none' ),
			'color' => Color_Prop_Type::generate( 'currentColor' ),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/' . static::get_type() => __DIR__ . '/atomic-menu-toggle.html.twig',
		];
	}
}
