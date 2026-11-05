<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\MCP\Composer\Admin\McpSettingsController;
use Elementor\Modules\Agents\Components\Discovery\Mcp_Discovery;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Agent_Skills;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Mcp_Server_Card;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Llms_Cache;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Mcp_Discovery extends Elementor_Test_Base {

	const MAX_CARD_DESCRIPTION_LENGTH = 100;

	const CARD_ROUTE = '/mcp/mcp-adapter-default-server/server-card';

	const HTTP_OK = 200;

	const HTTP_NOT_FOUND = 404;

	private Mcp_Discovery $discovery;

	public function setUp(): void {
		parent::setUp();

		if ( ! class_exists( McpSettingsController::class ) ) {
			$this->markTestSkipped( 'Elementor MCP composer package is not available.' );
		}

		delete_option( McpSettingsController::OPTION_NAME );

		$module = \Elementor\Plugin::$instance->modules_manager->get_modules( 'agents' );
		$this->discovery = $module->get_component( 'mcp_discovery' );
	}

	public function tearDown(): void {
		delete_option( McpSettingsController::OPTION_NAME );
		remove_all_filters( 'home_url' );

		parent::tearDown();
	}

	public function test_filters__return_false_when_mcp_option_missing() {
		// Act
		$is_active = apply_filters( 'elementor/agents/mcp_server/is_active', true );
		$emit_card = apply_filters( 'elementor/agents/link_headers/emit_mcp_card', true );

		// Assert
		$this->assertFalse( $is_active );
		$this->assertFalse( $emit_card );
	}

	public function test_filters__return_false_when_mcp_option_disabled() {
		// Arrange
		update_option( McpSettingsController::OPTION_NAME, false );

		// Act
		$is_active = apply_filters( 'elementor/agents/mcp_server/is_active', true );

		// Assert
		$this->assertFalse( $is_active );
	}

	public function test_ard_catalog_entries__unchanged_when_inactive() {
		// Arrange
		$built_in = [ [ 'identifier' => 'urn:air:example.org:llms' ] ];

		// Act
		$entries = apply_filters( 'elementor/agents/ard_catalog/entries', $built_in, trailingslashit( home_url() ) );

		// Assert
		$this->assertSame( $built_in, $entries );
	}

	public function test_server_card_endpoint__not_applicable_when_inactive() {
		// Act
		$applicable = ( new Mcp_Server_Card() )->is_applicable();

		// Assert
		$this->assertFalse( $applicable );
	}

	public function test_rest_server_card__not_registered_when_inactive() {
		// Arrange
		$this->setExpectedDeprecated( 'WP\MCP\Core\McpAdapter' );
		$this->init_rest_server();

		// Act
		$response = rest_get_server()->dispatch( new \WP_REST_Request( 'GET', self::CARD_ROUTE ) );

		// Assert
		$this->assertSame( self::HTTP_NOT_FOUND, $response->get_status() );
	}

	public function test_llms_txt__omits_mcp_section_when_inactive() {
		// Arrange
		$generator = new Content_Generator( new Prompt_Injection_Sanitizer() );

		// Act
		$llms      = $generator->generate_llms_txt();
		$llms_full = $generator->generate_llms_full_txt();

		// Assert
		$this->assertStringNotContainsString( '## ' . Content_Generator::MCP_SECTION_TITLE, $llms );
		$this->assertStringNotContainsString( Mcp_Discovery::get_server_url(), $llms );
		$this->assertStringNotContainsString( '## ' . Content_Generator::MCP_SECTION_TITLE, $llms_full );
	}

	public function test_get_server_name__reverses_host_labels() {
		// Arrange
		$this->set_home_url( 'https://shop.example.com' );

		// Act
		$name = Mcp_Discovery::get_server_name();

		// Assert
		$this->assertSame( 'com.example.shop/elementor-mcp', $name );
	}

	public function test_get_server_name__keeps_single_label_and_ip_hosts_in_order() {
		// Arrange
		$this->set_home_url( 'http://localhost:8888' );
		$localhost_name = Mcp_Discovery::get_server_name();
		$this->set_home_url( 'http://127.0.0.1:8888' );

		// Act
		$ip_name = Mcp_Discovery::get_server_name();

		// Assert
		$this->assertSame( 'localhost/elementor-mcp', $localhost_name );
		$this->assertSame( '127.0.0.1/elementor-mcp', $ip_name );
	}

	public function test_filters__return_true_when_mcp_enabled() {
		// Arrange
		$this->activate_mcp();

		// Act
		$is_active = apply_filters( 'elementor/agents/mcp_server/is_active', false );
		$emit_card = apply_filters( 'elementor/agents/link_headers/emit_mcp_card', false );

		// Assert
		$this->assertTrue( $is_active );
		$this->assertTrue( $emit_card );
	}

	public function test_server_card_endpoint__serves_registry_card_when_active() {
		// Arrange
		$this->activate_mcp();
		$endpoint = new Mcp_Server_Card();
		$method   = new \ReflectionMethod( Mcp_Server_Card::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$card = $method->invoke( $endpoint );

		// Assert
		$this->assertTrue( $endpoint->is_applicable() );
		$this->assertSame( Mcp_Discovery::SERVER_CARD_SCHEMA, $card['$schema'] );
		$this->assertMatchesRegularExpression( '#^[a-zA-Z0-9.-]+/[a-zA-Z0-9._-]+$#', $card['name'] );
		$this->assertLessThanOrEqual( self::MAX_CARD_DESCRIPTION_LENGTH, strlen( $card['description'] ) );
		$this->assertSame( ELEMENTOR_VERSION, $card['version'] );
		$this->assertSame( 'streamable-http', $card['remotes'][0]['type'] );
		$this->assertSame( Mcp_Discovery::get_server_url(), $card['remotes'][0]['url'] );
		$this->assertArrayNotHasKey( 'tools', $card );
	}

	public function test_rest_server_card__returns_card_publicly_when_active() {
		// Arrange
		$this->activate_mcp();
		wp_set_current_user( 0 );
		$this->init_rest_server();

		// Act
		$response = rest_get_server()->dispatch( new \WP_REST_Request( 'GET', self::CARD_ROUTE ) );

		// Assert
		$this->assertSame( self::HTTP_OK, $response->get_status() );
		$this->assertSame( Mcp_Discovery::build_server_card(), $response->get_data() );
	}

	public function test_ard_catalog_entries__appends_mcp_server_when_active() {
		// Arrange
		$this->activate_mcp();
		$host = wp_parse_url( home_url(), PHP_URL_HOST );

		// Act
		$entries = apply_filters( 'elementor/agents/ard_catalog/entries', [], trailingslashit( home_url() ) );

		// Assert
		$this->assertCount( 1, $entries );
		$this->assertSame( 'urn:air:' . $host . ':server:elementor-mcp', $entries[0]['identifier'] );
		$this->assertSame( 'application/json', $entries[0]['type'] );
		$this->assertSame( Mcp_Discovery::get_server_card_url(), $entries[0]['url'] );
		$this->assertNotEmpty( $entries[0]['displayName'] );
		$this->assertNotEmpty( $entries[0]['description'] );
		$this->assertNotEmpty( $entries[0]['representativeQueries'] );
	}

	public function test_llms_txt__includes_mcp_server_url_when_active() {
		// Arrange
		$this->activate_mcp();
		$generator = new Content_Generator( new Prompt_Injection_Sanitizer() );

		// Act
		$llms      = $generator->generate_llms_txt();
		$llms_full = $generator->generate_llms_full_txt();

		// Assert
		$this->assertStringContainsString( '## ' . Content_Generator::MCP_SECTION_TITLE, $llms );
		$this->assertStringContainsString( '(' . esc_url_raw( Mcp_Discovery::get_server_url() ) . ')', $llms );
		$this->assertStringContainsString( '## ' . Content_Generator::MCP_SECTION_TITLE, $llms_full );
	}

	public function test_agent_skills__queries_the_category_registered_by_mcp_module() {
		// Assert
		$this->assertSame( 'elementor', Agent_Skills::ABILITY_CATEGORY );
	}

	public function test_mcp_option_update__flushes_llms_and_well_known_caches() {
		// Arrange
		add_option( McpSettingsController::OPTION_NAME, false );
		$card_transient = ( new Mcp_Server_Card() )->get_transient_key();
		set_transient( Llms_Cache::TRANSIENT_LLMS, 'cached', MINUTE_IN_SECONDS );
		set_transient( $card_transient, [ 'body' => 'cached' ], MINUTE_IN_SECONDS );

		// Act
		update_option( McpSettingsController::OPTION_NAME, true );

		// Assert
		$this->assertFalse( get_transient( Llms_Cache::TRANSIENT_LLMS ) );
		$this->assertFalse( get_transient( $card_transient ) );
	}

	private function activate_mcp(): void {
		if ( ! Mcp_Module::is_active() ) {
			$this->markTestSkipped( 'MCP adapter or Abilities API is not available.' );
		}

		update_option( McpSettingsController::OPTION_NAME, true );
	}

	private function init_rest_server(): void {
		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );
	}

	private function set_home_url( string $url ): void {
		remove_all_filters( 'home_url' );
		add_filter( 'home_url', static function () use ( $url ) {
			return $url;
		} );
	}
}
