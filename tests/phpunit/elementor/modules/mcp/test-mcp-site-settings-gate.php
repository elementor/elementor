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

	public function test_module_always_registers_wordpress_abilities_when_active(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$this->assertStringContainsString(
			"add_action( 'wp_abilities_api_init', [ \$this, 'register_abilities' ] );",
			$source
		);
		$this->assertStringNotContainsString(
			'should_register_wordpress_abilities',
			$source
		);
	}

	public function test_module_gates_shared_mcp_registry_on_site_setting(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$this->assertStringContainsString(
			'public static function is_site_mcp_exposure_enabled(): bool',
			$source
		);
		$this->assertStringContainsString(
			"if ( self::is_site_mcp_exposure_enabled() ) {\n\t\t\tadd_action( 'wp_abilities_api_init', [ \$this, 'register_abilities' ] );\n\t\t}",
			$source
		);
		$this->assertStringContainsString(
			"if ( ! self::is_site_mcp_exposure_enabled() ) {\n\t\t\treturn;\n\t\t}",
			$source
		);
	}

	public function test_abstract_ability_sets_mcp_public_from_site_setting(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/abilities/abstract-ability.php'
		);

		$this->assertStringContainsString(
			"\$mcp['public'] = McpSettingsController::is_enabled();",
			$source
		);
	}
}
