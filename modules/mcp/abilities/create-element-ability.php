<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Element_Ability extends Abstract_Ability {

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}

	protected function get_ability_id(): string {
		return 'elementor/create-element';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Create Elementor Element', 'elementor' ),
			__( 'Inserts a new element into an existing Elementor document tree. Resolves the element type from the registry, inserts it at the specified parent and index, and saves the document as a draft. Returns the new element ID and a preview URL.', 'elementor' ),
			'elementor',
			[
				'type'       => 'object',
				'required'   => [ 'success', 'post_id', 'element_id', 'version', 'preview_url' ],
				'properties' => [
					'success'     => [ 'type' => 'boolean' ],
					'post_id'     => [ 'type' => 'integer' ],
					'element_id'  => [ 'type' => 'string' ],
					'version'     => [ 'type' => 'string' ],
					'preview_url' => [
						'type' => 'string',
						'format' => 'uri',
					],
				],
			],
			[
				'annotations' => [
					'readonly'    => false,
					'idempotent'  => false,
					'destructive' => false,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type'       => 'object',
				'required'   => [ 'post_id', 'element' ],
				'properties' => [
					'post_id'   => [
						'type'        => 'integer',
						'description' => 'WordPress post ID of the document to mutate.',
					],
					'parent_id' => [
						'type'        => 'string',
						'default'     => 'document',
						'description' => 'ID of the parent container/section. Omit to insert at document root.',
					],
					'index'     => [
						'type'        => [ 'integer', 'null' ],
						'description' => '0-based insertion position. null or omitted = append to end.',
					],
					'element'   => [
						'type'                 => 'object',
						'required'             => [ 'type' ],
						'additionalProperties' => false,
						'properties'           => [
							'type'     => [
								'type'        => 'string',
								'description' => "Registry identifier (e.g. 'e-heading'). Server resolves elType and widgetType.",
							],
							'settings' => [
								'type'    => 'object',
								'default' => [],
							],
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input   = is_array( $input ) ? $input : [];
		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		$type_data = $this->resolve_element_type( $input['element']['type'] ?? '' );
		if ( is_wp_error( $type_data ) ) {
			return $type_data;
		}

		$parent_id = $input['parent_id'] ?? 'document';
		$index     = isset( $input['index'] ) ? (int) $input['index'] : null;
		if ( isset( $input['index'] ) && null === $input['index'] ) {
			$index = null;
		}

		$document = Plugin::$instance->documents->get_doc_or_auto_save( $post_id, get_current_user_id() );
		if ( ! $document ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$tree = $document->get_elements_data();
		$tree = is_array( $tree ) ? $tree : [];

		$node = [
			'id'         => \Elementor\Utils::generate_random_string(),
			'elType'     => $type_data['elType'],
			'settings'   => $input['element']['settings'] ?? [],
			'elements'   => [],
		];

		if ( ! empty( $type_data['widgetType'] ) ) {
			$node['widgetType'] = $type_data['widgetType'];
		}

		$new_tree = $this->get_mutator()->insert_at( $tree, $parent_id, $index, $node );
		if ( is_wp_error( $new_tree ) ) {
			return $new_tree;
		}

		$save_result = $this->save_to_draft( $document, $new_tree );
		if ( is_wp_error( $save_result ) ) {
			return $save_result;
		}

		$post = get_post( $post_id );

		return [
			'success'     => true,
			'post_id'     => $post_id,
			'element_id'  => $node['id'],
			'version'     => $post ? $post->post_modified_gmt : current_time( 'mysql', true ),
			'preview_url' => $document->get_preview_url(),
		];
	}

	/**
	 * @return array|\WP_Error  ['elType' => string, 'widgetType' => string|null]
	 */
	private function resolve_element_type( string $type ) {
		if ( empty( $type ) ) {
			return new \WP_Error(
				'elementor_unknown_type',
				__( 'element.type is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$widget = Plugin::$instance->widgets_manager->get_widget_types( $type );
		if ( $widget ) {
			return [
				'elType' => 'widget',
				'widgetType' => $type,
			];
		}

		$element = Plugin::$instance->elements_manager->get_element_types( $type );
		if ( $element ) {
			return [
				'elType' => $type,
				'widgetType' => null,
			];
		}

		return new \WP_Error(
			'elementor_unknown_type',
			/* translators: %s: element type key */
			sprintf( __( 'Unknown element type: %s.', 'elementor' ), $type ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	/**
	 * @return bool|\WP_Error
	 */
	private function save_to_draft( \Elementor\Core\Base\Document $document, array $elements ) {
		if ( 'publish' === get_post_status( $document->get_main_id() ) ) {
			wp_update_post( [
				'ID' => $document->get_main_id(),
				'post_status' => 'draft',
			] );
		}

		return $document->save( [ 'elements' => $elements ] );
	}
}
