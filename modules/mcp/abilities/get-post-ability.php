<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Services\Post_Context;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Post_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-post';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor Post', 'elementor' ),
			__( 'Returns one Elementor v4 post as a full round-trippable envelope. The shape matches the input that elementor/manage-post accepts on update/replace_content, so an agent can read → modify → write without inventing field names. Pass include_elements:false for metadata-only reads; pass include_settings:true to also return the document-settings blob.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'title' => [ 'type' => 'string' ],
					'post_type' => [ 'type' => 'string' ],
					'post_status' => [ 'type' => 'string' ],
					'slug' => [ 'type' => 'string' ],
					'post_template' => [ 'type' => 'string' ],
					'edit_url' => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
					'elements' => [
						'type' => 'array',
						'description' => 'Raw v4 element tree. Present when include_elements is true (default).',
					],
					'settings' => [
						'type' => 'object',
						'description' => 'Document settings blob. Present only when include_settings is true.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'show_in_rest' => true,
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
					'include_elements' => [
						'type' => 'boolean',
						'description' => 'When true (default), include the raw v4 element tree. Set false for metadata-only reads.',
					],
					'include_settings' => [
						'type' => 'boolean',
						'description' => 'When true, include the document-settings blob (page layout, custom CSS, hide_title, etc.). Default false.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$document = Post_Context::get_editable_document( $input );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$post_id = $document->get_main_id();

		$envelope = Post_Response::envelope( 'get', $post_id, [
			'title' => get_the_title( $post_id ),
			'post_status' => (string) get_post_status( $post_id ),
			'slug' => (string) get_post_field( 'post_name', $post_id ),
			'post_template' => (string) get_post_meta( $post_id, '_wp_page_template', true ),
		] );

		if ( ! isset( $input['include_elements'] ) || ! empty( $input['include_elements'] ) ) {
			$elements = $document->get_elements_data();
			$envelope['elements'] = is_array( $elements ) ? $elements : [];
		}

		if ( ! empty( $input['include_settings'] ) ) {
			$settings = get_post_meta( $post_id, '_elementor_page_settings', true );
			$envelope['settings'] = is_array( $settings ) ? $settings : [];
		}

		return $envelope;
	}
}
