<?php

namespace Elementor\Modules\Agents\Components\Discovery;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OpenAPI Specification endpoint — /openapi.json
 *
 * Publishes an OpenAPI 3.0.3 description of the WordPress REST API subset safe
 * for anonymous agent access (posts, pages, search). Published only when the
 * Agent Discovery module is enabled, permalink structure is not plain, and
 * anonymous REST API access passes reachability validation.
 *
 * Served via template_redirect, reusing transient + ETag + 304 logic from
 * well-known endpoints.
 */
class Openapi_Spec extends Feature_Component {

	const TRANSIENT_CONTENT = 'elementor_agents_openapi_content';
	const TRANSIENT_ETAG = 'elementor_agents_openapi_etag';
	const TRANSIENT_MODIFIED = 'elementor_agents_openapi_modified';
	const TRANSIENT_VALIDATED = 'elementor_agents_openapi_validated';
	const TRANSIENT_TTL = 3600;

	const ENDPOINT_SLUG = 'openapi.json';

	private Agent_Ready_Settings $settings;
	private Prompt_Injection_Sanitizer $sanitizer;

	public function __construct( Agent_Ready_Settings $settings ) {
		$this->settings  = $settings;
		$this->sanitizer = new Prompt_Injection_Sanitizer();
	}

	public function get_id(): string {
		return 'openapi_spec';
	}

	public function get_layer(): string {
		return 'discovery';
	}

	public function get_required_modules(): array {
		return [ Agent_Ready_Settings::MODULE_AGENT_DISCOVERY ];
	}

	public function register(): void {
		if ( ! $this->settings->is_module_active( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY ) ) {
			return;
		}

		add_action( 'template_redirect', [ $this, 'maybe_serve_openapi' ], 1 );
		add_action( 'update_option_permalink_structure', [ $this, 'flush_cache' ] );
		add_action( 'update_option_blogname', [ $this, 'flush_cache' ] );
		add_action( 'update_option_blogdescription', [ $this, 'flush_cache' ] );
		add_action( 'update_option_home', [ $this, 'flush_cache' ] );
		add_action( 'update_option_siteurl', [ $this, 'flush_cache' ] );
		add_action( 'elementor/agents/llms_txt/cache_invalidated', [ $this, 'flush_cache' ] );
	}

	public function maybe_serve_openapi(): void {
		if ( ! $this->is_request_for_openapi() ) {
			return;
		}

		if ( ! $this->is_publishable() ) {
			status_header( 404 );
			exit;
		}

		$this->serve_openapi();
	}

	public function is_publishable(): bool {
		if ( '' === get_option( 'permalink_structure' ) ) {
			return false;
		}

		if ( $this->has_physical_openapi_file() ) {
			return false;
		}

		if ( ! $this->is_anonymous_rest_accessible() ) {
			return false;
		}

		$spec = $this->generate_spec();
		if ( empty( $spec['paths'] ) ) {
			return false;
		}

		// Must have at least one content endpoint (posts or pages), not just search
		$has_content_endpoint = isset( $spec['paths']['/wp/v2/posts'] ) || isset( $spec['paths']['/wp/v2/pages'] );
		if ( ! $has_content_endpoint ) {
			return false;
		}

		return true;
	}

	public function flush_cache(): void {
		delete_transient( self::TRANSIENT_CONTENT );
		delete_transient( self::TRANSIENT_ETAG );
		delete_transient( self::TRANSIENT_MODIFIED );
		delete_transient( self::TRANSIENT_VALIDATED );
	}

