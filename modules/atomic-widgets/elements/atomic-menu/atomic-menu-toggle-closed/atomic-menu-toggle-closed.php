<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Toggle_Closed;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Icon_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Toggle_Closed extends Atomic_Menu_Locked_Element {
	const DEFAULT_ICON = 'fa-solid fa-bars';
	const DEFAULT_ICON_LIBRARY = 'fa-solid';

	public static $widget_description = 'What the menu toggle shows while the menu is closed. Accepts any element and holds an e-svg by default.';

	public static function get_type() {
		return Atomic_Menu::ELEMENT_TYPE_TOGGLE_CLOSED;
	}

	public function get_title() {
		return esc_html__( 'Toggle closed content', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-menu-bar';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'div';
	}

	protected function define_base_style_props(): array {
		return [
			'display' => String_Prop_Type::generate( 'flex' ),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Svg::generate()
				->settings( [
					'svg' => Icon_Prop_Type::generate( [
						'value' => String_Prop_Type::generate( static::DEFAULT_ICON ),
						'library' => String_Prop_Type::generate( static::DEFAULT_ICON_LIBRARY ),
					] ),
				] )
				->build(),
		];
	}
}
