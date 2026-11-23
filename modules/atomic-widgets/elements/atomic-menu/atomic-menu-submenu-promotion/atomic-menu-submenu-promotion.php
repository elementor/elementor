<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Submenu_Promotion;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Atomic_Pro_Promotion_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Submenu_Promotion extends Atomic_Pro_Promotion_Element_Base {
	const TYPE = Atomic_Menu::ELEMENT_TYPE_SUBMENU;
	const POSITION_MENU_ITEM = 'menu-item';
	const POSITIONS = [ self::POSITION_MENU_ITEM, 'menu-container', 'viewport' ];
	const ALIGNMENT_START = 'start';
	const ALIGNMENTS = [ self::ALIGNMENT_START, 'center', 'end' ];

	public static function get_type() {
		return self::TYPE;
	}

	public static function get_element_type(): string {
		return self::TYPE;
	}

	public function get_title() {
		return esc_html__( 'Submenu', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'div' );
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'position-relative-to' => String_Prop_Type::make()
				->enum( self::POSITIONS )
				->default( self::POSITION_MENU_ITEM ),
			'horizontal-alignment' => String_Prop_Type::make()
				->enum( self::ALIGNMENTS )
				->default( self::ALIGNMENT_START ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-menu-submenu-promotion' => __DIR__ . '/atomic-menu-submenu-promotion.html.twig',
		];
	}
}
