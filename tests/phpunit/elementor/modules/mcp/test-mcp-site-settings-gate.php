<?php

namespace Elementor\Testing\Modules\Mcp;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Site_Settings_Gate extends TestCase {

	public function test_module_exposes_should_register_wordpress_abilities(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$this->assertStringContainsString(
			'public static function should_register_wordpress_abilities(): bool',
			$source
		);
		$this->assertStringContainsString(
			'McpSettingsController::is_enabled()',
			$source
		);
	}

	public function test_module_skips_ability_hooks_when_site_mcp_disabled(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$this->assertStringContainsString(
			"if ( ! self::should_register_wordpress_abilities() ) {\n\t\t\treturn;\n\t\t}",
			$source
		);
		$this->assertLessThan(
			strpos( $source, "add_action( 'wp_abilities_api_init'" ),
			strpos( $source, 'should_register_wordpress_abilities()' )
		);
	}

	public function test_editor_one_menu_registers_even_when_site_mcp_disabled(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$menu_hook_pos = strpos( $source, "add_action( 'elementor/editor-one/menu/register'" );
		$abilities_gate_pos = strpos( $source, 'should_register_wordpress_abilities()' );

		$this->assertNotFalse( $menu_hook_pos );
		$this->assertNotFalse( $abilities_gate_pos );
		$this->assertLessThan( $abilities_gate_pos, $menu_hook_pos );
	}
}
