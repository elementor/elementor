<?php

namespace Elementor\Testing\Modules\Mcp;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Mcp_Adapter_Jetpack_Autoloader extends TestCase {

	public function test_jetpack_psr4_registers_mcp_adapter_from_elementor_vendor(): void {
		// Arrange
		$root = dirname( __DIR__, 5 );
		$psr4_file = $root . '/vendor/composer/jetpack_autoload_psr4.php';
		$autoload_packages = $root . '/vendor/autoload_packages.php';

		$this->assertFileExists( $psr4_file );
		$this->assertFileExists( $autoload_packages );

		$psr4_map = require $psr4_file;
		$mcp_namespace = $psr4_map['WP\\MCP\\'] ?? null;

		// Act
		$mcp_path = $mcp_namespace['path'][0] ?? '';

		// Assert
		$this->assertIsArray( $mcp_namespace );
		$this->assertSame( '0.5.0.0', $mcp_namespace['version'] );
		$this->assertStringContainsString(
			'/vendor/wordpress/mcp-adapter/includes',
			str_replace( '\\', '/', $mcp_path )
		);
		$this->assertStringContainsString(
			str_replace( '\\', '/', $root ),
			str_replace( '\\', '/', $mcp_path )
		);
	}
}
