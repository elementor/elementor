<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Catalog;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Ard_Catalog extends Elementor_Test_Base {

	const ENTRIES_FILTER = 'elementor/agents/ard_catalog/entries';

	const IS_APPLICABLE_FILTER = 'elementor/agents/ard_catalog/is_applicable';

	const MCP_ACTIVE_FILTER = 'elementor/agents/mcp_server/is_active';

	private Ard_Catalog $ard_catalog;

	private Agent_Ready_Settings $settings;

	private Module $module;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		$this->module = new Module();
		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->settings->activate();
		$this->ard_catalog = new Ard_Catalog( $this->module );
	}

	public function tearDown(): void {
		remove_all_filters( self::ENTRIES_FILTER );
		remove_all_filters( self::IS_APPLICABLE_FILTER );
		remove_all_filters( self::MCP_ACTIVE_FILTER );

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		Module::reset_physical_file_cache();

		parent::tearDown();
	}

	public function test_generate_content__includes_llms_txt_entry_when_llms_is_advertised() {
		// Arrange
		$home = trailingslashit( home_url() );

		// Act
		$entries = $this->index_entries_by_identifier( $this->invoke_generate_content()['entries'] );

		// Assert
		$identifier = 'urn:air:' . $this->get_host() . ':document:llms-txt';
		$this->assertArrayHasKey( $identifier, $entries );
		$this->assertSame( $home . 'llms.txt', $entries[ $identifier ]['url'] );
		$this->assertSame( Ard_Catalog::LLMS_TXT_MEDIA_TYPE, $entries[ $identifier ]['type'] );
	}

	public function test_generate_content__omits_llms_txt_entry_when_llms_is_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		// Act
		$content = $this->invoke_generate_content();

		// Assert
		$this->assertStringNotContainsString( 'llms-txt', wp_json_encode( $content ) );
	}

	public function test_generate_content__omits_agent_skills_entry_when_skills_endpoint_is_inactive() {
		// Act
		$content = $this->invoke_generate_content();

		// Assert
		$this->assertStringNotContainsString( 'agent-skills', wp_json_encode( $content ) );
	}

	public function test_generate_content__includes_agent_skills_entry_when_skills_endpoint_is_active() {
		// Arrange
		if ( ! function_exists( 'wp_get_abilities' ) ) {
			$this->markTestSkipped( 'Abilities API (WP 6.9+) is not available.' );
		}
		add_filter( self::MCP_ACTIVE_FILTER, '__return_true' );
		$home = trailingslashit( home_url() );

		// Act
		$entries = $this->index_entries_by_identifier( $this->invoke_generate_content()['entries'] );

		// Assert
		$identifier = 'urn:air:' . $this->get_host() . ':skills:agent-skills';
		$this->assertArrayHasKey( $identifier, $entries );
		$this->assertSame( $home . '.well-known/agent-skills', $entries[ $identifier ]['url'] );
		$this->assertSame( 'application/json', $entries[ $identifier ]['type'] );
	}

	public function test_generate_content__declares_ai_catalog_spec_version() {
		// Act
		$content = $this->invoke_generate_content();

		// Assert
		$this->assertSame( Ard_Catalog::SPEC_VERSION, $content['specVersion'] );
		$this->assertIsArray( $content['entries'] );
	}

	public function test_generate_content__every_entry_has_required_ard_fields() {
		// Arrange
		$identifier_prefix = 'urn:air:' . $this->get_host() . ':';

		// Act
		$entries = $this->invoke_generate_content()['entries'];

		// Assert
		$this->assertNotEmpty( $entries );
		foreach ( $entries as $entry ) {
			$this->assertStringStartsWith( $identifier_prefix, $entry['identifier'] );
			$this->assertNotEmpty( $entry['displayName'] );
			$this->assertNotEmpty( $entry['type'] );
			$this->assertCount( 1, array_intersect_key( $entry, array_flip( [ 'url', 'data' ] ) ) );
		}
	}

	public function test_generate_content__entries_filter_can_append_an_entry() {
		// Arrange
		$custom_entry = [
			'identifier'  => 'urn:air:' . $this->get_host() . ':mcp:custom',
			'displayName' => 'Custom MCP server',
			'type'        => 'application/json',
			'url'         => trailingslashit( home_url() ) . 'custom.json',
		];
		add_filter( self::ENTRIES_FILTER, static function ( array $entries ) use ( $custom_entry ) {
			$entries[] = $custom_entry;

			return $entries;
		} );

		// Act
		$entries = $this->invoke_generate_content()['entries'];

		// Assert
		$this->assertSame( $custom_entry, end( $entries ) );
	}

	public function test_get_slug_aliases__registers_ai_catalog_path_on_router() {
		// Arrange
		$router = $this->module->get_component( 'well_known_router' );

		// Act
		$endpoints = $router->get_all_endpoints();

		// Assert
		$this->assertArrayHasKey( 'ard.json', $endpoints );
		$this->assertArrayHasKey( 'ai-catalog.json', $endpoints );
		$this->assertInstanceOf( Ard_Catalog::class, $endpoints['ai-catalog.json'] );
	}

	public function test_is_applicable__returns_true_by_default() {
		// Act
		$applicable = $this->ard_catalog->is_applicable();

		// Assert
		$this->assertTrue( $applicable );
	}

	public function test_is_applicable__returns_false_when_filter_returns_false() {
		// Arrange
		add_filter( self::IS_APPLICABLE_FILTER, '__return_false' );

		// Act
		$applicable = $this->ard_catalog->is_applicable();

		// Assert
		$this->assertFalse( $applicable );
	}

	public function test_is_applicable__returns_false_when_physical_ai_catalog_exists() {
		// Arrange
		$directory         = ABSPATH . '.well-known';
		$file_path         = $directory . '/ai-catalog.json';
		$created_directory = ! is_dir( $directory ) && wp_mkdir_p( $directory );

		try {
			file_put_contents( $file_path, '{"entries":[]}' );

			// Act
			$applicable = $this->ard_catalog->is_applicable();

			// Assert
			$this->assertFalse( $applicable );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			if ( $created_directory ) {
				rmdir( $directory );
			}
		}
	}

	public function test_build_identifier__omits_site_path_for_root_site() {
		// Act
		$identifier = Ard_Catalog::build_identifier( 'document', 'llms-txt' );

		// Assert
		$this->assertSame( 'urn:air:' . $this->get_host() . ':document:llms-txt', $identifier );
	}

	public function test_build_identifier__includes_site_path_for_subdirectory_site() {
		// Arrange
		$filter = static fn() => 'https://example.com/site-a';
		add_filter( 'home_url', $filter );

		// Act
		$identifier = Ard_Catalog::build_identifier( 'document', 'llms-txt' );

		// Assert
		remove_filter( 'home_url', $filter );
		$this->assertSame( 'urn:air:example.com:site-a:document:llms-txt', $identifier );
	}

	public function test_build_identifier__preserves_path_segments_separately() {
		// Arrange
		$filter = static fn() => 'https://example.com/team/docs';
		add_filter( 'home_url', $filter );

		// Act
		$identifier = Ard_Catalog::build_identifier( 'document', 'llms-txt' );

		// Assert
		remove_filter( 'home_url', $filter );
		$this->assertSame( 'urn:air:example.com:team:docs:document:llms-txt', $identifier );
	}

	public function test_build_identifier__distinguishes_slashed_vs_hyphenated_paths() {
		$filter_slashed = static fn() => 'https://example.com/team/docs';
		$filter_hyphenated = static fn() => 'https://example.com/team-docs';

		add_filter( 'home_url', $filter_slashed );
		$identifier_slashed = Ard_Catalog::build_identifier( 'document', 'llms-txt' );
		remove_filter( 'home_url', $filter_slashed );

		add_filter( 'home_url', $filter_hyphenated );
		$identifier_hyphenated = Ard_Catalog::build_identifier( 'document', 'llms-txt' );
		remove_filter( 'home_url', $filter_hyphenated );

		$this->assertSame( 'urn:air:example.com:team:docs:document:llms-txt', $identifier_slashed );
		$this->assertSame( 'urn:air:example.com:team-docs:document:llms-txt', $identifier_hyphenated );
		$this->assertNotSame( $identifier_slashed, $identifier_hyphenated );
	}

	public function test_build_identifier__distinguishes_slashed_vs_hyphenated_paths_for_skills() {
		$filter_slashed = static fn() => 'https://example.com/team/docs';
		$filter_hyphenated = static fn() => 'https://example.com/team-docs';

		add_filter( 'home_url', $filter_slashed );
		$identifier_slashed = Ard_Catalog::build_identifier( 'skills', 'agent-skills' );
		remove_filter( 'home_url', $filter_slashed );

		add_filter( 'home_url', $filter_hyphenated );
		$identifier_hyphenated = Ard_Catalog::build_identifier( 'skills', 'agent-skills' );
		remove_filter( 'home_url', $filter_hyphenated );

		$this->assertSame( 'urn:air:example.com:team:docs:skills:agent-skills', $identifier_slashed );
		$this->assertSame( 'urn:air:example.com:team-docs:skills:agent-skills', $identifier_hyphenated );
		$this->assertNotSame( $identifier_slashed, $identifier_hyphenated );
	}

	public function test_build_identifier__distinguishes_paths_that_differ_only_by_case_or_spacing() {
		// Arrange
		$filter_spaced = static fn() => 'https://example.com/Team%20Docs';
		$filter_hyphenated = static fn() => 'https://example.com/team-docs';

		// Act
		add_filter( 'home_url', $filter_spaced );
		$identifier_spaced = Ard_Catalog::build_identifier( 'document', 'llms-txt' );
		remove_filter( 'home_url', $filter_spaced );

		add_filter( 'home_url', $filter_hyphenated );
		$identifier_hyphenated = Ard_Catalog::build_identifier( 'document', 'llms-txt' );
		remove_filter( 'home_url', $filter_hyphenated );

		// Assert
		$this->assertNotSame( $identifier_spaced, $identifier_hyphenated );
	}

	public function test_build_identifier__sanitizes_special_characters_per_segment() {
		// Arrange
		$filter = static fn() => 'https://example.com/café/über-docs';
		add_filter( 'home_url', $filter );

		// Act
		$identifier = Ard_Catalog::build_identifier( 'document', 'llms-txt' );

		// Assert
		remove_filter( 'home_url', $filter );
		$this->assertSame( 'urn:air:example.com:caf%C3%A9:%C3%BCber-docs:document:llms-txt', $identifier );
	}

	public function test_is_applicable__returns_false_when_physical_catalog_exists_in_public_home_directory() {
		// Arrange
		$home_filter = static fn() => 'https://example.com';
		$wp_directory = basename( untrailingslashit( ABSPATH ) );
		$site_filter = static fn() => 'https://example.com/' . $wp_directory;
		add_filter( 'home_url', $home_filter );
		add_filter( 'site_url', $site_filter );
		$public_root = trailingslashit( dirname( untrailingslashit( ABSPATH ) ) );
		$directory   = $public_root . '.well-known';
		$file_path   = $directory . '/ard.json';
		$created     = ! is_dir( $directory ) && wp_mkdir_p( $directory );

		try {
			file_put_contents( $file_path, '{"entries":[]}' );

			// Act
			$applicable = $this->ard_catalog->is_applicable();

			// Assert
			$this->assertFalse( $applicable );
		} finally {
			remove_filter( 'home_url', $home_filter );
			remove_filter( 'site_url', $site_filter );
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			if ( $created ) {
				rmdir( $directory );
			}
		}
	}

	public function test_generate_content__includes_openapi_entry_when_publishable() {
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
		$content = $this->invoke_generate_content();

		// Assert
		$entries = $this->index_entries_by_identifier( $content['entries'] );
		$openapi_identifier = 'urn:air:' . $this->get_host() . ':api:openapi';
		$this->assertArrayHasKey( $openapi_identifier, $entries );
		$this->assertSame( 'OpenAPI', $entries[ $openapi_identifier ]['displayName'] );
		$this->assertStringContainsString( '/openapi.json', $entries[ $openapi_identifier ]['url'] );

		remove_all_filters( 'pre_option_permalink_structure' );
		remove_all_filters( 'pre_http_request' );
	}

	public function test_generate_content__omits_openapi_entry_when_not_publishable() {
		// Arrange: Make OpenAPI unpublishable by setting plain permalinks
		add_filter( 'pre_option_permalink_structure', static function () {
			return '';
		} );

		// Act
		$content = $this->invoke_generate_content();

		// Assert
		$entries = $this->index_entries_by_identifier( $content['entries'] );
		$openapi_identifier = 'urn:air:' . $this->get_host() . ':api:openapi';
		$this->assertArrayNotHasKey( $openapi_identifier, $entries );

		remove_all_filters( 'pre_option_permalink_structure' );
	}

	private function get_host(): string {
		return (string) wp_parse_url( home_url(), PHP_URL_HOST );
	}

	private function index_entries_by_identifier( array $entries ): array {
		return array_column( $entries, null, 'identifier' );
	}

	private function invoke_generate_content(): array {
		$method = new \ReflectionMethod( Ard_Catalog::class, 'generate_content' );
		$method->setAccessible( true );

		return $method->invoke( $this->ard_catalog );
	}
}
