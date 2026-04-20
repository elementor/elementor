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
	 *
	 * @throws \InvalidArgumentException When a label cannot be resolved.
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
	 * Walk the element tree and fill in two style fields that Style_Parser requires
	 * but agents routinely omit:
	 *   - style.id: when missing, set to the styles-map key.
	 *   - meta.breakpoint: when null/missing, set to "desktop" (the base breakpoint).
	 *
	 * Both are required by Style_Parser; without them the save throws a generic
	 * "missing_or_invalid" error that's hard to act on. Normalizing here keeps the
	 * happy path one round-trip.
	 *
	 * @param array $elements Element tree (modified in-place).
	 */
	private function normalize_element_styles( array &$elements ): void {
		foreach ( $elements as &$el ) {
			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				foreach ( $el['styles'] as $style_key => &$style ) {
					if ( ! is_array( $style ) ) {
						continue;
					}

					if ( ! isset( $style['id'] ) || ! is_string( $style['id'] ) || '' === $style['id'] ) {
						$style['id'] = (string) $style_key;
					}

					if ( ! isset( $style['label'] ) || ! is_string( $style['label'] ) || strlen( $style['label'] ) < 2 ) {
						$style['label'] = (string) $style_key;
					}

					if ( ! isset( $style['type'] ) || ! is_string( $style['type'] ) || '' === $style['type'] ) {
						$style['type'] = 'class';
					}

					if ( empty( $style['variants'] ) || ! is_array( $style['variants'] ) ) {
						continue;
					}

					foreach ( $style['variants'] as &$variant ) {
						if ( ! isset( $variant['meta'] ) || ! is_array( $variant['meta'] ) ) {
							$variant['meta'] = [];
						}
						if ( ! isset( $variant['meta']['breakpoint'] ) || ! is_string( $variant['meta']['breakpoint'] ) || '' === $variant['meta']['breakpoint'] ) {
							$variant['meta']['breakpoint'] = 'desktop';
						}
						if ( ! array_key_exists( 'state', $variant['meta'] ) ) {
							$variant['meta']['state'] = null;
						}
					}
					unset( $variant );
				}
				unset( $style );
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->normalize_element_styles( $el['elements'] );
			}
		}
		unset( $el );
	}

	/**
	 * Walk the element tree and make sure every local style key is also listed in
	 * the element's settings.classes.value. Defining `element.styles["e-jc-hero"]`
	 * alone has no effect unless the ID also appears in `settings.classes.value`.
	 *
	 * Silent failure was the #1 footgun reported by agents building pages.
	 *
	 * @param array $elements Element tree (modified in-place).
	 */
	private function auto_mirror_style_keys_into_classes( array &$elements ): void {
		foreach ( $elements as &$el ) {
			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				$style_keys = array_values( array_filter( array_keys( $el['styles'] ), 'is_string' ) );
				if ( ! empty( $style_keys ) ) {
					if ( ! isset( $el['settings'] ) || ! is_array( $el['settings'] ) ) {
						$el['settings'] = [];
					}

					$classes = $el['settings']['classes'] ?? null;
					if ( ! is_array( $classes ) || ( $classes['$$type'] ?? '' ) !== 'classes' || ! isset( $classes['value'] ) || ! is_array( $classes['value'] ) ) {
						$classes = [
							'$$type' => 'classes',
							'value'  => [],
						];
					}

					foreach ( $style_keys as $style_key ) {
						if ( ! in_array( $style_key, $classes['value'], true ) ) {
							$classes['value'][] = $style_key;
						}
					}

					$el['settings']['classes'] = $classes;
				}
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->auto_mirror_style_keys_into_classes( $el['elements'] );
			}
		}
		unset( $el );
	}

	/**
	 * Walk the element tree and collect warnings for style keys that are NOT listed
	 * in the element's settings.classes.value. Used by validate-elements to surface
	 * the silent failure without mutating caller-supplied input.
	 *
	 * @param array    $elements Element tree.
	 * @param string[] $warnings Accumulator (modified in-place).
	 */
	private function detect_orphan_style_keys( array $elements, array &$warnings ): void {
		foreach ( $elements as $el ) {
			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				$classes_value = [];
				$classes       = $el['settings']['classes'] ?? null;
				if ( is_array( $classes ) && ( $classes['$$type'] ?? '' ) === 'classes' && isset( $classes['value'] ) && is_array( $classes['value'] ) ) {
					$classes_value = array_values( array_filter( $classes['value'], 'is_string' ) );
				}

				foreach ( array_keys( $el['styles'] ) as $style_key ) {
					if ( ! is_string( $style_key ) ) {
						continue;
					}
					if ( ! in_array( $style_key, $classes_value, true ) ) {
						$el_id      = $el['id'] ?? '(unknown)';
						$warnings[] = "Element \"$el_id\" defines style \"$style_key\" but it is not listed in settings.classes.value — the style will render no CSS. build-page auto-mirrors this by default; if this is intentional, remove the style entry.";
					}
				}
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->detect_orphan_style_keys( $el['elements'], $warnings );
			}
		}
	}

	/**
	 * Walk the element tree and coerce common style prop mistakes to their correct format.
	 *
	 * Coercions applied:
	 * - flex: {"$$type":"string","value":"<number>"} → {"$$type":"flex","value":{"flexGrow":{"$$type":"number","value":<n>}}}
	 * - text-align: value "left" → "start", "right" → "end" (CSS logical values)
	 *
	 * @param array $elements Element tree (modified in-place).
	 */
	private function coerce_style_props( array &$elements ): void {
		foreach ( $elements as &$el ) {
			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				foreach ( $el['styles'] as &$style ) {
					if ( empty( $style['variants'] ) || ! is_array( $style['variants'] ) ) {
						continue;
					}
					foreach ( $style['variants'] as &$variant ) {
						if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
							continue;
						}
						$this->coerce_props( $variant['props'] );
					}
					unset( $variant );
				}
				unset( $style );
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->coerce_style_props( $el['elements'] );
			}
		}
		unset( $el );
	}

	/**
	 * Apply coercions to a single props array in-place.
	 *
	 * @param array $props Props array (modified in-place).
	 */
	private function coerce_props( array &$props ): void {
		// Coerce flex: {"$$type":"string","value":"<number>"} → correct flex object.
		if (
			isset( $props['flex'] ) &&
			is_array( $props['flex'] ) &&
			( $props['flex']['$$type'] ?? '' ) === 'string' &&
			isset( $props['flex']['value'] ) &&
			is_numeric( $props['flex']['value'] )
		) {
			$props['flex'] = [
				'$$type' => 'flex',
				'value'  => [
					'flexGrow' => [
						'$$type' => 'number',
						'value'  => (float) $props['flex']['value'],
					],
				],
			];
		}

		// Coerce text-align: "left" → "start", "right" → "end".
		if (
			isset( $props['text-align'] ) &&
			is_array( $props['text-align'] ) &&
			( $props['text-align']['$$type'] ?? '' ) === 'string' &&
			isset( $props['text-align']['value'] )
		) {
			$map = [
				'left' => 'start',
				'right' => 'end',
			];
			if ( isset( $map[ $props['text-align']['value'] ] ) ) {
				$props['text-align']['value'] = $map[ $props['text-align']['value'] ];
			}
		}

		// Coerce opacity: the schema is Union<size|global-size-variable>, so raw numbers
		// and number-wrapped values both fail validation. Canonical form is
		// {$$type:"size",value:{size:<n>,unit:"custom"}} — "custom" is the only unit that
		// accepts a unitless ratio (see size-prop-type.php validate_value).
		if ( array_key_exists( 'opacity', $props ) ) {
			$raw = null;
			if ( is_numeric( $props['opacity'] ) ) {
				$raw = (float) $props['opacity'];
			} elseif (
				is_array( $props['opacity'] ) &&
				( $props['opacity']['$$type'] ?? '' ) === 'number' &&
				isset( $props['opacity']['value'] ) &&
				is_numeric( $props['opacity']['value'] )
			) {
				$raw = (float) $props['opacity']['value'];
			}
			if ( null !== $raw ) {
				$props['opacity'] = [
					'$$type' => 'size',
					'value'  => [
						'size' => $raw,
						'unit' => 'custom',
					],
				];
			}
		}
	}

	/**
	 * Walk the element tree and validate all inline element styles against Style_Schema.
	 *
	 * Returns an array of error strings. An empty array means all styles are valid.
	 *
	 * @param array $elements Element tree.
	 * @return string[] Validation error messages.
	 */
	private function validate_element_styles( array $elements ): array {
		$errors = [];
		$parser = \Elementor\Modules\AtomicWidgets\Parsers\Style_Parser::make(
			\Elementor\Modules\AtomicWidgets\Styles\Style_Schema::get()
		);
		$this->collect_style_errors( $elements, $parser, $errors );
		return $errors;
	}

	/**
	 * Recursively collect style validation errors from the element tree.
	 *
	 * Style_Parser only emits the top-level prop key (e.g. "variants[0].background: invalid_value"),
	 * which is useless when the actual fault lives 5 levels deep inside a background-image-overlay.
	 * For each top-level error we walk the prop-type tree in parallel with the supplied value and
	 * append path-aware reasons (e.g. "variants[0].background.background-overlay[0].image.size:
	 * value not in enum [thumbnail, ..., full]. Got: \"cover\"").
	 *
	 * @param array    $elements Element tree.
	 * @param object   $parser   Style_Parser instance (reused across recursion).
	 * @param string[] $errors   Accumulator (modified in-place).
	 */
	private function collect_style_errors( array $elements, object $parser, array &$errors ): void {
		foreach ( $elements as $el ) {
			$el_id = $el['id'] ?? '(unknown)';

			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				foreach ( $el['styles'] as $style_id => $style ) {
					$result = $parser->parse( $style );
					if ( ! $result->is_valid() ) {
						foreach ( $result->errors()->all() as $error_entry ) {
							$error_key    = $error_entry['key'] ?? '';
							$error_reason = $error_entry['error'] ?? '';
							$prefix       = "Element \"$el_id\" style \"$style_id\": $error_key: $error_reason";
							$deep         = $this->expand_style_error( $style, $error_key );
							if ( empty( $deep ) ) {
								$errors[] = $prefix;
								continue;
							}
							foreach ( $deep as $detail ) {
								$errors[] = "$prefix → $detail";
							}
						}
					}
				}
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->collect_style_errors( $el['elements'], $parser, $errors );
			}
		}
	}

	/**
	 * Walk a single style error key like "variants[0].background" against the
	 * corresponding sub-tree of Style_Schema and the actual style value, and return
	 * deep path-keyed reasons for whatever is failing inside it.
	 *
	 * Returns an empty array when the prop key is unknown, the value is missing,
	 * or no leaf-level reason can be derived.
	 *
	 * @param array  $style     The full style entry (id, type, label, variants).
	 * @param string $error_key Key from Style_Parser, e.g. "variants[0].background".
	 * @return string[] Detail lines like "variants[0].background.background-overlay[0].image.size: ...".
	 */
	private function expand_style_error( array $style, string $error_key ): array {
		if ( ! preg_match( '/^variants\[(\d+)\]\.(.+)$/', $error_key, $m ) ) {
			return [];
		}
		$variant_index = (int) $m[1];
		$prop_name     = $m[2];

		if ( ! isset( $style['variants'][ $variant_index ]['props'][ $prop_name ] ) ) {
			return [];
		}
		$value = $style['variants'][ $variant_index ]['props'][ $prop_name ];

		$schema = \Elementor\Modules\AtomicWidgets\Styles\Style_Schema::get();
		if ( ! isset( $schema[ $prop_name ] ) || ! ( $schema[ $prop_name ] instanceof \Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type ) ) {
			return [];
		}

		$leaves = [];
		$this->deep_validate_prop_value( $schema[ $prop_name ], $value, $error_key, $leaves );
		return $leaves;
	}

	/**
	 * Walk a Prop_Type schema in parallel with a value, accumulating leaf-level
	 * validation reasons keyed by their dotted path.
	 *
	 * Handles Object_Prop_Type (recurse into shape fields), Array_Prop_Type (recurse
	 * into items by numeric index), Union_Prop_Type (pick member by $$type, recurse).
	 * Plain types fall back to the boolean validate() with a human-readable diagnosis.
	 *
	 * Stops recursion at any subtree that validates cleanly — keeps the output focused
	 * on the actual offenders.
	 *
	 * @param object   $prop_type Prop_Type instance.
	 * @param mixed    $value     The value at this point in the tree.
	 * @param string   $path      Dotted path to this node (e.g. "variants[0].background.background-overlay[0]").
	 * @param string[] $leaves    Accumulator (modified in-place).
	 */
	private function deep_validate_prop_value( $prop_type, $value, string $path, array &$leaves ): void {
		if ( method_exists( $prop_type, 'validate' ) && $prop_type->validate( $value ) ) {
			return;
		}

		if ( null === $value ) {
			$leaves[] = "$path: required value is missing or null";
			return;
		}

		if ( $prop_type instanceof \Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type ) {
			$wrapped_type = is_array( $value ) && isset( $value['$$type'] ) ? $value['$$type'] : null;
			if ( null !== $wrapped_type ) {
				$member = $prop_type->get_prop_type( $wrapped_type );
				if ( null === $member ) {
					$allowed  = implode( ', ', array_keys( $prop_type->get_prop_types() ) );
					$leaves[] = "$path: \$\$type \"$wrapped_type\" not in union members [$allowed]";
					return;
				}
				$this->deep_validate_prop_value( $member, $value, $path, $leaves );
				return;
			}
			$member = $prop_type->get_prop_type_from_value( $value );
			if ( null === $member ) {
				$allowed  = implode( ', ', array_keys( $prop_type->get_prop_types() ) );
				$leaves[] = "$path: value did not match any union member [$allowed]";
				return;
			}
			$this->deep_validate_prop_value( $member, $value, $path, $leaves );
			return;
		}

		$is_object = $prop_type instanceof \Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
		$is_array  = $prop_type instanceof \Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;

		if ( $is_object || $is_array ) {
			$expected_key = method_exists( $prop_type, 'get_key' ) ? $prop_type::get_key() : 'object';
			if ( ! is_array( $value ) || ! array_key_exists( 'value', $value ) ) {
				$leaves[] = "$path: expected wrapped value {\"\$\$type\":\"$expected_key\",\"value\":...}";
				return;
			}
			if ( isset( $value['$$type'] ) && $value['$$type'] !== $expected_key ) {
				$leaves[] = "$path: \$\$type is \"{$value['$$type']}\" but schema expects \"$expected_key\"";
				return;
			}
			$inner = $value['value'];

			if ( $is_object ) {
				if ( ! is_array( $inner ) ) {
					$leaves[] = "$path: expected an object value for \"$expected_key\"";
					return;
				}
				$any_field_failed = false;
				foreach ( $prop_type->get_shape() as $field_key => $field_type ) {
					if ( ! ( $field_type instanceof \Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type ) ) {
						continue;
					}
					$sub_value = array_key_exists( $field_key, $inner ) ? $inner[ $field_key ] : null;
					$before    = count( $leaves );
					$this->deep_validate_prop_value( $field_type, $sub_value, "$path.$field_key", $leaves );
					if ( count( $leaves ) > $before ) {
						$any_field_failed = true;
					}
				}
				if ( ! $any_field_failed ) {
					$leaves[] = "$path: $expected_key rejected the value but every shape field individually validates — likely a cross-field rule in the prop type's validate_value() (e.g. image-src requires exactly one of id|url to be set; pass raw null instead of a wrapped {\$\$type,value:null} for the unused field).";
				}
				return;
			}

			if ( ! is_array( $inner ) ) {
				$leaves[] = "$path: expected an array value for \"$expected_key\"";
				return;
			}
			$item_type        = $prop_type->get_item_type();
			$any_item_failed  = false;
			foreach ( $inner as $i => $item ) {
				$before = count( $leaves );
				$this->deep_validate_prop_value( $item_type, $item, $path . "[$i]", $leaves );
				if ( count( $leaves ) > $before ) {
					$any_item_failed = true;
				}
			}
			if ( ! $any_item_failed ) {
				$leaves[] = "$path: array validation failed but no specific item could be pinpointed";
			}
			return;
		}

		$key      = method_exists( $prop_type, 'get_key' ) ? $prop_type::get_key() : 'leaf';
		$settings = method_exists( $prop_type, 'get_settings' ) ? $prop_type->get_settings() : [];
		$reason   = "value did not validate against \"$key\"";

		if ( ! empty( $settings['enum'] ) && is_array( $settings['enum'] ) ) {
			$reason .= '. Allowed enum: [' . implode( ', ', $settings['enum'] ) . ']';
		}

		$unwrapped = is_array( $value ) && array_key_exists( 'value', $value ) ? $value['value'] : $value;
		if ( is_scalar( $unwrapped ) ) {
			$reason .= '. Got: ' . wp_json_encode( $unwrapped );
		} elseif ( null === $unwrapped ) {
			$reason .= '. Got: null';
		} else {
			$reason .= '. Got: <' . gettype( $unwrapped ) . '>';
		}

		$leaves[] = "$path: $reason";
	}

	/**
	 * Walk the element tree and validate each atomic widget's settings against its
	 * registered props schema. Surfaces widget-layer prop mistakes (e.g. unknown
	 * `tag` enum value, malformed `text-wrapping` wrap) in the same batch as the
	 * style-parser layer, so one dry-run or save round-trip reports every error.
	 *
	 * Skips omitted props — Props_Parser uses defaults for missing values, and those
	 * are widget-side responsibility. Only user-supplied values are validated.
	 *
	 * @param array    $elements Element tree.
	 * @param string[] $errors   Accumulator (modified in-place).
	 */
	private function validate_widget_settings( array $elements, array &$errors ): void {
		$widget_types = \Elementor\Plugin::$instance->widgets_manager->get_widget_types();
		$this->collect_widget_setting_errors( $elements, $widget_types, $errors );
	}

	/**
	 * @param array    $elements     Element tree.
	 * @param array    $widget_types Map of widget_type → widget instance from widgets_manager.
	 * @param string[] $errors       Accumulator (modified in-place).
	 */
	private function collect_widget_setting_errors( array $elements, array $widget_types, array &$errors ): void {
		foreach ( $elements as $el ) {
			$el_id       = $el['id'] ?? '(unknown)';
			$el_type     = $el['elType'] ?? null;
			$widget_type = $el['widgetType'] ?? null;

			if ( 'widget' === $el_type && is_string( $widget_type ) && isset( $widget_types[ $widget_type ] ) ) {
				$widget = $widget_types[ $widget_type ];

				if ( method_exists( $widget, 'get_props_schema' ) ) {
					$schema   = $widget::get_props_schema();
					$settings = isset( $el['settings'] ) && is_array( $el['settings'] ) ? $el['settings'] : [];

					foreach ( $schema as $prop_key => $prop_type ) {
						if ( ! ( $prop_type instanceof \Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type ) ) {
							continue;
						}
						if ( ! array_key_exists( $prop_key, $settings ) ) {
							continue;
						}
						$value = $settings[ $prop_key ];
						if ( null === $value ) {
							continue;
						}
						if ( $prop_type->validate( $value ) ) {
							continue;
						}

						$prefix = "Element \"$el_id\" ($widget_type) settings.$prop_key";
						$leaves = [];
						$this->deep_validate_prop_value( $prop_type, $value, "settings.$prop_key", $leaves );

						if ( empty( $leaves ) ) {
							$errors[] = "$prefix: invalid_value";
							continue;
						}
						foreach ( $leaves as $detail ) {
							$errors[] = "Element \"$el_id\" ($widget_type): $detail";
						}
					}
				}
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->collect_widget_setting_errors( $el['elements'], $widget_types, $errors );
			}
		}
	}

	/**
	 * Recursively walk $elements to find the target element and apply the patch.
	 *
	 * @param array      $elements   Elements array (modified in-place via reference).
	 * @param string     $element_id Target element ID.
	 * @param array|null $settings   Settings keys to merge (shallow). Null = no change.
	 * @param array|null $styles     Style entries to merge by style ID. Null = no change.
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
