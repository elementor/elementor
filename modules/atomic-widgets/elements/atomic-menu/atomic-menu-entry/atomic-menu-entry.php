<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Entry;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Submenu_Entitlement;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Entry extends Atomic_Menu_Locked_Element {
	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'submenu_entitlement', [
			'locked' => Submenu_Entitlement::is_locked(),
			'promotion' => Submenu_Entitlement::get_promotion(),
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

	protected function define_base_style_props(): array {
		return [
			'width' => Size_Prop_Type::generate( [
				'size' => '',
				'unit' => 'auto',
			] ),
		];
	}
}
