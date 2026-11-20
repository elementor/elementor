<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Mcp\Abilities\Enable_Agent_Ready_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Enable_Agent_Ready_Ability extends Elementor_Test_Base {

	private Enable_Agent_Ready_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Enable_Agent_Ready_Ability();
		delete_option( Agent_Ready_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );
		parent::tearDown();
	}

	public function test_check_permission__denies_non_admin() {
		// Arrange
		$this->act_as_subscriber();

		// Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	public function test_execute__denies_non_admin() {
		// Arrange
		$this->act_as_subscriber();

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__activates_agent_ready_and_skips_unavailable_modules() {
		// Arrange
		$this->act_as_admin();
		add_filter( 'elementor/agents/llms_txt/seo_plugin_owner', fn() => 'rank_math' );

		try {
			// Act
			$result = $this->ability->execute();

			// Assert
			$this->assertTrue( $result['activated'] );
			$this->assertContains( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, $result['enabledModules'] );
			$this->assertNotContains( Agent_Ready_Settings::MODULE_LLMS_TXT, $result['enabledModules'] );
			$this->assertArrayHasKey( Agent_Ready_Settings::MODULE_LLMS_TXT, $result['skippedModules'] );
			$this->assertSame( 'seo_plugin', $result['skippedModules'][ Agent_Ready_Settings::MODULE_LLMS_TXT ]['code'] );

			$settings = get_option( Agent_Ready_Settings::OPTION );
			$this->assertTrue( $settings[ Agent_Ready_Settings::ACTIVATED_KEY ] );
			$this->assertFalse( $settings[ Agent_Ready_Settings::MODULE_LLMS_TXT ]['enabled'] );
			$this->assertTrue( $settings[ Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT ]['enabled'] );
		} finally {
			remove_all_filters( 'elementor/agents/llms_txt/seo_plugin_owner' );
			\Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector::reset_cache();
		}
	}

	public function test_validate_input_against_schema__accepts_empty_input() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->validate_input_against_schema( [] );

		// Assert
		$this->assertTrue( $result );
	}
}
