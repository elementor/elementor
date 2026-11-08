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

	private Pro_Features_Server_Instructions $instructions;

	public function setUp(): void {
		parent::setUp();

		$this->instructions = new Pro_Features_Server_Instructions();
	}

	public function tearDown(): void {
		remove_filter( self::SERVER_CONFIG_FILTER, [ $this->instructions, 'append_to_server_config' ] );

		parent::tearDown();
	}

	public function test_append_to_server_config__keeps_the_original_description_first() {
		// Act
		$config = $this->instructions->append_to_server_config( [ 'server_description' => self::ADAPTER_DESCRIPTION ] );

		// Assert
		$this->assertStringStartsWith( self::ADAPTER_DESCRIPTION, $config['server_description'] );
		$this->assertStringContainsString( $this->instructions->get_instructions(), $config['server_description'] );
	}

	public function test_append_to_server_config__returns_non_array_config_unchanged() {
		// Act
		$result = $this->instructions->append_to_server_config( 'not-an-array' );

		// Assert
		$this->assertSame( 'not-an-array', $result );
	}

	public function test_get_instructions__routes_the_agent_to_the_tool_instead_of_guessing() {
		// Act
		$text = $this->instructions->get_instructions();

		// Assert
		$this->assertStringStartsWith( 'When using Elementor tools:', $text );
		$this->assertStringContainsString( 'call the Elementor tool that creates it', $text );
		$this->assertStringContainsString( 'pro_license_required', $text );
		$this->assertStringContainsString( 'popups', $text );
		$this->assertStringNotContainsString( 'suspect', $text );
	}

	public function test_register_hooks__appends_the_instructions_to_the_default_server_config() {
		// Arrange
		$this->instructions->register_hooks();

		// Act
		$config = apply_filters( self::SERVER_CONFIG_FILTER, [ 'server_description' => self::ADAPTER_DESCRIPTION ] );

		// Assert
		$this->assertStringContainsString( 'Let the tool decide', $config['server_description'] );
	}
}
