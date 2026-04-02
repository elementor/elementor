<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Element_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/update-element';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Update Element',
			'description' => 'Patches settings and/or styles on a single element by ID without fetching the full document tree. Complements append-element for the parallel append-then-update pattern.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID.',
					],
					'element_id' => [
						'type'        => 'string',
						'description' => 'The id of the element to update.',
					],
					'settings' => [
						'type'        => 'object',
						'description' => 'Partial settings patch. Keys are merged into the element\'s existing settings (shallow merge). Omit keys you do not want to change.',
					],
					'styles' => [
						'type'        => 'object',
						'description' => 'Partial styles patch. Style entries are merged by key into the element\'s existing styles object. Omit to leave styles unchanged.',
					],
				],
				'required'             => [ 'post_id', 'element_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'    => [ 'type' => 'integer' ],
					'element_id' => [ 'type' => 'string' ],
					'success'    => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Patches settings and/or styles on one element without a full document round-trip.',
						'Parallel pattern: append-element with a placeholder → set-global-classes in parallel → update-element to apply the resolved class ID.',
						'settings: shallow-merged into existing element settings. Only send keys you want to change.',
						'styles: merged by style ID into existing element styles. Send the full style entry for each ID you want to set.',
						'Returns success:false (does not throw) if element_id is not found in the tree.',
						'At least one of settings or styles must be provided.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id    = (int) $input['post_id'];
		$element_id = $input['element_id'];
		$settings   = $input['settings'] ?? null;
		$styles     = $input['styles'] ?? null;

		if ( null === $settings && null === $styles ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( 'At least one of "settings" or "styles" must be provided.' );
		}

		// Bust the WP object cache so get_elements_data reads from DB, not a stale cache.
		// Required when post meta was written outside Elementor's document layer (e.g. raw
		// update_post_meta), which can leave a double-unslashed value in the object cache
		// that json_decode then cannot parse, silently returning an empty tree.
		wp_cache_delete( $post_id, 'post_meta' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];
		$found    = $this->patch_element( $elements, $element_id, $settings, $styles );

		if ( ! $found ) {
			return [
				'post_id'    => $post_id,
				'element_id' => $element_id,
				'success'    => false,
			];
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id'    => $post_id,
			'element_id' => $element_id,
			'success'    => (bool) $saved,
		];
	}

}
