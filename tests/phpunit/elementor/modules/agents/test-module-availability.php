<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Module_Availability;
use Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Robots_Txt_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module_Availability extends Elementor_Test_Base {

	private $module_availability;
	private $seo_detector;
	private $robots_handler;
	private $settings;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();
		Seo_Llms_Txt_Detector::reset_cache();

		$this->settings        = new Agent_Ready_Settings(
			new \Elementor\Modules\Agents\Content_Generator( new \Elementor\Modules\Agents\Prompt_Injection_Sanitizer() )
		);
		$this->seo_detector    = new Seo_Llms_Txt_Detector();
		$this->robots_handler  = new Robots_Txt_Handler( $this->settings );

		$this->module_availability = new Module_Availability( $this->seo_detector, $this->robots_handler );
	}

	public function tearDown(): void {
		delete_option( 'rank_math_modules' );

		Module::reset_physical_file_cache();
		Seo_Llms_Txt_Detector::reset_cache();

		parent::tearDown();
	}

	public function test_get_unavailable_reasons__returns_empty_when_all_available() {
		$reasons = $this->module_availability->get_unavailable_reasons();

		$this->assertIsArray( $reasons );
		$this->assertEmpty( $reasons );
	}

	public function test_get_unavailable_reasons__detects_llms_txt_seo_plugin() {
		update_option( 'rank_math_modules', [ 'llms-txt' ] );
		Seo_Llms_Txt_Detector::reset_cache();

		$reasons = $this->module_availability->get_unavailable_reasons();

		$this->assertArrayHasKey( Agent_Ready_Settings::MODULE_LLMS_TXT, $reasons );
		$this->assertSame( 'seo_plugin', $reasons[ Agent_Ready_Settings::MODULE_LLMS_TXT ]['code'] );
		$this->assertStringContainsString( 'Rank Math', $reasons[ Agent_Ready_Settings::MODULE_LLMS_TXT ]['message'] );
	}

	public function test_get_reason__returns_specific_module_reason() {
		update_option( 'rank_math_modules', [ 'llms-txt' ] );
		Seo_Llms_Txt_Detector::reset_cache();

		$reason = $this->module_availability->get_reason( Agent_Ready_Settings::MODULE_LLMS_TXT );

		$this->assertIsArray( $reason );
		$this->assertSame( 'seo_plugin', $reason['code'] );
	}

	public function test_get_reason__returns_null_when_available() {
		$reason = $this->module_availability->get_reason( Agent_Ready_Settings::MODULE_LLMS_TXT );

		$this->assertNull( $reason );
	}

	public function test_is_available__returns_true_when_no_conflict() {
		$this->assertTrue( $this->module_availability->is_available( Agent_Ready_Settings::MODULE_LLMS_TXT ) );
	}

	public function test_is_available__returns_false_when_conflict_exists() {
		update_option( 'rank_math_modules', [ 'llms-txt' ] );
		Seo_Llms_Txt_Detector::reset_cache();

		$this->assertFalse( $this->module_availability->is_available( Agent_Ready_Settings::MODULE_LLMS_TXT ) );
	}

	public function test_get_unavailable_reasons__checks_seo_plugin_before_physical_file() {
		update_option( 'rank_math_modules', [ 'llms-txt' ] );
		Seo_Llms_Txt_Detector::reset_cache();

		$reasons = $this->module_availability->get_unavailable_reasons();

		$this->assertSame( 'seo_plugin', $reasons[ Agent_Ready_Settings::MODULE_LLMS_TXT ]['code'] );
	}
}
