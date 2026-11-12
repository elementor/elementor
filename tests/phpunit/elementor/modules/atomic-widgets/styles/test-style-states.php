<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use PHPUnit\Framework\TestCase;

class Test_Style_States extends TestCase {

	public function test_disabled_is_a_valid_class_state() {
		// Arrange + Act.
		$class_states_map = Style_States::get_class_states_map();

		// Assert.
		$this->assertArrayHasKey( 'disabled', $class_states_map );
		$this->assertSame( 'disabled', $class_states_map['disabled']['name'] );
		$this->assertSame( Style_States::DISABLED, $class_states_map['disabled']['value'] );
		$this->assertTrue( Style_States::is_valid_state( Style_States::DISABLED ) );
		$this->assertTrue( Style_States::is_class_state( Style_States::DISABLED ) );
	}

	public function test_get_selector_with_state__disabled() {
		// Arrange + Act.
		$selector = Style_States::get_selector_with_state( '.pagination-prev', Style_States::DISABLED );

		// Assert.
		$this->assertSame( '.pagination-prev.e--disabled', $selector );
	}

	public function test_current_is_a_valid_class_state() {
		// Arrange + Act.
		$class_states_map = Style_States::get_class_states_map();

		// Assert.
		$this->assertSame( 'e--current', Style_States::CURRENT );
		$this->assertSame( 'current', $class_states_map['current']['name'] );
		$this->assertSame( Style_States::CURRENT, $class_states_map['current']['value'] );
		$this->assertTrue( Style_States::is_valid_state( Style_States::CURRENT ) );
		$this->assertTrue( Style_States::is_class_state( Style_States::CURRENT ) );
	}

	public function test_get_selector_with_state__current() {
		// Arrange + Act.
		$selector = Style_States::get_selector_with_state( '.menu-item', Style_States::CURRENT );

		// Assert.
		$this->assertSame( '.menu-item.e--current', $selector );
	}
}
