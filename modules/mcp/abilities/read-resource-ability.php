<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Read_Resource_Ability extends Abstract_Ability {

	private ?Ability_Registry $registry;

	public function __construct( ?Ability_Registry $registry = null ) {
		$this->registry = $registry;
	}

	protected function get_ability_id(): string {
		return 'elementor/read-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Read Elementor Resource', 'elementor' ),
			Prompt_Loader::load( 'read-resource' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'uri' => [ 'type' => 'string' ],
					'mimeType' => [ 'type' => 'string' ],
					'content' => [ 'type' => 'string' ],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'required' => [ 'uri' ],
				'properties' => [
					'uri' => [
						'type' => 'string',
						'description' => 'The resource URI to read. Use list-resources to discover available URIs.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$uri = $input['uri'] ?? '';

		if ( '' === $uri ) {
			return new \WP_Error(
				'missing_uri',
				__( 'Resource URI is required. Use list-resources to discover available URIs.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$resource = $this->resolve_registry()->find_resource_by_uri( $uri );

		if ( null === $resource ) {
			return new \WP_Error(
				'resource_not_found',
				sprintf(
					/* translators: %s: resource URI */
					__( 'Resource not found: %s. Use list-resources to discover available URIs.', 'elementor' ),
					$uri
				),
				[ 'status' => 404 ]
			);
		}

		if ( ! $resource->check_permission() ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to perform this action.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$content = $resource->execute();

		if ( is_wp_error( $content ) ) {
			return $content;
		}

		return [
			'uri' => $uri,
			'mimeType' => (string) ( $resource->get_mime_type() ?? '' ),
			'content' => is_string( $content ) ? $content : wp_json_encode( $content ),
		];
	}

	private function resolve_registry(): Ability_Registry {
		if ( $this->registry instanceof Ability_Registry ) {
			return $this->registry;
		}

		$module = Plugin::$instance->modules_manager->get_modules( 'mcp' );

		$this->registry = $module instanceof Mcp_Module
			? $module->registry()
			: Mcp_Module::build_core_registry();

		return $this->registry;
	}
}
