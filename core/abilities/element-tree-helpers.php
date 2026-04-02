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
	 * Walk the element tree and replace any class label strings with their full IDs.
	 * Values that already start with "e-gc-" are treated as IDs and left untouched.
	 *
	 * @param array $elements    Element tree (modified in-place).
	 * @param array $label_to_id Map of label → class ID.
	 * @throws \InvalidArgumentException When a label cannot be resolved.
	 */
	private function resolve_class_labels( array &$elements, array $label_to_id ): void {
		foreach ( $elements as &$element ) {
			if ( isset( $element['settings'] ) && is_array( $element['settings'] ) ) {
				$this->resolve_class_labels_in_settings( $element['settings'], $label_to_id );
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->resolve_class_labels( $element['elements'], $label_to_id );
			}
		}
		unset( $element );
	}

	/**
	 * Recursively walk a settings object, resolving labels inside $$type:"classes" nodes.
	 */
	private function resolve_class_labels_in_settings( array &$settings, array $label_to_id ): void {
		if ( isset( $settings['$$type'] ) && 'classes' === $settings['$$type'] && isset( $settings['value'] ) && is_array( $settings['value'] ) ) {
			foreach ( $settings['value'] as &$val ) {
				if ( is_string( $val ) && ! str_starts_with( $val, 'e-gc-' ) ) {
					if ( ! isset( $label_to_id[ $val ] ) ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
						throw new \InvalidArgumentException( "Class label \"$val\" not found — create it first with set-global-classes or check the label spelling." );
					}
					$val = $label_to_id[ $val ];
				}
			}
			unset( $val );
			return;
		}

		foreach ( $settings as &$value ) {
			if ( is_array( $value ) ) {
				$this->resolve_class_labels_in_settings( $value, $label_to_id );
			}
		}
		unset( $value );
	}

	/**
	 * Walk the element tree and throw on invalid class IDs or single-dollar $type keys.
	 *
	 * @param array $elements  Element tree.
	 * @param array $known_ids All valid global class IDs.
	 * @throws \InvalidArgumentException On the first violation found.
	 */
	private function validate_elements( array $elements, array $known_ids ): void {
		foreach ( $elements as $element ) {
			if ( isset( $element['settings'] ) && is_array( $element['settings'] ) ) {
				$this->validate_settings( $element['settings'], $known_ids );
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->validate_elements( $element['elements'], $known_ids );
			}
		}
	}

	/**
	 * Recursively validate a settings object.
	 *
	 * @throws \InvalidArgumentException On the first violation found.
	 */
	private function validate_settings( array $settings, array $known_ids ): void {
		foreach ( $settings as $key => $value ) {
			if ( '$type' === $key ) {
				throw new \InvalidArgumentException( 'Found $type key in element settings — use $$type (double dollar sign). Example: {"$$type":"classes","value":["e-gc-..."]}.' );
			}

			if ( '$$type' === $key && 'classes' === $value && isset( $settings['value'] ) && is_array( $settings['value'] ) ) {
				foreach ( $settings['value'] as $class_id ) {
					if ( ! is_string( $class_id ) ) {
						continue;
					}

					if ( preg_match( '/^e-gc-[0-9a-f]{8}$/', $class_id ) ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
						throw new \InvalidArgumentException( "Class ID \"$class_id\" appears truncated — use the full UUID returned by set-global-classes (e.g. e-gc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)." );
					}

					if ( ! in_array( $class_id, $known_ids, true ) ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
						throw new \InvalidArgumentException( "Unknown class ID \"$class_id\" — verify against set-global-classes results or call elementor/context to list available classes." );
					}
				}
			}

			if ( is_array( $value ) ) {
				$this->validate_settings( $value, $known_ids );
			}
		}
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
