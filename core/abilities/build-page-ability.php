<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\GlobalClasses\Abilities\Set_Global_Classes_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Abilities\Set_Variables_Ability;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Page_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/build-page';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Build Page',
			'description' => 'One-shot page builder: upserts variables and classes, resolves class labels in the element tree, and saves the page atomically in a single call.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'   => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to build.',
					],
					'variables' => [
						'type'        => 'array',
						'description' => 'Optional. Variables to create or update — same format as elementor/set-variables input.',
					],
					'classes'   => [
						'type'        => 'array',
						'description' => 'Optional. Classes to create or update — same format as elementor/set-global-classes input.',
					],
					'elements'  => [
						'type'        => 'array',
						'description' => 'Full Elementor elements tree to save. Class labels in settings.classes.value are resolved automatically using freshly upserted class IDs.',
					],
				],
				'required'             => [ 'post_id', 'elements' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'   => [ 'type' => 'integer' ],
					'variables' => [
						'type'        => 'object',
						'description' => 'Result from variable upsert (only present when variables were provided).',
					],
					'classes'   => [
						'type'        => 'object',
						'description' => 'Result from class upsert (only present when classes were provided).',
					],
					'success'   => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'One-shot page builder — replaces the three-step create-variables + create-classes + save-content sequence with a single call.',
						'Execution order: upsert variables → upsert classes → resolve labels in elements → save page.',
						'variables and classes are optional. Omit either if not needed.',
						'Variable labels in class variant props (e.g. {"$$type":"global-color-variable","value":"ajax-red"}) are resolved to variable IDs before the classes are saved.',
						'Class labels in elements (e.g. "ajax-hero-outer") are resolved to full IDs automatically using the classes just upserted plus any existing ones.',
						'PROP FORMAT: ALL typed prop values use $$type (double dollar sign), never $type.',
						'WIDGET PROP KEYS:',
						'  e-heading   → title',
						'  e-paragraph → paragraph',
						'  e-button    → text',
						'  e-image     → image (optional)',
						'The ability validates class IDs and $$type usage before saving — errors are returned with clear messages.',
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
		$output   = [ 'post_id' => $post_id ];

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		// Step 1: upsert variables.
		if ( ! empty( $input['variables'] ) ) {
			$output['variables'] = ( new Set_Variables_Ability() )->execute( [ 'variables' => $input['variables'] ] );
		}

		// Build variable label→id map so class props can reference variables by label.
		$var_repo        = new Variables_Repository( Plugin::$instance->kits_manager->get_active_kit() );
		$var_label_to_id = [];
		foreach ( $var_repo->load()->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$var_label_to_id[ strtolower( $variable->label() ) ] = $variable->id();
			}
		}

		// Step 2: resolve variable labels inside class variant props, then upsert classes.
		if ( ! empty( $input['classes'] ) ) {
			$classes = $input['classes'];
			$this->resolve_variable_labels_in_classes( $classes, $var_label_to_id );
			$output['classes'] = ( new Set_Global_Classes_Ability() )->execute( [ 'classes' => $classes ] );
		}

		// Step 3: build label→id index from the now-current repository state.
		$repo        = new Global_Classes_Repository();
		$label_to_id = [];
		$known_ids   = [];
		foreach ( $repo->all()->get_items()->all() as $id => $item ) {
			$known_ids[]                            = $id;
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		// Step 4: resolve class labels in the element tree.
		$this->resolve_class_labels( $elements, $label_to_id );

		// Step 5: validate (single-dollar $type, truncated IDs, unknown IDs).
		$this->validate_elements( $elements, $known_ids );

		// Step 6: save.
		$saved = $document->save( [ 'elements' => $elements ] );

		$output['success'] = (bool) $saved;

		return $output;
	}

	/**
	 * Walk the classes input and resolve variable labels inside variant props.
	 *
	 * Any prop with $$type "global-color-variable", "global-font-variable", or
	 * "global-size-variable" whose value does not start with "e-gv-" is treated as
	 * a label and replaced with the corresponding variable ID.
	 *
	 * @param array $classes         Classes input array (passed by reference).
	 * @param array $var_label_to_id Map of lowercase label → variable ID.
	 * @throws \InvalidArgumentException When a variable label cannot be resolved.
	 */
	private function resolve_variable_labels_in_classes( array &$classes, array $var_label_to_id ): void {
		$variable_prop_types = [
			'global-color-variable',
			'global-font-variable',
			'global-size-variable',
		];

		foreach ( $classes as &$class ) {
			if ( empty( $class['variants'] ) || ! is_array( $class['variants'] ) ) {
				continue;
			}

			foreach ( $class['variants'] as &$variant ) {
				if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
					continue;
				}

				foreach ( $variant['props'] as $prop_name => &$prop ) {
					if (
						! is_array( $prop ) ||
						! isset( $prop['$$type'] ) ||
						! in_array( $prop['$$type'], $variable_prop_types, true )
					) {
						continue;
					}

					if ( ! isset( $prop['value'] ) || ! is_string( $prop['value'] ) ) {
						continue;
					}

					// Already an ID — leave untouched.
					if ( str_starts_with( $prop['value'], 'e-gv-' ) ) {
						continue;
					}

					$label_lower = strtolower( $prop['value'] );

					if ( ! isset( $var_label_to_id[ $label_lower ] ) ) {
						$label = $class['label'] ?? '(unknown class)';
						// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
						throw new \InvalidArgumentException( "Variable label \"{$prop['value']}\" referenced in class \"$label\" prop \"$prop_name\" not found — create it first with the variables input parameter or check the label spelling." );
					}

					$prop['value'] = $var_label_to_id[ $label_lower ];
				}
				unset( $prop );
			}
			unset( $variant );
		}
		unset( $class );
	}

	/**
	 * Walk the element tree and replace class labels with their full IDs.
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
						throw new \InvalidArgumentException( "Class label \"$val\" not found — create it first with the classes input parameter or check the label spelling." );
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
}
