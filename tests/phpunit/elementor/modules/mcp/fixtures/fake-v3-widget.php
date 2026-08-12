<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Minimal V3 Widget_Base stub used by MCP tests to exercise the V3 widget
 * allowlist end-to-end without depending on Elementor Pro.
 *
 * Elementor's element manager clones registrations by calling `new $class( $data, $args )`,
 * so the widget name must live on the class itself, not on constructor input. Subclass
 * per V3 widget name.
 */
abstract class Fake_V3_Widget extends Widget_Base {

	public function get_title() {
		return 'Fake ' . $this->get_name();
	}

	protected function register_controls() {
		$this->start_controls_section( 'section', [ 'label' => 'Section' ] );
		$this->add_control( 'menu', [ 'label' => 'Menu', 'type' => Controls_Manager::TEXT ] );
		$this->add_control( 'layout', [ 'label' => 'Layout', 'type' => Controls_Manager::TEXT ] );
		$this->end_controls_section();
	}

	protected function render() {
	}
}

class Fake_V3_Nav_Menu_Widget extends Fake_V3_Widget {
	public function get_name() {
		return 'nav-menu';
	}
}

class Fake_V3_Theme_Post_Content_Widget extends Fake_V3_Widget {
	public function get_name() {
		return 'theme-post-content';
	}
}

class Fake_V3_Widget_Factory {

	public static function create( string $widget_name ): Widget_Base {
		switch ( $widget_name ) {
			case 'nav-menu':
				return new Fake_V3_Nav_Menu_Widget();
			case 'theme-post-content':
				return new Fake_V3_Theme_Post_Content_Widget();
		}

		throw new \InvalidArgumentException( 'Unknown fake V3 widget: ' . $widget_name );
	}
}
