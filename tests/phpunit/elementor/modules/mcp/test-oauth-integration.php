<?php

namespace Elementor\Testing\Modules\Mcp;

use Elementor\Modules\Mcp\Oauth\Oauth_Client_Metadata;
use Elementor\Modules\Mcp\Oauth\Oauth_Integration;
use PHPUnit\Framework\TestCase;
use WPMedia\MCP\OAuth\Auth\JWT;
use WPMedia\MCP\OAuth\Auth\SecretManager;
use WPMedia\MCP\OAuth\Bootstrap;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Oauth_Integration extends TestCase {

	public static function setUpBeforeClass(): void {
		require_once __DIR__ . '/oauth-test-stubs.php';
	}

	public function test_jetpack_psr4_registers_mcp_oauth_from_elementor_vendor(): void {
		// Arrange
		$root = dirname( __DIR__, 5 );
		$psr4_file = $root . '/vendor/composer/jetpack_autoload_psr4.php';

		$this->assertFileExists( $psr4_file );

		$psr4_map = require $psr4_file;
		$oauth_namespace = $psr4_map['WPMedia\\MCP\\OAuth\\'] ?? null;

		// Act
		$oauth_path = $oauth_namespace['path'][0] ?? '';

		// Assert
		$this->assertIsArray( $oauth_namespace );
		$this->assertStringContainsString(
			'/vendor/wp-media/mcp-oauth/inc',
			str_replace( '\\', '/', $oauth_path )
		);
		$this->assertTrue( class_exists( Bootstrap::class ) );
	}

	public function test_is_available_when_package_is_installed(): void {
		// Arrange / Act / Assert
		$this->assertTrue( Oauth_Integration::is_available() );
	}

	public function test_is_oauth_transport_available_when_package_is_installed(): void {
		// Arrange / Act / Assert
		$this->assertTrue( Oauth_Integration::is_oauth_transport_available() );
		$this->assertTrue( class_exists( JWT::class ) );
		$this->assertTrue( class_exists( SecretManager::class ) );
	}

	public function test_is_enabled_defaults_to_true_when_available(): void {
		if ( ! function_exists( 'apply_filters' ) ) {
			$this->markTestSkipped( 'WordPress apply_filters() is required.' );
		}

		// Arrange
		remove_all_filters( 'elementor/mcp/oauth/enabled' );

		// Act / Assert
		$this->assertTrue( Oauth_Integration::is_enabled() );
	}

	public function test_is_enabled_can_be_disabled_via_filter(): void {
		if ( ! function_exists( 'apply_filters' ) ) {
			$this->markTestSkipped( 'WordPress apply_filters() is required.' );
		}

		// Arrange
		add_filter( 'elementor/mcp/oauth/enabled', '__return_false' );

		// Act
		$enabled = Oauth_Integration::is_enabled();

		// Assert
		$this->assertFalse( $enabled );

		remove_filter( 'elementor/mcp/oauth/enabled', '__return_false' );
	}

	public function test_remap_oauth_resource_url_passes_through_other_paths(): void {
		// Arrange
		$url = 'https://example.com/wp-json/other/route';

		// Act
		$result = Oauth_Integration::remap_oauth_resource_url( $url, 'other/route' );

		// Assert
		$this->assertSame( $url, $result );
	}

	public function test_metadata_document_contains_loopback_redirects_and_public_client(): void {
		// Arrange / Act
		$metadata = Oauth_Client_Metadata::get_metadata_document();

		// Assert
		$this->assertSame( 'none', $metadata['token_endpoint_auth_method'] );
		$this->assertSame( Oauth_Client_Metadata::get_loopback_redirect_uris(), $metadata['redirect_uris'] );
		$this->assertContains( 'http://127.0.0.1/oauth/callback', $metadata['redirect_uris'] );
		$this->assertContains( 'http://localhost/oauth/callback', $metadata['redirect_uris'] );
		$this->assertContains( 'http://[::1]/oauth/callback', $metadata['redirect_uris'] );
		$this->assertSame( Oauth_Client_Metadata::get_client_id(), $metadata['client_id'] );
	}

	public function test_trusted_publisher_filter_shape(): void {
		// Arrange
		$client_id = Oauth_Client_Metadata::get_client_id();
		$host = (string) wp_parse_url( $client_id, PHP_URL_HOST );
		$publishers = Oauth_Client_Metadata::append_trusted_publisher( [] );

		// Act
		$config = $publishers[ Oauth_Client_Metadata::PUBLISHER_SLUG ] ?? null;

		// Assert
		$this->assertIsArray( $config );
		$this->assertSame( $host, $config['host'] );
		$this->assertSame( [ $client_id ], $config['client_ids'] );
	}

	public function test_remap_oauth_resource_url_remapped_paths(): void {
		if ( ! function_exists( 'get_rest_url' ) ) {
			$this->markTestSkipped( 'WordPress get_rest_url() is required.' );
		}

		// Arrange
		$expected = get_rest_url( null, 'elementor/mcp' );

		// Act / Assert
		$this->assertSame(
			$expected,
			Oauth_Integration::remap_oauth_resource_url( 'ignored', 'mcp/mcp-oauth-server' )
		);
		$this->assertSame(
			$expected,
			Oauth_Integration::remap_oauth_resource_url( 'ignored', '/mcp/mcp-oauth-server' )
		);
	}
}
