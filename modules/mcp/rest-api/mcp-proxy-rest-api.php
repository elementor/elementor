<?php

namespace Elementor\Modules\Mcp\RestApi;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Get_Structure_Ability;
use Elementor\Modules\Mcp\Abilities\Get_Widget_Schema_Ability;
use Elementor\Modules\Mcp\Abilities\Global_Classes_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\Global_Variables_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\List_Assets_Ability;
use Elementor\Modules\Mcp\Abilities\List_Dynamic_Tags_Ability;
use Elementor\Modules\Mcp\Abilities\List_Resources_Ability;
use Elementor\Modules\Mcp\Abilities\List_Widget_Schemas_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Classes_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Elements_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Read_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\Style_Best_Practices_Ability;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Proxy_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE      = 'mcp-proxy';

	/** @var array<string, callable(): Abstract_Ability> */
	private array $tools = [];

	/** @var array<string, callable(): Abstract_Ability> */
	private array $resources = [];

	public function __construct() {
		$this->tools = [
			'manage-global-variable' => fn() => new Manage_Variable_Ability(),
			'manage-classes' => fn() => new Manage_Classes_Ability(),
			'get-widget-schema' => fn() => new Get_Widget_Schema_Ability(),
			'list-widget-schemas' => fn() => new List_Widget_Schemas_Ability(),
			'get-page-structure' => fn() => new Get_Structure_Ability(),
			'manage-elements' => fn() => new Manage_Elements_Ability(),
			'list-assets' => fn() => new List_Assets_Ability(),
			'list-resources' => fn() => new List_Resources_Ability(),
			'read-resource' => fn() => new Read_Resource_Ability(),
		];

		$this->resources = [
			Style_Best_Practices_Ability::URI => fn() => new Style_Best_Practices_Ability(),
			Manage_Variable_Guide_Ability::URI => fn() => new Manage_Variable_Guide_Ability(),
			Global_Classes_Resource_Ability::URI => fn() => new Global_Classes_Resource_Ability(),
			Global_Variables_Resource_Ability::URI => fn() => new Global_Variables_Resource_Ability(),
			List_Dynamic_Tags_Ability::URI => fn() => new List_Dynamic_Tags_Ability(),
		];
	}

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods'             => 'POST',
				'callback'            => fn( $request ) => $this->route_wrapper( fn() => $this->handle_tool( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args'                => [
					'tool'  => [
						'type'     => 'string',
						'required' => true,
					],
					'input' => [
						'type'     => 'object',
						'required' => true,
					],
				],
			],
		[
			'methods'             => 'GET',
			'callback'            => fn( $request ) => $this->route_wrapper( fn() => $this->handle_get( $request ) ),
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			'validate_callback'   => fn( $request ) => $this->validate_get_params( $request ),
			'args'                => [
				'uri'    => [
					'type'        => 'string',
					'required'    => false,
					'description' => 'Resource URI to fetch.',
				],
				'schema' => [
					'type'        => 'string',
					'required'    => false,
					'description' => 'Tool name whose JSON schema to retrieve.',
				],
			],
		],
		] );
	}

	private function handle_tool( \WP_REST_Request $request ) {
		$tool  = $request->get_param( 'tool' );
		$input = $request->get_param( 'input' );

		if ( ! isset( $this->tools[ $tool ] ) ) {
			return Error_Builder::make( 'unknown_tool' )
				->set_status( 404 )
				// translators: By tool name
				->set_message( sprintf( __( 'Unknown tool: %s', 'elementor' ), $tool ) )
				->build();
		}

		$ability = ( $this->tools[ $tool ] )();

		if ( ! $ability->check_permission() ) {
			return $this->build_response( $this->forbidden_error() );
		}

		$result = $ability->execute( is_array( $input ) ? $input : [] );

		return $this->build_response( $result );
	}

	private function handle_get( \WP_REST_Request $request ) {
		if ( $request->get_param( 'schema' ) ) {
			return $this->handle_schema( $request );
		}

		return $this->handle_resource( $request );
	}

	private function handle_schema( \WP_REST_Request $request ) {
		$tool_name = $request->get_param( 'schema' );

		if ( ! isset( $this->tools[ $tool_name ] ) ) {
			return Error_Builder::make( 'unknown_tool' )
				->set_status( \WP_Http::NOT_FOUND )
				->set_message( sprintf( __( 'Unknown tool: %s', 'elementor' ), $tool_name ) )
				->build();
		}

		$ability = ( $this->tools[ $tool_name ] )();

		if ( ! $ability->check_permission() ) {
			return $this->forbidden_error();
		}

		return Response_Builder::make( $ability->get_schema() )->set_status( \WP_Http::OK )->build();
	}

	private function validate_get_params( \WP_REST_Request $request ) {
		if ( ! $request->get_param( 'schema' ) && ! $request->get_param( 'uri' ) ) {
			return new \WP_Error(
				'missing_param',
				__( 'Request must include either a "schema" or "uri" parameter.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return true;
	}

	private function handle_resource( \WP_REST_Request $request ) {
		$uri = $request->get_param( 'uri' );

		if ( ! isset( $this->resources[ $uri ] ) ) {
			return Error_Builder::make( 'unknown_resource' )
				->set_status( 404 )
				// translators: By resource URI
				->set_message( sprintf( __( 'Unknown resource: %s', 'elementor' ), $uri ) )
				->build();
		}

		$ability = ( $this->resources[ $uri ] )();

		if ( ! $ability->check_permission() ) {
			return $this->build_response( $this->forbidden_error() );
		}

		$result = $ability->execute();

		return $this->build_response( $result );
	}

	private function forbidden_error(): \WP_Error {
		return new \WP_Error(
			'rest_forbidden',
			__( 'Sorry, you are not allowed to perform this action.', 'elementor' ),
			[ 'status' => \WP_Http::FORBIDDEN ]
		);
	}

	private function build_response( $result ) {
		if ( is_wp_error( $result ) ) {
			$data   = $result->get_error_data();
			$status = is_array( $data ) && isset( $data['status'] ) ? $data['status'] : 400;

			return Error_Builder::make( $result->get_error_code() )
				->set_status( $status )
				->set_message( $result->get_error_message() )
				->build();
		}

		$http_status = $this->resolve_http_status( $result );

		return Response_Builder::make( $result )->set_status( $http_status )->build();
	}

	private function resolve_http_status( $result ): int {
		$status = is_array( $result ) ? ( $result['status'] ?? 'ok' ) : 'ok';

		$status_map = [
			'error'         => 422,
			'partial_error' => 207,
		];

		return $status_map[ $status ] ?? 200;
	}

	private function route_wrapper( callable $cb ) {
		try {
			return $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
