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
		$this->assertFileExists( $package_root . '/runner.php' );
	}
}
