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
					'regenerate' => [
						'type'        => 'boolean',
						'description' => 'When true (and post_id is provided), fires a server-side frontend request to regenerate the compiled CSS immediately after clearing, so the next real browser load sees fresh files. Default: false.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'cleared'      => [ 'type' => 'boolean' ],
					'scope'        => [ 'type' => 'string' ],
					'regenerated'  => [
						'type'        => 'boolean',
						'description' => 'True when regenerate:true was requested and the internal request succeeded (HTTP 200). False when regenerate was not requested or failed.',
					],
					'regen_error'  => [
						'type'        => 'string',
						'description' => 'Error message when regenerate:true was requested but the internal request failed.',
					],
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
						'Pass regenerate:true (with post_id) to also trigger an internal server-side GET request to the post permalink — this causes Elementor to re-render and write the atomic CSS files in the same call, so you do not need a separate browser visit.',
						'regenerated:true in the response confirms the internal request returned HTTP 200. regenerated:false means either regenerate was not requested or the request failed (check regen_error).',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id    = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$regenerate = ! empty( $input['regenerate'] ) && $post_id > 0;

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

		$regenerated = false;
		$regen_error = null;

		if ( $regenerate ) {
			$permalink = get_permalink( $post_id );
			if ( $permalink ) {
				$response = wp_remote_get(
					$permalink,
					[
						'timeout'  => 20,
						'blocking' => true,
						'headers'  => [ 'X-WP-Nonce' => wp_create_nonce( 'wp_rest' ) ],
					]
				);

				if ( is_wp_error( $response ) ) {
					$regen_error = $response->get_error_message();
				} elseif ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
					$regen_error = 'HTTP ' . wp_remote_retrieve_response_code( $response );
				} else {
					$regenerated = true;
				}
			} else {
				$regen_error = "Could not resolve permalink for post $post_id.";
			}
		}

		$result = [
			'cleared'     => true,
			'scope'       => $scope,
			'regenerated' => $regenerated,
		];

		if ( null !== $regen_error ) {
			$result['regen_error'] = $regen_error;
		}

		return $result;
	}
}
