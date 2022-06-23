<?php

namespace Elementor\Testing\Includes\Managers;

use Elementor\Controls_Manager;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widgets extends Elementor_Test_Base {

	public function setUp() {
		parent::setUp();

		Plugin::$instance->controls_manager = new Controls_Manager();
	}

	public function teardown() {
		parent::teardown();

		switch_to_locale( 'en_US' );
	}

	public function test_ajax_get_widgets_default_value_translations__uses_specific_locale_if_passed() {
		// Act.
		$response = ( new Widgets_Manager() )->ajax_get_widgets_default_value_translations( [ 'locale' => 'he_IL' ] );

		// Assert.
		$this->assertEquals( 'לחץ כאן', $response['button']['controls']['text']['default'] );
	}

	public function test_ajax_get_widgets_default_value_translations__returns_only_controls() {
		// Act.
		$response = ( new Widgets_Manager() )->ajax_get_widgets_default_value_translations();

		// Assert.
		$this->assertCount( 1, $response['button'] );
		$this->assert_array_have_keys( [ 'controls' ], $response['button'] );
	}

	public function test_ajax_get_widgets_default_value_translations__returns_only_defaults() {
		// Act.
		$response = ( new Widgets_Manager() )->ajax_get_widgets_default_value_translations();

		// Assert.
		$control = $response['button']['controls']['text'];

		$this->assertCount( 1, $control );
		$this->assert_array_have_keys( [ 'default' ], $control );
	}

	public function test_ajax_get_widgets_default_value_translations__doesnt_return_empty_controls() {
		// Act.
		$response = ( new Widgets_Manager() )->ajax_get_widgets_default_value_translations();

		// Assert.
		// Button has translated defaults while inner-section doesn't.
		$this->assert_array_have_keys( [ 'button' ], $response );
		$this->assert_array_not_have_keys( [ 'inner-section' ], $response );
	}

	private function set_user_locale( $locale ) {
		update_user_meta( get_current_user_id(), 'user_lang', $locale );
	}
}
