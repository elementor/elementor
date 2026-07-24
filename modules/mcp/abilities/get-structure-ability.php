<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\Styles\Local_Style_Serializer;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Structure_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-page-structure';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor Page Structure', 'elementor' ),
			__( 'Returns a lean Elementor element tree skeleton (id, elType, widgetType, nested elements) for a single post or page ID. Optionally scope to a subtree via element_id. Set include_content=true (requires element_id) to also return each node\'s settings and styles in the same shape that build-composition accepts as input. Only works for posts that were saved with Elementor.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'elements' => [
						'type' => 'array',
						'description' => 'Skeleton of Elementor elements (id, elType, widgetType, nested elements). When include_content is true, each node also includes settings and styles.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'element_id' => [
						'type' => 'string',
						'description' => 'Optional. If provided, returns only the subtree rooted at that element id.',
					],
					'include_content' => [
						'type' => 'boolean',
						'default' => false,
						'description' => 'If true, includes each node\'s settings and styles (in the same shape build-composition accepts as input). Requires element_id.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$document = $this->get_editable_document( $post_id );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$elements = $document->get_elements_data();
		$elements = is_array( $elements ) ? $elements : [];

		$element_id = isset( $input['element_id'] ) ? (string) $input['element_id'] : '';
		$include_content = ! empty( $input['include_content'] );

		if ( $include_content && '' === $element_id ) {
			return new \WP_Error(
				'invalid_input',
				__( 'include_content requires element_id.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( '' !== $element_id ) {
			$subtree = Utils::find_element_recursive( $elements, $element_id );

			if ( ! $subtree ) {
				return new \WP_Error(
					'element_not_found',
					__( 'Element not found in this document.', 'elementor' ),
					[ 'status' => \WP_Http::NOT_FOUND ]
				);
			}

			$elements = [ $subtree ];
		}

		return [
			'elements' => $this->prune_elements( $elements, $include_content ),
		];
	}

	private function prune_elements( array $elements, bool $include_content = false ): array {
		return Plugin::$instance->db->iterate_data( $elements, function ( $node ) use ( $include_content ) {
			$skeleton = [
				'id' => $node['id'] ?? null,
				'elType' => $node['elType'] ?? null,
			];

			if ( isset( $node['widgetType'] ) ) {
				$skeleton['widgetType'] = $node['widgetType'];
			}

			if ( ! empty( $node['elements'] ) ) {
				$skeleton['elements'] = $node['elements'];
			}

			if ( $include_content ) {
				$skeleton['settings'] = $node['settings'] ?? (object) [];
				$skeleton['styles']   = Local_Style_Serializer::serialize( $node['styles'] ?? [] );
			}

			return $skeleton;
		} );
	}

	private function resolve_post_id( $input ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'A valid post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_view',
				__( 'Sorry, you are not allowed to access this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return $post_id;
	}

	private function get_editable_document( int $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( ! $document->is_built_with_elementor() ) {
			return new \WP_Error(
				'not_elementor',
				__( 'This post is not built with Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error(
				'rest_cannot_view',
				__( 'Sorry, you are not allowed to edit this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return $document;
	}
}
