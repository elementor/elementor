<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Discovery\Mcp_Discovery;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Api_Catalog;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Api_Catalog extends Elementor_Test_Base {

	private Api_Catalog $endpoint;

	private Agent_Ready_Settings $settings;

	public function setUp(): void {
		parent::setUp();

		delete_option( Agent_Ready_Settings::OPTION );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->settings->activate();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY, 'enabled', true );

		$this->endpoint = new Api_Catalog();
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_content_type_includes_linkset_media_type_and_profile() {
		// Act
		$content_type = $this->endpoint->get_content_type();

		// Assert
		$this->assertStringContainsString( 'application/linkset+json', $content_type );
		$this->assertStringContainsString( 'profile="https://www.rfc-editor.org/info/rfc9727"', $content_type );
	}

	public function test_generate_content_returns_linkset_structure() {
		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert
		$this->assertIsArray( $content );
		$this->assertArrayHasKey( 'linkset', $content );
		$this->assertIsArray( $content['linkset'] );
		$this->assertNotEmpty( $content['linkset'] );
	}

	public function test_catalog_entry_is_first_with_item_bookmarks() {
		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert
		$catalog_entry = $content['linkset'][0];
		$this->assertArrayHasKey( 'anchor', $catalog_entry );
		$this->assertStringContainsString( '/.well-known/api-catalog', $catalog_entry['anchor'] );
		$this->assertArrayHasKey( 'item', $catalog_entry );
		$this->assertIsArray( $catalog_entry['item'] );
		$this->assertNotEmpty( $catalog_entry['item'] );
		$this->assertArrayHasKey( 'href', $catalog_entry['item'][0] );
		$this->assertSame( rest_url(), $catalog_entry['item'][0]['href'] );
	}

	public function test_wordpress_rest_entry_has_anchor_and_service_doc() {
		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert
		$rest_entry = $content['linkset'][1];
		$this->assertArrayHasKey( 'anchor', $rest_entry );
		$this->assertSame( rest_url(), $rest_entry['anchor'] );
		$this->assertArrayHasKey( 'service-doc', $rest_entry );
		$this->assertIsArray( $rest_entry['service-doc'] );
		$this->assertCount( 1, $rest_entry['service-doc'] );
		$this->assertStringContainsString( '/.well-known/auth.md', $rest_entry['service-doc'][0]['href'] );
		$this->assertSame( 'text/markdown', $rest_entry['service-doc'][0]['type'] );
	}

	public function test_wordpress_rest_includes_service_desc_when_openapi_publishable() {
		// Arrange: Make OpenAPI publishable
		add_filter( 'pre_option_permalink_structure', static function () {
			return '/%postname%/';
		} );
		add_filter( 'pre_http_request', static function ( $preempt, $args, $url ) {
			if ( strpos( $url, rest_url( 'wp/v2/posts' ) ) !== false ) {
				return [
					'response' => [ 'code' => 200 ],
					'body'     => '[]',
				];
			}
			return $preempt;
		}, 10, 3 );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert
		$rest_entry = $content['linkset'][1];
		$this->assertArrayHasKey( 'service-desc', $rest_entry );
		$this->assertIsArray( $rest_entry['service-desc'] );
		$this->assertCount( 1, $rest_entry['service-desc'] );
		$this->assertStringContainsString( '/openapi.json', $rest_entry['service-desc'][0]['href'] );
		$this->assertSame( 'application/json', $rest_entry['service-desc'][0]['type'] );

		remove_all_filters( 'pre_option_permalink_structure' );
		remove_all_filters( 'pre_http_request' );
	}

	public function test_wordpress_rest_excludes_service_desc_when_openapi_not_publishable() {
		// Arrange: Make OpenAPI unpublishable by setting plain permalinks
		add_filter( 'pre_option_permalink_structure', static function () {
			return '';
		} );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert
		$rest_entry = $content['linkset'][1];
		$this->assertArrayNotHasKey( 'service-desc', $rest_entry );

		remove_all_filters( 'pre_option_permalink_structure' );
	}

	public function test_mcp_entry_present_when_active() {
		// Arrange
		add_filter( 'elementor/agents/mcp_server/is_active', '__return_true' );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert: catalog entry + REST entry + MCP entry
		$this->assertCount( 3, $content['linkset'] );
		$mcp_entry = $content['linkset'][2];
		$this->assertArrayHasKey( 'anchor', $mcp_entry );
		$this->assertStringContainsString( '/mcp/', $mcp_entry['anchor'] );
		$this->assertArrayHasKey( 'service-desc', $mcp_entry );
		$this->assertStringContainsString( 'server-card.json', $mcp_entry['service-desc'][0]['href'] );
		$this->assertArrayHasKey( 'service-doc', $mcp_entry );
		$this->assertStringContainsString( 'auth.md', $mcp_entry['service-doc'][0]['href'] );

		remove_all_filters( 'elementor/agents/mcp_server/is_active' );
	}

	public function test_mcp_item_in_catalog_when_active() {
		// Arrange
		add_filter( 'elementor/agents/mcp_server/is_active', '__return_true' );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert: catalog entry has 2 items (REST + MCP)
		$catalog_entry = $content['linkset'][0];
		$this->assertCount( 2, $catalog_entry['item'] );
		$this->assertSame( rest_url(), $catalog_entry['item'][0]['href'] );
		$this->assertStringContainsString( '/mcp/', $catalog_entry['item'][1]['href'] );

		remove_all_filters( 'elementor/agents/mcp_server/is_active' );
	}

	public function test_mcp_entry_absent_when_inactive() {
		// Arrange
		add_filter( 'elementor/agents/mcp_server/is_active', '__return_false' );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert: catalog entry + REST entry only
		$this->assertCount( 2, $content['linkset'] );

		// Catalog entry has only 1 item (REST)
		$catalog_entry = $content['linkset'][0];
		$this->assertCount( 1, $catalog_entry['item'] );
		$this->assertSame( rest_url(), $catalog_entry['item'][0]['href'] );

		remove_all_filters( 'elementor/agents/mcp_server/is_active' );
	}

	public function test_filter_receives_three_arguments() {
		// Arrange
		$received_args = [];
		add_filter( 'elementor/agents/api_catalog', static function ( $catalog, $entries, $home ) use ( &$received_args ) {
			$received_args = [ $catalog, $entries, $home ];
			return $catalog;
		}, 10, 3 );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$method->invoke( $this->endpoint );

		// Assert
		$this->assertCount( 3, $received_args );

		// First argument: $catalog (full document with 'linkset' key)
		$this->assertIsArray( $received_args[0] );
		$this->assertArrayHasKey( 'linkset', $received_args[0] );
		$this->assertIsArray( $received_args[0]['linkset'] );

		// Second argument: $entries (built-in linkset entries, read-only context)
		$this->assertIsArray( $received_args[1] );
		$this->assertNotEmpty( $received_args[1] );
		$this->assertArrayHasKey( 'anchor', $received_args[1][0] );

		// Third argument: $home (home URL with trailing slash)
		$this->assertIsString( $received_args[2] );
		$this->assertStringContainsString( home_url(), $received_args[2] );
		$this->assertStringEndsWith( '/', $received_args[2] );

		remove_all_filters( 'elementor/agents/api_catalog' );
	}

	public function test_filter_can_append_linkset_entries() {
		// Arrange
		add_filter( 'elementor/agents/api_catalog', static function ( $catalog, $entries, $home ) {
			$catalog['linkset'][] = [
				'anchor'      => $home . 'my-api/',
				'service-desc' => [
					[ 'href' => $home . 'my-api/spec.json', 'type' => 'application/json' ],
				],
			];
			return $catalog;
		}, 10, 3 );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert: catalog entry + REST entry + custom entry = at least 3
		$this->assertGreaterThanOrEqual( 3, count( $content['linkset'] ) );
		$last_entry = end( $content['linkset'] );
		$this->assertArrayHasKey( 'anchor', $last_entry );
		$this->assertStringContainsString( 'my-api/', $last_entry['anchor'] );

		remove_all_filters( 'elementor/agents/api_catalog' );
	}

	public function test_catalog_item_hrefs_match_per_api_anchors() {
		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert: catalog entry items match per-API anchors
		$catalog_entry = $content['linkset'][0];
		$rest_entry = $content['linkset'][1];

		$this->assertSame( $rest_entry['anchor'], $catalog_entry['item'][0]['href'] );
	}

	public function test_filter_output_honored() {
		// Arrange: Filter modifies the catalog entry's anchor
		add_filter( 'elementor/agents/api_catalog', static function ( $catalog ) {
			$catalog['linkset'][0]['anchor'] = 'https://modified.example.com/.well-known/api-catalog';
			return $catalog;
		} );

		// Act
		$method = new \ReflectionMethod( Api_Catalog::class, 'generate_content' );
		$method->setAccessible( true );
		$content = $method->invoke( $this->endpoint );

		// Assert
		$this->assertSame( 'https://modified.example.com/.well-known/api-catalog', $content['linkset'][0]['anchor'] );

		remove_all_filters( 'elementor/agents/api_catalog' );
	}
}
