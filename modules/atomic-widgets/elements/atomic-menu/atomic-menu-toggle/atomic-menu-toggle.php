<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Toggle;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Toggle_Closed\Atomic_Menu_Toggle_Closed;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Toggle_Open\Atomic_Menu_Toggle_Open;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Base\Atomic_Menu_Locked_Element;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Menu_Toggle extends Atomic_Menu_Locked_Element {
	public static function get_type() {
		return 'e-menu-toggle';
	}

	public function get_title() {
		return esc_html__( 'Menu toggle', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return 'button';
	}

	protected function define_default_children() {
		return [
			Atomic_Menu_Toggle_Closed::generate()->build(),
			Atomic_Menu_Toggle_Open::generate()->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/' . static::get_type() => __DIR__ . '/atomic-menu-toggle.html.twig',
		];
	}

	protected function define_allowed_child_types() {
		return [ Atomic_Menu::ELEMENT_TYPE_TOGGLE_CLOSED, Atomic_Menu::ELEMENT_TYPE_TOGGLE_OPEN ];
	}
}
