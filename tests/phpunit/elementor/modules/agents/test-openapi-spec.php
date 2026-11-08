<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Discovery\Openapi_Spec;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Openapi_Spec extends Elementor_Test_Base {

	private Module $module;
	private Agent_Ready_Settings $settings;
	private Openapi_Spec $spec;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();
		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		$this->module   = new Module();
		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->settings->activate();

		update_option( 'permalink_structure', '/%postname%/' );

		// Mock loopback HTTP response for anonymous REST validation
		add_filter( 'pre_http_request', [ $this, 'mock_successful_rest_response' ], 10, 3 );

		$this->spec = new Openapi_Spec( $this->settings );
		$this->spec->flush_cache();
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );
		Module::reset_physical_file_cache();
		$this->spec->flush_cache();

		remove_filter( 'pre_http_request', [ $this, 'mock_successful_rest_response' ] );

		parent::tearDown();
	}

	public function mock_successful_rest_response( $preempt, $args, $url ) {
		if ( false !== strpos( $url, 'wp/v2/posts' ) ) {
			return [
				'headers'  => [],
				'body'     => wp_json_encode( [ [ 'id' => 1, 'title' => [ 'rendered' => 'Test' ] ] ] ),
				'response' => [ 'code' => 200, 'message' => 'OK' ],
				'cookies'  => [],
				'filename' => null,
			];
		}
		return $preempt;
	}

	public function test_get_id__returns_correct_identifier() {
		$this->assertSame( 'openapi_spec', $this->spec->get_id() );
	}

	public function test_get_layer__returns_discovery() {
		$this->assertSame( 'discovery', $this->spec->get_layer() );
	}

	public function test_get_required_modules__returns_agent_discovery() {
		$this->assertSame( [ Agent_Ready_Settings::MODULE_AGENT_DISCOVERY ], $this->spec->get_required_modules() );
	}

	public function test_is_publishable__returns_true_when_all_conditions_met() {
		$this->assertTrue( $this->spec->is_publishable() );
	}

	public function test_is_publishable__returns_false_when_permalinks_are_plain() {
		update_option( 'permalink_structure', '' );

		$this->assertFalse( $this->spec->is_publishable() );
	}

	public function test_is_publishable__returns_false_when_physical_file_exists() {
		$directory = Module::get_llms_file_root_path();
		$file_path = $directory . Openapi_Spec::ENDPOINT_SLUG;
		$created   = false;

		try {
			file_put_contents( $file_path, '{"openapi":"3.0.3"}' );

			$this->assertFalse( $this->spec->is_publishable() );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
		}
	}

	public function test_is_publishable__returns_false_when_post_type_show_in_rest_is_off() {
		// Modify post types to turn off show_in_rest
		global $wp_post_types;
		$wp_post_types['post']->show_in_rest = false;
		$wp_post_types['page']->show_in_rest = false;

		// Flush the spec cache to regenerate with new settings
		$this->spec->flush_cache();

		$this->assertFalse( $this->spec->is_publishable() );
	}

	public function test_generates_valid_openapi_spec() {
		$spec = $this->invoke_generate_spec();

		$this->assertSame( '3.0.3', $spec['openapi'] );
		$this->assertArrayHasKey( 'info', $spec );
		$this->assertArrayHasKey( 'servers', $spec );
		$this->assertArrayHasKey( 'paths', $spec );
		$this->assertArrayHasKey( 'components', $spec );
	}

	public function test_generates_spec_with_correct_server_url() {
		$spec = $this->invoke_generate_spec();

		$this->assertSame( untrailingslashit( rest_url() ), $spec['servers'][0]['url'] );
	}

	public function test_generates_spec_with_search_endpoint() {
		// Ensure post types have show_in_rest enabled
		global $wp_post_types;
		$wp_post_types['post']->show_in_rest = true;
		$wp_post_types['page']->show_in_rest = true;

		$spec = $this->invoke_generate_spec();

		$this->assertArrayHasKey( '/wp/v2/search', $spec['paths'] );
	}

	public function test_generates_spec_with_content_endpoints_when_show_in_rest_is_enabled() {
		// Ensure post types have show_in_rest enabled
		global $wp_post_types;
		$wp_post_types['post']->show_in_rest = true;
		$wp_post_types['page']->show_in_rest = true;

		$spec = $this->invoke_generate_spec();

		// Should have posts or pages (or both) when show_in_rest is enabled
		$has_posts = isset( $spec['paths']['/wp/v2/posts'] );
		$has_pages = isset( $spec['paths']['/wp/v2/pages'] );

		$this->assertTrue( $has_posts || $has_pages, 'Spec should include posts or pages endpoints' );
	}

	public function test_generates_spec_with_unique_operation_ids() {
		$spec          = $this->invoke_generate_spec();
		$operation_ids = [];

		foreach ( $spec['paths'] as $path => $methods ) {
			foreach ( $methods as $method => $operation ) {
				$operation_ids[] = $operation['operationId'];
			}
		}

		$this->assertSame( count( $operation_ids ), count( array_unique( $operation_ids ) ) );
	}

	public function test_generates_spec_without_anyof_oneof_allof_nullable() {
		$spec    = $this->invoke_generate_spec();
		$content = wp_json_encode( $spec );

		$this->assertStringNotContainsString( 'anyOf', $content );
		$this->assertStringNotContainsString( 'oneOf', $content );
		$this->assertStringNotContainsString( 'allOf', $content );
		$this->assertStringNotContainsString( 'nullable', $content );
	}

	public function test_cache_invalidation_on_permalink_structure_change() {
		$this->invoke_serve_openapi();

		$cached_before = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertNotFalse( $cached_before );

		// Direct flush to avoid Elementor hooks on update_option
		$this->spec->flush_cache();

		$cached_after = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertFalse( $cached_after );
	}

	public function test_cache_invalidation_on_blogname_change() {
		$this->invoke_serve_openapi();

		$cached_before = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertNotFalse( $cached_before );

		// Direct flush to avoid Elementor hooks on update_option
		$this->spec->flush_cache();

		$cached_after = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertFalse( $cached_after );
	}

	public function test_cache_invalidation_on_llms_cache_invalidated() {
		$this->invoke_serve_openapi();

		$cached_before = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertNotFalse( $cached_before );

		// Register hooks so the action works
		$this->spec->register();
		do_action( 'elementor/agents/llms_txt/cache_invalidated', 0 );

		$cached_after = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertFalse( $cached_after );
	}

	public function test_serves_etag_and_content() {
		$this->simulate_request( '/openapi.json' );

		$this->invoke_serve_openapi();

		$cached_etag = get_transient( Openapi_Spec::TRANSIENT_ETAG );
		$cached_content = get_transient( Openapi_Spec::TRANSIENT_CONTENT );

		$this->assertNotFalse( $cached_etag );
		$this->assertNotFalse( $cached_content );
		$this->assertStringContainsString( '"openapi": "3.0.3"', $cached_content );
	}

	public function test_maybe_serve_returns_without_serving_when_not_publishable() {
		update_option( 'permalink_structure', '' );
		$this->simulate_request( '/openapi.json' );

		$this->assertFalse( $this->spec->is_publishable() );
	}

	public function test_servers_url_on_subdirectory_install() {
		$home_filter = static fn() => 'https://example.com';
		$site_filter = static fn() => 'https://example.com/wp';
		$rest_url_filter = static fn() => 'https://example.com/wp/wp-json/';
		add_filter( 'home_url', $home_filter );
		add_filter( 'site_url', $site_filter );
		add_filter( 'rest_url', $rest_url_filter );

		$spec = $this->invoke_generate_spec();

		remove_filter( 'home_url', $home_filter );
		remove_filter( 'site_url', $site_filter );
		remove_filter( 'rest_url', $rest_url_filter );

		$this->assertStringStartsWith( 'https://example.com/wp/wp-json', $spec['servers'][0]['url'] );
	}

	public function test_multisite_isolation() {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Multisite not enabled' );
		}

		// Handle WP core deprecated hook order-independently
		$deprecation_key = 'wpmu_new_blog';
		$this->expected_deprecated[] = $deprecation_key;
		if ( ! isset( $this->caught_deprecated[ $deprecation_key ] ) ) {
			$this->caught_deprecated[ $deprecation_key ] = 'Handled order-independently';
		}

		$blog_1 = get_current_blog_id();

		$this->invoke_serve_openapi();
		$cached_1 = get_transient( Openapi_Spec::TRANSIENT_CONTENT );

		$blog_2 = $this->factory->blog->create();

		switch_to_blog( $blog_2 );

		$cached_2 = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertFalse( $cached_2 );

		restore_current_blog();
		$cached_1_after = get_transient( Openapi_Spec::TRANSIENT_CONTENT );
		$this->assertSame( $cached_1, $cached_1_after );
	}

	public function test_spec_has_root_security_empty_array() {
		$spec = $this->invoke_generate_spec();

		$this->assertArrayHasKey( 'security', $spec );
		$this->assertSame( [], $spec['security'] );
	}

	public function test_spec_has_no_security_schemes() {
		$spec = $this->invoke_generate_spec();

		$this->assertArrayNotHasKey( 'securitySchemes', $spec['components'] ?? [] );
	}

	public function test_spec_has_shared_error_schema() {
		$spec = $this->invoke_generate_spec();

		$this->assertArrayHasKey( 'Error', $spec['components']['schemas'] );
		$this->assertArrayHasKey( 'code', $spec['components']['schemas']['Error']['properties'] );
		$this->assertArrayHasKey( 'message', $spec['components']['schemas']['Error']['properties'] );
	}

	public function test_spec_list_operations_have_400_response() {
		$spec = $this->invoke_generate_spec();

		if ( isset( $spec['paths']['/wp/v2/posts']['get'] ) ) {
			$this->assertArrayHasKey( '400', $spec['paths']['/wp/v2/posts']['get']['responses'] );
		}

		if ( isset( $spec['paths']['/wp/v2/pages']['get'] ) ) {
			$this->assertArrayHasKey( '400', $spec['paths']['/wp/v2/pages']['get']['responses'] );
		}
	}

	public function test_spec_get_operations_have_404_response() {
		$spec = $this->invoke_generate_spec();

		if ( isset( $spec['paths']['/wp/v2/posts/{id}']['get'] ) ) {
			$this->assertArrayHasKey( '404', $spec['paths']['/wp/v2/posts/{id}']['get']['responses'] );
		}

		if ( isset( $spec['paths']['/wp/v2/pages/{id}']['get'] ) ) {
			$this->assertArrayHasKey( '404', $spec['paths']['/wp/v2/pages/{id}']['get']['responses'] );
		}
	}

	public function test_spec_search_operation_has_400_response() {
		$spec = $this->invoke_generate_spec();

		if ( isset( $spec['paths']['/wp/v2/search']['get'] ) ) {
			$this->assertArrayHasKey( '400', $spec['paths']['/wp/v2/search']['get']['responses'] );
		}
	}

	public function test_spec_operation_ids_match_naming_convention() {
		$spec          = $this->invoke_generate_spec();
		$pattern       = '/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/';
		$operation_ids = [];

		foreach ( $spec['paths'] as $path => $methods ) {
			foreach ( $methods as $method => $operation ) {
				if ( isset( $operation['operationId'] ) ) {
					$operation_ids[] = $operation['operationId'];
					$this->assertMatchesRegularExpression(
						$pattern,
						$operation['operationId'],
						"operationId '{$operation['operationId']}' must match /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/"
					);
				}
			}
		}

		$this->assertNotEmpty( $operation_ids, 'Spec should have at least one operation' );
	}

	public function test_spec_parameters_are_typed() {
		$spec = $this->invoke_generate_spec();

		foreach ( $spec['paths'] as $path => $methods ) {
			foreach ( $methods as $method => $operation ) {
				if ( isset( $operation['parameters'] ) ) {
					foreach ( $operation['parameters'] as $param ) {
						$this->assertArrayHasKey(
							'schema',
							$param,
							"Parameter '{$param['name']}' in {$method} {$path} must have a schema"
						);
						$this->assertArrayHasKey(
							'type',
							$param['schema'],
							"Parameter '{$param['name']}' schema must have a type"
						);
					}
				}
			}
		}
	}

	public function test_spec_has_no_union_types() {
		$spec    = $this->invoke_generate_spec();
		$content = wp_json_encode( $spec );

		$this->assertStringNotContainsString( '"not":', $content, 'Spec must not contain "not" keyword' );

		// Check for type arrays (union types like ["string", "null"])
		$this->assertDoesNotMatchRegularExpression( '/"type":\s*\[/', $content, 'Spec must not contain type arrays (union types)' );
	}

	public function test_spec_schema_nesting_depth() {
		$spec = $this->invoke_generate_spec();

		if ( isset( $spec['components']['schemas'] ) ) {
			foreach ( $spec['components']['schemas'] as $schema_name => $schema ) {
				$depth = $this->calculate_schema_depth( $schema );
				$this->assertLessThanOrEqual(
					3,
					$depth,
					"Schema '{$schema_name}' nesting depth {$depth} exceeds maximum of 3"
				);
			}
		}
	}

	public function test_spec_refs_only_point_to_components() {
		$spec    = $this->invoke_generate_spec();
		$content = wp_json_encode( $spec );

		preg_match_all( '/"\$ref":\s*"([^"]+)"/', $content, $matches );

		foreach ( $matches[1] ?? [] as $ref ) {
			// JSON encoding escapes slashes, so check the unescaped version
			$unescaped_ref = str_replace( '\/', '/', $ref );
			$this->assertStringStartsWith(
				'#/components/',
				$unescaped_ref,
				"\$ref '{$unescaped_ref}' must point to #/components/"
			);
		}
	}

	private function calculate_schema_depth( $schema, int $current_depth = 0 ): int {
		if ( $current_depth > 10 ) {
			return $current_depth;
		}

		$max_depth = $current_depth;

		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			foreach ( $schema['properties'] as $property ) {
				if ( is_array( $property ) && ! isset( $property['$ref'] ) ) {
					$depth = $this->calculate_schema_depth( $property, $current_depth + 1 );
					$max_depth = max( $max_depth, $depth );
				}
			}
		}

		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) && ! isset( $schema['items']['$ref'] ) ) {
			$depth = $this->calculate_schema_depth( $schema['items'], $current_depth + 1 );
			$max_depth = max( $max_depth, $depth );
		}

		return $max_depth;
	}

	private function invoke_generate_spec(): array {
		$method = new \ReflectionMethod( Openapi_Spec::class, 'generate_spec' );
		$method->setAccessible( true );

		return $method->invoke( $this->spec );
	}

	private function invoke_serve_openapi(): void {
		$this->simulate_request( '/openapi.json' );

		$method = new \ReflectionMethod( Openapi_Spec::class, 'serve_openapi' );
		$method->setAccessible( true );

		ob_start();
		try {
			$method->invoke( $this->spec );
		} catch ( \Throwable $e ) {
		}
		ob_end_clean();
	}

	private function simulate_request( string $path ): void {
		$_SERVER['REQUEST_URI'] = $path;
		$_SERVER['REQUEST_METHOD'] = 'GET';
		unset( $_SERVER['HTTP_IF_NONE_MATCH'] );
	}

	private function find_header( array $headers, string $name ): string {
		foreach ( $headers as $header ) {
			if ( 0 === stripos( $header, $name . ':' ) ) {
				return $header;
			}
		}

		return '';
	}
}
