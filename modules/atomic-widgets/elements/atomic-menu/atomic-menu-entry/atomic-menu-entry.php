<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Entry;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Submenu_Entitlement;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Entry extends Atomic_Menu_Locked_Element {
	const SUBMENU_PROP = 'submenu';

	public function get_meta(): array {
		return array_merge( parent::get_meta(), [
			'submenu_entitlement' => [
				'locked' => Submenu_Entitlement::is_locked(),
				'promotion' => Submenu_Entitlement::get_promotion(),
			],
		] );
	}

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

	protected static function define_props_schema(): array {
		return array_merge( parent::define_props_schema(), [
			self::SUBMENU_PROP => Boolean_Prop_Type::make()
				->default( false )
				->description( 'Whether the entry has a submenu. When true the entry holds an e-menu-submenu-trigger and an e-menu-submenu after its e-menu-item.' ),
		] );
	}

	public function print_content() {
		if ( ! Plugin::$instance->editor->is_edit_mode() && $this->is_empty() ) {
			return;
		}

		parent::print_content();
	}

	private function is_empty(): bool {
		foreach ( $this->get_children() as $item ) {
			if ( ! empty( $item->get_children() ) ) {
				return false;
			}
		}

		return true;
	}

	protected function define_allowed_child_types() {
		return [
			Atomic_Menu::ELEMENT_TYPE_ITEM,
			Atomic_Menu::ELEMENT_TYPE_SUBMENU_TRIGGER,
			Atomic_Menu::ELEMENT_TYPE_SUBMENU,
		];
	}

	protected function define_children_dependencies(): array {
		return [
			$this->submenu_layer( Atomic_Menu::ELEMENT_TYPE_SUBMENU_TRIGGER, Atomic_Menu::ELEMENT_TYPE_ITEM ),
			$this->submenu_layer( Atomic_Menu::ELEMENT_TYPE_SUBMENU, Atomic_Menu::ELEMENT_TYPE_SUBMENU_TRIGGER ),
		];
	}

	private function submenu_layer( string $child_type, string $after_type ): Child_Dependency {
		return Child_Dependency::for( $child_type )
			->when(
				Dependency_Manager::make()->where( [
					'operator' => 'eq',
					'path' => [ self::SUBMENU_PROP ],
					'value' => true,
				] )
			)
			->position( Element_Position::after_type( $after_type ) )
			->stash( true )
			->default_model(
				Element_Builder::make( $child_type )
					->is_locked( true )
					->hydrate_default_children( true )
					->build()
			);
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
