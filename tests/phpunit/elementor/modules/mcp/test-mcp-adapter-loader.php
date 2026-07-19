<?php

namespace Elementor\Modules\Mcp {
	if ( ! function_exists( __NAMESPACE__ . '\\get_file_data' ) ) {
		function get_file_data( $file, $headers ) {
			$contents = file_get_contents( $file );
			$result   = [];

			foreach ( $headers as $field => $regex ) {
				$result[ $field ] = preg_match( '/^[ \t\/*#@]*' . preg_quote( $regex, '/' ) . ':(.*)$/mi', $contents, $m ) ? trim( $m[1] ) : '';
			}

			return $result;
		}
	}
}

namespace Elementor\Testing\Modules\Mcp {

use Elementor\Modules\Mcp\Mcp_Adapter_Loader;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Mcp_Adapter_Loader extends TestCase {

	private string $tmp_dir;

	protected function setUp(): void {
		parent::setUp();

		$this->tmp_dir = sys_get_temp_dir() . '/elementor-mcp-loader-' . uniqid();
		mkdir( $this->tmp_dir, 0777, true );
	}

	protected function tearDown(): void {
		$this->remove_dir( $this->tmp_dir );
		parent::tearDown();
	}

	public function test_should_preload__returns_false_when_plugin_file_missing() {
		// Arrange
		$plugin_file   = $this->tmp_dir . '/does-not-exist.php';
		$autoload_file = $this->create_file( 'autoload.php', '<?php return null;' );

		// Act
		$result = Mcp_Adapter_Loader::should_preload( $plugin_file, $autoload_file );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_preload__returns_false_when_autoload_file_missing() {
		// Arrange
		$plugin_file   = $this->create_plugin_file( '0.5.0' );
		$autoload_file = $this->tmp_dir . '/does-not-exist.php';

		// Act
		$result = Mcp_Adapter_Loader::should_preload( $plugin_file, $autoload_file );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_preload__returns_false_when_version_header_missing() {
		// Arrange
		$plugin_file   = $this->create_file( 'mcp-adapter.php', "<?php\n/**\n * Plugin Name: MCP Adapter\n */\n" );
		$autoload_file = $this->create_file( 'autoload.php', '<?php return null;' );

		// Act
		$result = Mcp_Adapter_Loader::should_preload( $plugin_file, $autoload_file );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_preload__returns_false_when_version_below_minimum() {
		// Arrange
		$plugin_file   = $this->create_plugin_file( '0.1.0' );
		$autoload_file = $this->create_file( 'autoload.php', '<?php return null;' );

		// Act
		$result = Mcp_Adapter_Loader::should_preload( $plugin_file, $autoload_file );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_preload__returns_true_when_version_matches_minimum() {
		// Arrange
		$plugin_file   = $this->create_plugin_file( '0.5.0' );
		$autoload_file = $this->create_file( 'autoload.php', '<?php return null;' );

		// Act
		$result = Mcp_Adapter_Loader::should_preload( $plugin_file, $autoload_file );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_preload__returns_true_when_version_above_minimum() {
		// Arrange
		$plugin_file   = $this->create_plugin_file( '1.2.3' );
		$autoload_file = $this->create_file( 'autoload.php', '<?php return null;' );

		// Act
		$result = Mcp_Adapter_Loader::should_preload( $plugin_file, $autoload_file );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_read_version__extracts_version_from_plugin_header() {
		// Arrange
		$plugin_file = $this->create_plugin_file( '0.5.0' );

		// Act
		$version = Mcp_Adapter_Loader::read_version( $plugin_file );

		// Assert
		$this->assertSame( '0.5.0', $version );
	}

	public function test_read_version__returns_empty_string_when_header_missing() {
		// Arrange
		$plugin_file = $this->create_file( 'mcp-adapter.php', "<?php\n/**\n * Plugin Name: MCP Adapter\n */\n" );

		// Act
		$version = Mcp_Adapter_Loader::read_version( $plugin_file );

		// Assert
		$this->assertSame( '', $version );
	}

	private function create_plugin_file( string $version ): string {
		$contents = "<?php\n/**\n * Plugin Name: MCP Adapter\n * Version: {$version}\n */\n";

		return $this->create_file( 'mcp-adapter.php', $contents );
	}

	private function create_file( string $name, string $contents ): string {
		$path = $this->tmp_dir . '/' . $name;
		file_put_contents( $path, $contents );

		return $path;
	}

	private function remove_dir( string $dir ): void {
		if ( ! is_dir( $dir ) ) {
			return;
		}

		foreach ( scandir( $dir ) as $entry ) {
			if ( '.' === $entry || '..' === $entry ) {
				continue;
			}

			$path = $dir . '/' . $entry;

			is_dir( $path ) ? $this->remove_dir( $path ) : unlink( $path );
		}

		rmdir( $dir );
	}
}

}
