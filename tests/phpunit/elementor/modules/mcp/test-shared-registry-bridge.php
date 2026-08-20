<?php

namespace Elementor\Testing\Modules\Mcp;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Shared_Registry_Bridge extends TestCase {

	public function test_composer_installs_mcp_composer_package(): void {
		$root = dirname( __DIR__, 5 );
		$package_root = $root . '/vendor/elementor/elementor-mcp-composer';

		$this->assertFileExists( $package_root . '/src/Mcp/Registry.php' );
		$this->assertFileExists( $package_root . '/src/Mcp/Server_Bootstrap.php' );
		$this->assertFileExists( $package_root . '/src/Admin/Page.php' );
		$this->assertFileExists( $package_root . '/assets/build/mcp-page.js' );
		$this->assertFileExists( $package_root . '/runner.php' );
	}

	public function test_composer_lock_pins_mcp_composer_1_0_4_or_higher(): void {
		$lock = json_decode( (string) file_get_contents( dirname( __DIR__, 5 ) . '/composer.lock' ), true );
		$packages = $lock['packages'] ?? [];

		foreach ( $packages as $package ) {
			if ( 'elementor/elementor-mcp-composer' !== ( $package['name'] ?? '' ) ) {
				continue;
			}

			$this->assertGreaterThanOrEqual( '1.0.4', $package['version'] );
			return;
		}

		$this->fail( 'elementor/elementor-mcp-composer was not found in composer.lock.' );
	}

	public function test_build_copies_mcp_composer_into_plugin_artifact(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/scripts/vite/shared/plugin-files.mjs'
		);

		$this->assertStringContainsString( "'vendor/elementor/elementor-mcp-composer/**'", $source );
	}

	public function test_editor_one_mcp_menu_uses_home_menu_and_extension_icon(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/admin-menu-items/editor-one-mcp-menu.php'
		);

		$this->assertStringContainsString( 'Page::instance()', $source );
		$this->assertStringContainsString( 'ELEMENTOR_HOME_MENU_SLUG', $source );
		$this->assertStringContainsString( "'extension'", $source );
		$this->assertStringContainsString( 'return 25;', $source );
	}

	public function test_connector_page_is_gated_by_hidden_inactive_experiment(): void {
		$module_source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$this->assertStringContainsString( "const CONNECTOR_EXPERIMENT_NAME = 'mcp_connector';", $module_source );
		$this->assertStringContainsString( "'hidden' => true,", $module_source );
		$this->assertStringContainsString( 'Experiments_Manager::STATE_INACTIVE', $module_source );
		$this->assertStringContainsString( 'if ( ! self::is_connector_page_active() ) {', $module_source );

		$menu_source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/admin-menu-items/editor-one-mcp-menu.php'
		);

		$this->assertStringContainsString( 'Module::is_connector_page_active()', $menu_source );
	}

	public function test_editor_one_mcp_menu_registers_after_submissions(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/module.php'
		);

		$this->assertStringContainsString(
			"add_action( 'elementor/editor-one/menu/register', [ \$this, 'register_editor_one_menu' ], Editor_One_Mcp_Menu::REGISTER_PRIORITY_AFTER_SUBMISSIONS );",
			$source
		);

		$menu_source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/admin-menu-items/editor-one-mcp-menu.php'
		);

		$this->assertStringContainsString( 'const REGISTER_PRIORITY_AFTER_SUBMISSIONS = 11;', $menu_source );
	}
}
