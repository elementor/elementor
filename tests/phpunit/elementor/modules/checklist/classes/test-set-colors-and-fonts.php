<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Kit_Adapter_Interface;
use Elementor\Modules\Checklist\Steps\Set_Fonts_And_Colors;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Set_Fonts_And_Colors_Step extends Step_Test_Base {

	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__step_is_completed_when_fonts_and_color_are_assigned() {
		$main_post_mock = new \stdClass();
		$active_kit_mock = $this->getMockBuilder( Kit_Adapter_Interface::class )
			->getMock();
		$active_kit_mock->method('get_main_post')->willReturn( $main_post_mock );

		$step = new Set_Fonts_And_Colors( $this->checklist_module, $this->wordpress_adapter, $active_kit_mock );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );

		$step->mark_as_completed();
		$this->assertTrue( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );

		$step->unmark_as_completed();
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );

		$active_kit_mock = $this->getMockBuilder( Kit_Adapter_Interface::class )
			->getMock();
		$active_kit_mock->method( 'get_main_post' )->willReturn( $main_post_mock );
		$active_kit_mock->method( 'get_kit_settings' )->willReturn( [ "custom_colors" => "TEST_VALUE", "custom_typography" => "TEST_VALUE" ]);

		$step = new Set_Fonts_And_Colors( $this->checklist_module, $this->wordpress_adapter, $active_kit_mock );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertTrue( $step->is_absolute_completed() );
	}
}
