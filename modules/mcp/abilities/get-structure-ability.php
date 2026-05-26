<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Services\Post_Context;

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
			__( 'Returns the Elementor element tree (widgets, containers, and nested content) for a single post or page ID. Use after list-pages when you need the live JSON structure to reason about layout, widget types, or to plan edits. Only works for posts that were saved with Elementor.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'elements' => [
						'type' => 'array',
						'description' => 'Root-level Elementor elements for the document.',
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

		$elements = $document->get_elements_data();

		return [
			'elements' => is_array( $elements ) ? $elements : [],
		];
	}
}
