<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Force-clears Elementor's atomic-styles cache (both the logical invalidation tree
 * and the compiled CSS files). Use when agents suspect stale breakpoint CSS after
 * adding new variants — the normal after-save invalidation only walks paths that
 * were already in the cache tree, so brand-new breakpoint handles may not be
 * re-rendered until the next explicit flush.
 */
class Force_Clear_Styles_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/force-clear-styles';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Force Clear Styles',
			'description' => 'Force-clears Elementor v4 atomic style caches and the compiled CSS files. Optional: scope to a single post.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'Optional. Clear atomic styles for this post only. Omit to clear all atomic styles globally.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'cleared' => [ 'type' => 'boolean' ],
					'scope'   => [ 'type' => 'string' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Fires the `elementor/atomic-widgets/styles/clear` action at the requested path to force a fresh CSS render.',
						'Also clears the global files_manager cache so any stale desktop-only handles are removed when new breakpoint variants are added.',
						'Pass post_id to scope the clear to [local, <post_id>]; omit to clear [local] (all posts).',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		if ( $post_id > 0 ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ 'local', $post_id ] );
			$scope = "local/$post_id";
		} else {
			do_action( 'elementor/atomic-widgets/styles/clear', [ 'local' ] );
			$scope = 'local';
		}

		try {
			Plugin::$instance->files_manager->clear_cache();
		} catch ( \Throwable $e ) {
			unset( $e );
		}

		return [
			'cleared' => true,
			'scope'   => $scope,
		];
	}
}
