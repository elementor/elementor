<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Document_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Render_Page_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/render-page';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Render Elementor Page', 'elementor' ),
			__( 'Returns server-rendered HTML and plain text for a document or element subtree. Use after mutating tools to verify the visual result with MCP credentials instead of opening preview_url in a browser.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'post_id', 'html', 'text' ],
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'element_id' => [ 'type' => [ 'string', 'null' ] ],
					'html' => [ 'type' => 'string' ],
					'text' => [ 'type' => 'string' ],
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
				'required' => [ 'post_id' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'element_id' => [
						'type' => 'string',
						'description' => 'Optional element id to render only that subtree.',
					],
					'text_limit' => [
						'type' => 'integer',
						'description' => 'Optional maximum length of the returned plain-text excerpt.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'A valid post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$element_id = isset( $input['element_id'] ) && is_string( $input['element_id'] ) && '' !== $input['element_id']
			? $input['element_id']
			: null;
		$text_limit = isset( $input['text_limit'] ) ? absint( $input['text_limit'] ) : null;
		$text_limit = $text_limit > 0 ? $text_limit : null;

		return ( new Document_Renderer() )->render( $post_id, $element_id, $text_limit );
	}
}
