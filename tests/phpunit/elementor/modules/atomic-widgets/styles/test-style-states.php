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

	public function test_state_key_states_are_valid_and_match_the_element_and_its_descendants() {
		// Arrange + Act.
		$selector = Style_States::get_selector_with_state( '.card', 'e--state-open' );

		// Assert.
		$this->assertTrue( Style_States::is_valid_state( 'e--state-open' ) );
		$this->assertSame( '.card.e--state-open,.e--state-open .card', $selector );
	}

	public function test_state_key_states_reject_unsafe_names() {
		// Arrange + Act + Assert.
		$this->assertFalse( Style_States::is_valid_state( 'e--state-a b' ) );
		$this->assertFalse( Style_States::is_valid_state( 'e--state-}{' ) );
	}
}
