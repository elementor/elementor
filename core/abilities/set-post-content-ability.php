<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Post_Content_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/set-post-content';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Set Post Content',
			'description' => 'Writes the Elementor elements tree to a post. Handles wp_slash, cache clearing, and CSS regeneration automatically.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to update.',
					],
					'elements' => [
						'type'        => 'array',
						'description' => 'Full Elementor elements tree to save. Must be the complete top-level array (not a diff).',
					],
				],
				'required'             => [ 'post_id', 'elements' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'success' => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Saves a full Elementor elements tree to a post.',
						'Always pass the complete elements array — this is a full replacement, not a merge.',
						'Use elementor/get-post-content first to read current content, then modify and pass back.',
						'wp_slash, JSON encoding, CSS cache clearing, and post plain-text regeneration are handled internally.',
						'Each element requires at minimum: id (unique string), elType (e.g. "widget"), settings (object).',
						'For atomic (v4) widgets also include: widgetType, styles (keyed by style ID).',
					] ),
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id  = (int) $input['post_id'];
		$elements = $input['elements'];

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id' => $post_id,
			'success' => (bool) $saved,
		];
	}
}
