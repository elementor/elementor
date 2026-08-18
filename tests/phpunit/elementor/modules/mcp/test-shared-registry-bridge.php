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

	public function test_editor_one_mcp_menu_passes_elementor_url_to_page(): void {
		$source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/mcp/admin-menu-items/editor-one-mcp-menu.php'
		);

		$this->assertStringContainsString( 'Page::instance()', $source );
	}
}
