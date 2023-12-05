<?php

namespace Elementor\Testing\Includes\Managers;

use Elementor\Controls_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widgets extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		// Force controls cache to reset.
		Plugin::$instance->controls_manager = new Controls_Manager();
	}

	public function test_ajax_get_widgets_default_value_translations__uses_specific_locale_if_passed() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations( [ 'locale' => 'he_IL' ] );

		// Assert.
		$this->assertEquals( 'לחץ כאן', $response['button']['controls']['text']['default'] );
	}

	public function test_ajax_get_widgets_default_value_translations__returns_only_controls() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations();

		// Assert.
		$this->assertCount( 1, $response['button'] );
		$this->assert_array_have_keys( [ 'controls' ], $response['button'] );
	}

	public function test_ajax_get_widgets_default_value_translations__returns_only_defaults() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations();

		// Assert.
		$control = $response['button']['controls']['text'];

		$this->assertCount( 1, $control );
		$this->assert_array_have_keys( [ 'default' ], $control );
	}

	public function test_ajax_get_widgets_default_value_translations__doesnt_return_empty_controls() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations();

		// Assert.
		// Button has translated defaults while inner-section doesn't.
		$this->assert_array_have_keys( [ 'button' ], $response );
		$this->assert_array_not_have_keys( [ 'inner-section' ], $response );
	}
}
