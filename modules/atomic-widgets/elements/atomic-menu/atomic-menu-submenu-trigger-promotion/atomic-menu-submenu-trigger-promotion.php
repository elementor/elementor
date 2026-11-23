<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Submenu_Trigger_Promotion;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Atomic_Pro_Promotion_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Submenu_Trigger_Promotion extends Atomic_Pro_Promotion_Element_Base {
	const TYPE = Atomic_Menu::ELEMENT_TYPE_SUBMENU_TRIGGER;

	public static function get_type() {
		return self::TYPE;
	}

	public static function get_element_type(): string {
		return self::TYPE;
	}

	public function get_title() {
		return esc_html__( 'Submenu trigger', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'button';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'show-indicator' => Boolean_Prop_Type::make()
				->default( true ),
			'closed-angle' => Number_Prop_Type::make()
				->default( 0 ),
			'open-angle' => Number_Prop_Type::make()
				->default( 0 ),
			'label-open' => String_Prop_Type::make()
				->default( esc_html__( 'Open submenu', 'elementor' ) ),
			'label-close' => String_Prop_Type::make()
				->default( esc_html__( 'Close submenu', 'elementor' ) ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-menu-submenu-trigger-promotion' => __DIR__ . '/atomic-menu-submenu-trigger-promotion.html.twig',
		];
	}
}
