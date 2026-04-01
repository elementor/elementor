<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Element_Tree_Helpers {

	/**
	 * Recursively walk $elements looking for an element whose 'id' matches
	 * $parent_id, then append $new_element to its 'elements' children.
	 *
	 * @param array  $elements    The elements array (modified in-place via reference).
	 * @param string $parent_id   Target parent ID.
	 * @param array  $new_element Element to append.
	 * @return bool True if the parent was found and the element was appended.
	 */
	private function append_to_parent( array &$elements, string $parent_id, array $new_element ): bool {
		foreach ( $elements as &$el ) {
			if ( isset( $el['id'] ) && $el['id'] === $parent_id ) {
				$el['elements']   = $el['elements'] ?? [];
				$el['elements'][] = $new_element;
				return true;
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				if ( $this->append_to_parent( $el['elements'], $parent_id, $new_element ) ) {
					return true;
				}
			}
		}
		unset( $el );

		return false;
	}

	/**
	 * Recursively walk $elements to find the target element and apply the patch.
	 *
	 * @param array       $elements   Elements array (modified in-place via reference).
	 * @param string      $element_id Target element ID.
	 * @param array|null  $settings   Settings keys to merge (shallow). Null = no change.
	 * @param array|null  $styles     Style entries to merge by style ID. Null = no change.
	 * @return bool True if the element was found and patched.
	 */
	private function patch_element( array &$elements, string $element_id, ?array $settings, ?array $styles ): bool {
		foreach ( $elements as &$el ) {
			if ( isset( $el['id'] ) && $el['id'] === $element_id ) {
				if ( null !== $settings ) {
					$el['settings'] = array_merge( $el['settings'] ?? [], $settings );
				}

				if ( null !== $styles ) {
					$el['styles'] = array_merge( $el['styles'] ?? [], $styles );
				}

				return true;
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				if ( $this->patch_element( $el['elements'], $element_id, $settings, $styles ) ) {
					return true;
				}
			}
		}
		unset( $el );

		return false;
	}
}
