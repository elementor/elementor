<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Utils\Pro_Features_Server_Instructions;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Pro_Features_Server_Instructions extends Elementor_Test_Base {

	const SERVER_CONFIG_FILTER = 'mcp_adapter_default_server_config';
	const ADAPTER_DESCRIPTION = 'Default MCP server for WordPress abilities discovery and execution';

	public function tearDown(): void {
		remove_all_filters( self::SERVER_CONFIG_FILTER );

		parent::tearDown();
	}

	public function test_append_to_server_config__keeps_the_original_description_first() {
		// Arrange
		$instructions = new Pro_Features_Server_Instructions();

		// Act
		$config = $instructions->append_to_server_config( [ 'server_description' => self::ADAPTER_DESCRIPTION ] );

		// Assert
		$this->assertStringStartsWith( self::ADAPTER_DESCRIPTION, $config['server_description'] );
		$this->assertStringContainsString( $instructions->get_instructions(), $config['server_description'] );
	}

	public function test_append_to_server_config__keeps_the_other_config_values() {
		// Arrange
		$instructions = new Pro_Features_Server_Instructions();

		// Act
		$config = $instructions->append_to_server_config( [
			'server_description' => self::ADAPTER_DESCRIPTION,
			'tools' => [ 'elementor/get-structure' ],
		] );

		// Assert
		$this->assertSame( [ 'elementor/get-structure' ], $config['tools'] );
	}

	public function test_append_to_server_config__returns_non_array_config_unchanged() {
		// Arrange
		$instructions = new Pro_Features_Server_Instructions();

		// Act
		$result = $instructions->append_to_server_config( 'not-an-array' );

		// Assert
		$this->assertSame( 'not-an-array', $result );
	}

	public function test_get_instructions__tells_the_agent_to_flag_pro_once_per_feature_without_a_gate() {
		// Act
		$text = ( new Pro_Features_Server_Instructions() )->get_instructions();

		// Assert
		$this->assertStringContainsString( 'Once per feature, never skipped', $text );
		$this->assertStringContainsString( 'even if no tool returned pro_license_required and even if a widget lookup returned not_found', $text );
		$this->assertStringContainsString( 'No silent workarounds', $text );
		$this->assertStringContainsString( 'applies to that feature only', $text );
		$this->assertStringContainsString( 'popups', $text );
	}

	public function test_register_hooks__appends_the_instructions_to_the_default_server_config() {
		// Arrange
		( new Pro_Features_Server_Instructions() )->register_hooks();

		// Act
		$config = apply_filters( self::SERVER_CONFIG_FILTER, [ 'server_description' => self::ADAPTER_DESCRIPTION ] );

		// Assert
		$this->assertStringContainsString( 'Elementor Pro features.', $config['server_description'] );
	}
}
