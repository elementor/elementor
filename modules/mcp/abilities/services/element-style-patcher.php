<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Merges converted CSS props into an element's local-style variant — preserving
 * sibling props that the patch did not touch.
 *
 * `Element_Css_Transformer::transform_element_with_css` deliberately OVERWRITES
 * the local-style entry on each pass — fine for first-write paths (`create` /
 * `replace_content` / `append_content`) but wrong for surgical patches. This
 * service is used by `Element_Mutation_Operation` to merge a per-prop change
 * without losing sibling props on the same variant.
 *
 * Variant targeted: `{ breakpoint: 'desktop', state: null }` (the only variant
 * the manage-post ability writes to currently).
 *
 * Custom CSS handling: the new `custom_css` from the converter REPLACES the
 * existing variant's `custom_css`. Concatenation would double-apply on re-send
 * of the same declaration.
 */
class Element_Style_Patcher {

	/**
	 * Merge a single CSS declaration string into the element's local-style variant.
	 *
	 * Mutates `$node` in place. Returns the structured unconverted-declarations entry
	 * (shape matches `Element_Css_Transformer::get_unconverted_css()`) so the caller
	 * can build a response envelope — or an empty array if everything converted.
	 *
	 * @return array<int, array{element_id: string, declarations: array}> One entry per element with
	 *                                                                    unconverted declarations,
	 *                                                                    or `[]` if all converted.
	 */
	public static function merge_into_local( array &$node, string $css ): array {
		$id = isset( $node['id'] ) && is_string( $node['id'] ) && '' !== $node['id'] ? $node['id'] : '';
		if ( '' === $id ) {
			return [];
		}

		$converted = Element_Css_Transformer::convert_node_css( $css );

		$new_props = is_array( $converted['props'] ?? null ) ? $converted['props'] : [];
		$new_custom = $converted['custom_css'] ?? '';
		$unconverted = is_array( $converted['unconverted'] ?? null ) ? $converted['unconverted'] : [];

		$style_id = 'e-' . $id . '-s';

		$styles = isset( $node['styles'] ) && is_array( $node['styles'] ) ? $node['styles'] : [];

		$styles[ $style_id ] = self::merge_into_style_entry(
			$styles[ $style_id ] ?? null,
			$style_id,
			$new_props,
			$new_custom
		);

		$node['styles'] = $styles;

		self::ensure_class_present( $node, $style_id );

		if ( ! empty( $unconverted ) ) {
			return [
				[
					'element_id' => $id,
					'declarations' => $unconverted,
				],
			];
		}

		return [];
	}

	private static function merge_into_style_entry( $existing_entry, string $style_id, array $new_props, string $new_custom ): array {
		if ( ! is_array( $existing_entry ) || ! isset( $existing_entry['variants'] ) || ! is_array( $existing_entry['variants'] ) ) {
			return [
				'id' => $style_id,
				'type' => 'class',
				'label' => 'local',
				'variants' => [ self::build_variant( $new_props, $new_custom ) ],
			];
		}

		$entry = $existing_entry;
		$entry['id'] = $style_id;
		$entry['type'] = $entry['type'] ?? 'class';
		$entry['label'] = $entry['label'] ?? 'local';

		$variant_index = self::find_desktop_variant_index( $entry['variants'] );

		if ( null === $variant_index ) {
			$entry['variants'][] = self::build_variant( $new_props, $new_custom );
			return $entry;
		}

		$variant = $entry['variants'][ $variant_index ];
		$existing_props = isset( $variant['props'] ) && is_array( $variant['props'] ) ? $variant['props'] : [];
		$variant['props'] = array_merge( $existing_props, $new_props );

		if ( '' !== $new_custom ) {
			$variant['custom_css'] = [ 'raw' => $new_custom ];
		}

		$entry['variants'][ $variant_index ] = $variant;

		return $entry;
	}

	private static function find_desktop_variant_index( array $variants ): ?int {
		foreach ( $variants as $i => $variant ) {
			$meta = is_array( $variant['meta'] ?? null ) ? $variant['meta'] : [];
			$breakpoint = $meta['breakpoint'] ?? null;
			$state = $meta['state'] ?? null;

			if ( 'desktop' === $breakpoint && null === $state ) {
				return (int) $i;
			}
		}

		return null;
	}

	private static function build_variant( array $props, string $custom ): array {
		$variant = [
			'meta' => [
				'breakpoint' => 'desktop',
				'state' => null,
			],
			'props' => $props,
		];

		if ( '' !== $custom ) {
			$variant['custom_css'] = [ 'raw' => $custom ];
		}

		return $variant;
	}

	private static function ensure_class_present( array &$node, string $style_id ): void {
		if ( ! isset( $node['settings'] ) || ! is_array( $node['settings'] ) ) {
			$node['settings'] = [];
		}

		$classes = isset( $node['settings']['classes']['value'] ) && is_array( $node['settings']['classes']['value'] )
			? array_values( array_filter( $node['settings']['classes']['value'], 'is_string' ) )
			: [];

		if ( ! in_array( $style_id, $classes, true ) ) {
			array_unshift( $classes, $style_id );
		}

		$node['settings']['classes'] = [
			'$$type' => 'classes',
			'value' => array_values( array_unique( $classes ) ),
		];
	}
}