	private function is_request_for_openapi(): bool {
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		$path        = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! $path ) {
			return false;
		}

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );
		$home_path = $home_path ? trailingslashit( $home_path ) : '/';

		if ( 0 === strpos( $path, $home_path ) ) {
			$path = substr( $path, strlen( $home_path ) );
		}

		return self::ENDPOINT_SLUG === ltrim( $path, '/' );
	}

	private function has_physical_openapi_file(): bool {
		$root_path = Module::get_llms_file_root_path();
		return file_exists( $root_path . self::ENDPOINT_SLUG );
	}

	private function is_anonymous_rest_accessible(): bool {
		$validated = get_transient( self::TRANSIENT_VALIDATED );

		if ( false !== $validated ) {
			return (bool) $validated;
		}

		$result = $this->validate_anonymous_rest_access();
		set_transient( self::TRANSIENT_VALIDATED, $result ? 1 : 0, self::TRANSIENT_TTL );

		return $result;
	}

	private function validate_anonymous_rest_access(): bool {
		$auth_error = apply_filters( 'rest_authentication_errors', null );

		if ( is_wp_error( $auth_error ) ) {
			return false;
		}

		$posts_url = rest_url( 'wp/v2/posts' );
		$args      = [
			'timeout'    => 5,
			'user-agent' => 'Elementor-Agent-Ready/OpenAPI-Validator',
			'sslverify'  => false,
		];

		$response = wp_remote_get( $posts_url, $args );

		if ( is_wp_error( $response ) ) {
			return false;
		}

		$status = wp_remote_retrieve_response_code( $response );
		return in_array( $status, [ 200, 403, 401 ], true );
	}

	private function serve_openapi(): void {
		$cached_content = get_transient( self::TRANSIENT_CONTENT );
		$cached_etag    = get_transient( self::TRANSIENT_ETAG );

		if ( false !== $cached_content && false !== $cached_etag ) {
			$this->send_response( $cached_content, $cached_etag );
			exit;
		}

		$spec           = $this->generate_spec();
		$content        = wp_json_encode( $spec, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		$etag           = '"' . md5( $content ) . '"';
		$last_modified  = time();

		set_transient( self::TRANSIENT_CONTENT, $content, self::TRANSIENT_TTL );
		set_transient( self::TRANSIENT_ETAG, $etag, self::TRANSIENT_TTL );
		set_transient( self::TRANSIENT_MODIFIED, $last_modified, self::TRANSIENT_TTL );

		$this->send_response( $content, $etag );
		exit;
	}

	private function send_response( string $content, string $etag ): void {
		$if_none_match = isset( $_SERVER['HTTP_IF_NONE_MATCH'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_NONE_MATCH'] ) ) )
			: '';

		if ( '' !== $if_none_match && $this->etag_matches( $if_none_match, $etag ) ) {
			status_header( 304 );
			header( 'ETag: ' . $etag );
			exit;
		}

		status_header( 200 );
		header( 'Content-Type: application/json; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Cache-Control: public, max-age=' . self::TRANSIENT_TTL );
		header( 'ETag: ' . $etag );
		header( 'Access-Control-Allow-Origin: *' );
		header( 'X-Robots-Tag: noindex' );

		$last_modified = get_transient( self::TRANSIENT_MODIFIED );
		if ( false !== $last_modified ) {
			header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s', (int) $last_modified ) . ' GMT' );
		}

		Utils::print_unescaped_internal_string( $content );
	}

	private function etag_matches( string $header, string $etag ): bool {
		foreach ( explode( ',', $header ) as $candidate ) {
			$candidate = trim( $candidate );

			if ( '*' === $candidate ) {
				return true;
			}

			if ( 0 === strpos( $candidate, 'W/' ) ) {
				$candidate = substr( $candidate, 2 );
			}

			if ( $candidate === $etag ) {
				return true;
			}
		}

		return false;
	}

	private function generate_spec(): array {
		$site_name        = $this->sanitizer->sanitize( get_bloginfo( 'name' ) );
		$site_description = $this->sanitizer->sanitize( get_bloginfo( 'description' ) );

		$spec = [
			'openapi'  => '3.0.3',
			'info'     => [
				'title'       => $site_name ? $site_name : 'WordPress Site',
				'description' => $site_description ? $site_description : 'WordPress REST API for agent access',
				'version'     => '1.0.0',
			],
			'security' => [],
			'servers'  => [
				[
					'url'         => untrailingslashit( rest_url() ),
					'description' => 'WordPress REST API',
				],
			],
			'paths'      => [],
			'components' => [
				'schemas' => [
					'Content'  => [
						'type'       => 'object',
						'properties' => [
							'id'       => [ 'type' => 'integer' ],
							'slug'     => [ 'type' => 'string' ],
							'link'     => [
								'type'   => 'string',
								'format' => 'uri',
							],
							'date'     => [ 'type' => 'string' ],
							'modified' => [ 'type' => 'string' ],
							'title'    => [ '$ref' => '#/components/schemas/Rendered' ],
							'excerpt'  => [ '$ref' => '#/components/schemas/Rendered' ],
							'content'  => [ '$ref' => '#/components/schemas/Rendered' ],
						],
					],
					'Rendered' => [
						'type'       => 'object',
						'properties' => [
							'rendered' => [ 'type' => 'string' ],
						],
					],
					'SearchResult' => [
						'type'       => 'object',
						'properties' => [
							'id'      => [ 'type' => 'integer' ],
							'title'   => [ 'type' => 'string' ],
							'url'     => [
								'type'   => 'string',
								'format' => 'uri',
							],
							'type'    => [ 'type' => 'string' ],
							'subtype' => [ 'type' => 'string' ],
						],
					],
					'Error' => [
						'type'       => 'object',
						'properties' => [
							'code'    => [ 'type' => 'string' ],
							'message' => [ 'type' => 'string' ],
						],
					],
				],
			],
		];

		$post_type = get_post_type_object( 'post' );
		if ( $post_type && $post_type->show_in_rest ) {
			$spec['paths']['/wp/v2/posts']      = $this->build_list_operation( 'posts', 'listPosts' );
			$spec['paths']['/wp/v2/posts/{id}'] = $this->build_get_operation( 'post', 'getPost' );
		}

		$page_type = get_post_type_object( 'page' );
		if ( $page_type && $page_type->show_in_rest ) {
			$spec['paths']['/wp/v2/pages']      = $this->build_list_operation( 'pages', 'listPages' );
			$spec['paths']['/wp/v2/pages/{id}'] = $this->build_get_operation( 'page', 'getPage' );
		}

		$subtypes = [];
		if ( $post_type && $post_type->show_in_rest ) {
			$subtypes[] = 'post';
		}
		if ( $page_type && $page_type->show_in_rest ) {
			$subtypes[] = 'page';
		}

		if ( ! empty( $subtypes ) ) {
			$spec['paths']['/wp/v2/search'] = $this->build_search_operation( $subtypes );
		}

		return $spec;
	}

	private function build_list_operation( string $type, string $operation_id ): array {
		return [
			'get' => [
				'operationId' => $operation_id,
				'summary'     => "List all {$type}",
				'description' => "Retrieve a paginated collection of published {$type} for agent consumption",
				'parameters'  => [
					[
						'name'        => 'page',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type'    => 'integer',
							'minimum' => 1,
							'default' => 1,
						],
						'description' => 'Current page of the collection',
					],
					[
						'name'        => 'per_page',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type'    => 'integer',
							'minimum' => 1,
							'maximum' => 100,
							'default' => 10,
						],
						'description' => 'Maximum number of items per page',
					],
					[
						'name'        => 'search',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [ 'type' => 'string' ],
						'description' => 'Limit results to those matching a string',
					],
					[
						'name'        => 'slug',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [ 'type' => 'string' ],
						'description' => 'Limit result set to specific slug',
					],
					[
						'name'        => 'orderby',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type'    => 'string',
							'enum'    => [ 'date', 'modified', 'title', 'slug', 'id', 'relevance' ],
							'default' => 'date',
						],
						'description' => 'Sort collection by object attribute',
					],
					[
						'name'        => 'order',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type'    => 'string',
							'enum'    => [ 'asc', 'desc' ],
							'default' => 'desc',
						],
						'description' => 'Order sort attribute ascending or descending',
					],
					[
						'name'        => '_fields',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [ 'type' => 'string' ],
						'description' => 'Limit response to specific fields',
					],
				],
				'responses'   => [
					'200' => [
						'description' => "List of {$type}",
						'headers'     => [
							'X-WP-Total'      => [
								'schema'      => [ 'type' => 'integer' ],
								'description' => 'Total number of items',
							],
							'X-WP-TotalPages' => [
								'schema'      => [ 'type' => 'integer' ],
								'description' => 'Total number of pages',
							],
						],
						'content'     => [
							'application/json' => [
								'schema' => [
									'type'  => 'array',
									'items' => [ '$ref' => '#/components/schemas/Content' ],
								],
							],
						],
					],
					'400' => [
						'description' => 'Invalid request parameters',
						'content'     => [
							'application/json' => [
								'schema' => [ '$ref' => '#/components/schemas/Error' ],
							],
						],
					],
				],
			],
		];
	}

	private function build_get_operation( string $type, string $operation_id ): array {
		return [
			'get' => [
				'operationId' => $operation_id,
				'summary'     => "Get a {$type}",
				'description' => "Retrieve a specific published {$type} by ID for agent consumption",
				'parameters'  => [
					[
						'name'        => 'id',
						'in'          => 'path',
						'required'    => true,
						'schema'      => [
							'type'    => 'integer',
							'minimum' => 1,
						],
						'description' => "Unique identifier for the {$type}",
					],
					[
						'name'        => '_fields',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [ 'type' => 'string' ],
						'description' => 'Limit response to specific fields',
					],
				],
				'responses'   => [
					'200' => [
						'description' => "The requested {$type}",
						'content'     => [
							'application/json' => [
								'schema' => [ '$ref' => '#/components/schemas/Content' ],
							],
						],
					],
					'404' => [
						'description' => "{$type} not found",
						'content'     => [
							'application/json' => [
								'schema' => [ '$ref' => '#/components/schemas/Error' ],
							],
						],
					],
				],
			],
		];
	}

	private function build_search_operation( array $subtypes ): array {
		return [
			'get' => [
				'operationId' => 'searchContent',
				'summary'     => 'Search site content',
				'description' => 'Search across posts and pages using keywords',
				'parameters'  => [
					[
						'name'        => 'search',
						'in'          => 'query',
						'required'    => true,
						'schema'      => [ 'type' => 'string' ],
						'description' => 'Search keyword (required)',
					],
					[
						'name'        => 'subtype',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type' => 'string',
							'enum' => $subtypes,
						],
						'description' => 'Limit results to a specific content type',
					],
					[
						'name'        => 'page',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type'    => 'integer',
							'minimum' => 1,
							'default' => 1,
						],
						'description' => 'Current page of the collection',
					],
					[
						'name'        => 'per_page',
						'in'          => 'query',
						'required'    => false,
						'schema'      => [
							'type'    => 'integer',
							'minimum' => 1,
							'maximum' => 100,
							'default' => 10,
						],
						'description' => 'Maximum number of items per page',
					],
				],
				'responses'   => [
					'200' => [
						'description' => 'Search results',
						'content'     => [
							'application/json' => [
								'schema' => [
									'type'  => 'array',
									'items' => [ '$ref' => '#/components/schemas/SearchResult' ],
								],
							],
						],
					],
					'400' => [
						'description' => 'Invalid request parameters',
						'content'     => [
							'application/json' => [
								'schema' => [ '$ref' => '#/components/schemas/Error' ],
							],
						],
					],
				],
			],
		];
	}
}
