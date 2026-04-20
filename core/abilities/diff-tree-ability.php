<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Compute a shallow-ish diff between a post's current elements tree and a proposed one.
 *
 * Returns three arrays keyed by element id: additions (present in new, absent in current),
 * removals (present in current, absent in new), and changes (present in both with a
 * different settings / styles / widgetType / elType / children-id-set). Intended to give
 * agents a safety check before blind-overwriting via set-post-content / build-page.
 */
class Diff_Tree_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/diff-tree';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Diff Tree',
			'description' => 'Computes additions, removals, and changes between a post\'s current elements tree and a proposed tree. Preview before overwrite.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'  => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to compare against.',
					],
					'elements' => [
						'type'        => 'array',
						'description' => 'Proposed Elementor elements tree.',
					],
				],
				'required'             => [ 'post_id', 'elements' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'   => [ 'type' => 'integer' ],
					'additions' => [
						'type'        => 'array',
						'description' => 'Elements present in the proposed tree but not in the current one. Each entry: { id, elType, widgetType }.',
					],
					'removals'  => [
						'type'        => 'array',
						'description' => 'Elements present in the current tree but not in the proposed one. Each entry: { id, elType, widgetType }.',
					],
					'changes'   => [
						'type'        => 'array',
						'description' => 'Elements present in both with differing settings / styles / widgetType / elType / children order. Each entry: { id, changed: string[] }.',
					],
					'unchanged_count' => [ 'type' => 'integer' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Use before calling set-post-content or build-page to preview the delta against the currently saved page.',
						'Each element is identified by its `id` field. Elements without an id are ignored (they cannot be matched across the two trees).',
						'changes[].changed lists which top-level fields differ: "settings", "styles", "widgetType", "elType", "children".',
						'Safe to call repeatedly — purely read-only comparison.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id = (int) $input['post_id'];
		$new     = $input['elements'];

		$document = Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$current = $document->get_elements_data();
		$current = is_array( $current ) ? $current : [];

		$current_index = [];
		$this->index_elements( $current, $current_index );

		$new_index = [];
		$this->index_elements( $new, $new_index );

		$additions = [];
		$removals  = [];
		$changes   = [];
		$unchanged = 0;

		foreach ( $new_index as $id => $el ) {
			if ( ! isset( $current_index[ $id ] ) ) {
				$additions[] = [
					'id'         => $id,
					'elType'     => $el['elType'] ?? null,
					'widgetType' => $el['widgetType'] ?? null,
				];
				continue;
			}

			$diffs = $this->compare_element( $current_index[ $id ], $el );
			if ( empty( $diffs ) ) {
				++$unchanged;
			} else {
				$changes[] = [
					'id'      => $id,
					'changed' => $diffs,
				];
			}
		}

		foreach ( $current_index as $id => $el ) {
			if ( ! isset( $new_index[ $id ] ) ) {
				$removals[] = [
					'id'         => $id,
					'elType'     => $el['elType'] ?? null,
					'widgetType' => $el['widgetType'] ?? null,
				];
			}
		}

		return [
			'post_id'         => $post_id,
			'additions'       => $additions,
			'removals'        => $removals,
			'changes'         => $changes,
			'unchanged_count' => $unchanged,
		];
	}

	private function index_elements( array $elements, array &$index ): void {
		foreach ( $elements as $el ) {
			if ( isset( $el['id'] ) && is_string( $el['id'] ) ) {
				$index[ $el['id'] ] = $el;
			}
			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->index_elements( $el['elements'], $index );
			}
		}
	}

	private function compare_element( array $a, array $b ): array {
		$diffs = [];

		if ( ( $a['elType'] ?? null ) !== ( $b['elType'] ?? null ) ) {
			$diffs[] = 'elType';
		}
		if ( ( $a['widgetType'] ?? null ) !== ( $b['widgetType'] ?? null ) ) {
			$diffs[] = 'widgetType';
		}
		if ( ! $this->deep_equal( $a['settings'] ?? [], $b['settings'] ?? [] ) ) {
			$diffs[] = 'settings';
		}
		if ( ! $this->deep_equal( $a['styles'] ?? [], $b['styles'] ?? [] ) ) {
			$diffs[] = 'styles';
		}

		$a_children = array_values( array_map( static fn( $c ) => $c['id'] ?? null, $a['elements'] ?? [] ) );
		$b_children = array_values( array_map( static fn( $c ) => $c['id'] ?? null, $b['elements'] ?? [] ) );
		if ( $a_children !== $b_children ) {
			$diffs[] = 'children';
		}

		return $diffs;
	}

	/**
	 * Value-equality for associative arrays. `===` on arrays also requires
	 * the same key ORDER, which is too strict for settings/styles trees that
	 * may be reconstructed in a different insertion order.
	 */
	private function deep_equal( $a, $b ): bool {
		if ( is_array( $a ) && is_array( $b ) ) {
			if ( count( $a ) !== count( $b ) ) {
				return false;
			}
			foreach ( $a as $k => $v ) {
				if ( ! array_key_exists( $k, $b ) ) {
					return false;
				}
				if ( ! $this->deep_equal( $v, $b[ $k ] ) ) {
					return false;
				}
			}
			return true;
		}
		return $a === $b;
	}
}
