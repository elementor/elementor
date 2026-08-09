<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Read_Resource_Ability extends Abstract_Ability {

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

		$executors = $this->get_resource_executors();

		if ( ! isset( $executors[ $uri ] ) ) {
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

		$executor = $executors[ $uri ];
		/** @var Abstract_Ability $ability */
		$ability = $executor['ability'];

		if ( ! $ability->check_permission() ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to perform this action.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$content = $ability->execute();

		if ( is_wp_error( $content ) ) {
			return $content;
		}

		return [
			'uri' => $uri,
			'mimeType' => $executor['mimeType'],
			'content' => $this->to_content_string( $content ),
		];
	}

	private function to_content_string( $content ): string {
		if ( is_string( $content ) ) {
			return $content;
		}

		if (
			is_array( $content )
			&& isset( $content[0] )
			&& is_array( $content[0] )
			&& isset( $content[0]['text'] )
		) {
			return (string) $content[0]['text'];
		}

		return wp_json_encode( $content );
	}

	private function get_resource_executors(): array {
		return [
			Style_Best_Practices_Ability::URI => [
				'ability' => new Style_Best_Practices_Ability(),
				'mimeType' => 'text/markdown',
			],
			Wordpress_Best_Practices_Ability::URI => [
				'ability' => new Wordpress_Best_Practices_Ability(),
				'mimeType' => 'text/markdown',
			],
			Manage_Variable_Guide_Ability::URI => [
				'ability' => new Manage_Variable_Guide_Ability(),
				'mimeType' => 'text/plain',
			],
			Global_Classes_Resource_Ability::URI => [
				'ability' => new Global_Classes_Resource_Ability(),
				'mimeType' => 'application/json',
			],
			Global_Variables_Resource_Ability::URI => [
				'ability' => new Global_Variables_Resource_Ability(),
				'mimeType' => 'application/json',
			],
			List_Dynamic_Tags_Ability::URI => [
				'ability' => new List_Dynamic_Tags_Ability(),
				'mimeType' => 'application/json',
			],
			Interactions_Schema_Resource_Ability::URI => [
				'ability' => new Interactions_Schema_Resource_Ability(),
				'mimeType' => 'application/json',
			],
			Suggested_Actions_Ui_Ability::URI => [
				'ability' => new Suggested_Actions_Ui_Ability(),
				'mimeType' => Suggested_Actions_Ui_Ability::MIME_TYPE,
			],
		];
	}
}
