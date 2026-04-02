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
	 * Collect all local style IDs (keys of each element's 'styles' map) from the tree.
	 * These are element-scoped IDs (e.g. "e-dh-s-a101e0c") that are valid references
	 * but are not registered in the global classes store.
	 *
	 * @param array $elements The element tree.
	 * @param array $ids      Accumulator array (modified in-place).
	 */
	private function collect_local_style_ids( array $elements, array &$ids ): void {
		foreach ( $elements as $el ) {
			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				array_push( $ids, ...array_keys( $el['styles'] ) );
			}
			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->collect_local_style_ids( $el['elements'], $ids );
			}
		}
	}

	/**
	 * Recursively walk a settings object, resolving labels inside $$type:"classes" nodes.
	 */
	private function resolve_class_labels_in_settings( array &$settings, array $label_to_id ): void {
		if ( isset( $settings['$$type'] ) && 'classes' === $settings['$$type'] && isset( $settings['value'] ) && is_array( $settings['value'] ) ) {
			foreach ( $settings['value'] as &$val ) {
				// Skip any ID that already looks like an Elementor-generated ID (e-gc-*, e-dh-*, etc.)
				// Only strings that do not start with "e-" are treated as human-readable labels.
				if ( is_string( $val ) && ! str_starts_with( $val, 'e-' ) ) {
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
	 * Walk the element tree and validate class IDs and $$type usage.
	 *
	 * When $errors is null (default), throws on the first violation.
	 * When $errors is an array reference, all violations are collected and no exception is thrown.
	 *
	 * @param array      $elements  Element tree.
	 * @param array      $known_ids All valid global class IDs.
	 * @param array|null $errors    When provided, violations are appended here instead of thrown.
	 * @throws \InvalidArgumentException On the first violation when $errors is null.
	 */
	private function validate_elements( array $elements, array $known_ids, ?array &$errors = null ): void {
		foreach ( $elements as $element ) {
			if ( isset( $element['settings'] ) && is_array( $element['settings'] ) ) {
				$this->validate_settings( $element['settings'], $known_ids, $errors );
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->validate_elements( $element['elements'], $known_ids, $errors );
			}
		}
	}

	/**
	 * Recursively validate a settings object.
	 *
	 * When $errors is null (default), throws on the first violation.
	 * When $errors is an array reference, all violations are appended and execution continues.
	 *
	 * @throws \InvalidArgumentException On the first violation when $errors is null.
	 */
	private function validate_settings( array $settings, array $known_ids, ?array &$errors = null ): void {
		foreach ( $settings as $key => $value ) {
			if ( '$type' === $key ) {
				$msg = 'Found $type key in element settings — use $$type (double dollar sign). Example: {"$$type":"classes","value":["e-gc-..."]}.';
				if ( null === $errors ) {
					// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
					throw new \InvalidArgumentException( $msg );
				}
				$errors[] = $msg;
			}

			if ( '$$type' === $key && 'classes' === $value && isset( $settings['value'] ) && is_array( $settings['value'] ) ) {
				foreach ( $settings['value'] as $class_id ) {
					if ( ! is_string( $class_id ) ) {
						continue;
					}

					if ( preg_match( '/^e-gc-[0-9a-f]{8}$/', $class_id ) ) {
						$msg = "Class ID \"$class_id\" appears truncated — use the full UUID returned by set-global-classes (e.g. e-gc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).";
						if ( null === $errors ) {
							// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
							throw new \InvalidArgumentException( $msg );
						}
						$errors[] = $msg;
						continue;
					}

					// Local element-scoped style IDs (e.g. "e-dh-s-a101e0c") start with "e-"
					// but are not global classes — skip validation for them.
					// NOTE: this guard lives in the ability layer; the authoritative check for
					// what constitutes a local ID is in collect_local_style_ids().
					if ( str_starts_with( $class_id, 'e-' ) && ! str_starts_with( $class_id, 'e-gc-' ) ) {
						continue;
					}

					if ( ! in_array( $class_id, $known_ids, true ) ) {
						$msg = "Unknown class ID \"$class_id\" — verify against set-global-classes results or call elementor/context to list available classes.";
						if ( null === $errors ) {
							// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
							throw new \InvalidArgumentException( $msg );
						}
						$errors[] = $msg;
					}
				}
			}

			if ( is_array( $value ) ) {
				$this->validate_settings( $value, $known_ids, $errors );
			}
		}
	}

	/**
	 * Recursively search the element tree for an element by its ID.
	 *
	 * @param array  $elements   Element tree to search.
	 * @param string $element_id Target element ID.
	 * @return array|null The matching element node, or null if not found.
	 */
	private function find_element( array $elements, string $element_id ): ?array {
		foreach ( $elements as $el ) {
			if ( isset( $el['id'] ) && $el['id'] === $element_id ) {
				return $el;
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$found = $this->find_element( $el['elements'], $element_id );
				if ( null !== $found ) {
					return $found;
				}
			}
		}

		return null;
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
