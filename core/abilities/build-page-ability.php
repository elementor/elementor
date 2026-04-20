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

	use Element_Tree_Helpers;

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
					'dry_run'   => [
						'type'        => 'boolean',
						'description' => 'When true, runs all normalization and validation but does NOT save. Returns { success: false, dry_run: true, errors: [...] } so prop/style mistakes can be caught without persisting. Default: false.',
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
					'dry_run'   => [
						'type'        => 'boolean',
						'description' => 'Echoes the input dry_run flag. Present only when dry_run was requested.',
					],
					'errors'    => [
						'type'        => 'array',
						'description' => 'Validation errors. Present (possibly empty) when dry_run=true. On a real save, errors instead throw with a clear message.',
						'items'       => [ 'type' => 'string' ],
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'One-shot page builder — replaces the three-step create-variables + create-classes + save-content sequence with a single call.',
						'Execution order: upsert variables → upsert classes → resolve labels in elements → normalize + auto-mirror styles → validate (collect ALL errors) → save (or short-circuit when dry_run=true).',
						'AUTO-FIXES applied to the element tree before validation: (1) every local style-map key is mirrored into the element\'s settings.classes.value (defining element.styles["s1"] without listing "s1" in classes.value is a silent no-op — now handled for you). (2) style.id defaults to its map key. (3) style.label defaults to the style id when missing or <2 chars. (4) style.type defaults to "class". (5) variant.meta.breakpoint defaults to "desktop" when null/missing. (6) flex/text-align/opacity props are coerced to canonical shapes.',
						'variables and classes are optional. Omit either if not needed.',
						'DRY-RUN MODE: pass dry_run=true to validate the full payload (vars + classes + elements) without persisting. Returns { success: <bool>, validated: <bool>, dry_run: true, errors: [...] }. success/validated are TRUE when errors[] is empty.',
						'VALIDATION BATCHING: all structural + style-prop errors are collected in one pass and reported together. On a real save (dry_run=false), the same batch is run and — if any error is present — thrown as a single multi-line exception. Fix every line; you will not see a second round-trip of errors.',
						'Variable labels in class variant props (e.g. {"$$type":"global-color-variable","value":"ajax-red"}) are resolved to variable IDs before the classes are saved.',
						'Class labels in elements (e.g. "ajax-hero-outer") are resolved to full IDs automatically using the classes just upserted plus any existing ones.',
						'PROP FORMAT: ALL typed prop values use $$type (double dollar sign), never $type. Use the elementor/prop-schema ability to look up the exact shape of any $$type by key.',
						'ELEMENT TYPES:',
						'  e-flexbox → container/row/column. Uses elType:"e-flexbox", has an "elements" children array, NO widgetType. Do NOT call widget-schema for e-flexbox.',
						'  widget    → leaf element. Uses elType:"widget" + widgetType (e.g. "e-heading"). Has no children elements array.',
						'WIDGET PROP KEYS:',
						'  e-heading   → title',
						'  e-paragraph → paragraph',
						'  e-button    → text',
						'  e-image     → image (optional)',
						'CLASSES PROP FORMAT — classes.value is a plain array of strings (not objects):',
						'  {"$$type":"classes","value":["e-gc-9705bfbc-2335-4e75-b761-71e4973977df"]}',
						'  Each string is a global class UUID, a local style ID from element.styles, or a human-readable label (resolved automatically).',
						'LOCAL STYLES FORMAT — element.styles is a keyed object (not an array):',
						'  "styles": { "<style-id>": { "id":"<style-id>", "type":"class", "label":"local", "variants": [{ "meta": { "breakpoint":"desktop", "state":null }, "props": {...} }] } }',
						'  style.id IS REQUIRED and must equal the map key — auto-injected if missing. Style_Parser rejects styles without an id.',
						'  meta.breakpoint IS REQUIRED and must be a STRING (e.g. "desktop", "tablet", "mobile") — null is INVALID. Auto-coerced to "desktop" if null/missing.',
						'  meta.state: null = default state. Use "hover", "focus", "active", "focus-visible", "checked" for interactive states. Empty string "" and "normal" are invalid.',
						'  style-id: any short unique string (e.g. "s1", "e-dh-s-abc"). Must also appear in settings classes.value to have any effect.',
						'COMMON CLASS PROP FORMATS (for global class variant props):',
						'  Solid background: {"$$type":"background","value":{"background-overlay":{"$$type":"background-overlay","value":[{"$$type":"background-color-overlay","value":{"color":{"$$type":"color","value":"#ffffff"}}}]}}}',
						'  Linear gradient: {"$$type":"background","value":{"background-overlay":{"$$type":"background-overlay","value":[{"$$type":"background-gradient-overlay","value":{"type":{"$$type":"string","value":"linear"},"angle":{"$$type":"number","value":135},"stops":{"$$type":"gradient-color-stop","value":[{"$$type":"color-stop","value":{"color":{"$$type":"color","value":"#CC0000"},"offset":{"$$type":"number","value":0}}},{"$$type":"color-stop","value":{"color":{"$$type":"color","value":"#0A0A0A"},"offset":{"$$type":"number","value":100}}}]}}}]}}}',
						'    — gradient angle is NUMBER (0-360, NOT size). color-stop offset is NUMBER (0-100, NOT size). stops is wrapped {"$$type":"gradient-color-stop","value":[...]}.',
						'  Padding/margin:   {"$$type":"dimensions","value":{"block-start":{"$$type":"size","value":{"size":80,"unit":"px"}},"inline-end":{...},"block-end":{...},"inline-start":{...}}}',
						'    — dimensions uses CSS LOGICAL keys (block-start/inline-end/block-end/inline-start), NOT top/right/bottom/left. For uniform values use {"$$type":"size","value":{...}} directly (Union type).',
						'  Font size:        {"$$type":"size","value":{"size":16,"unit":"px"}}  — NOT a plain string like "16px"',
						'  Color:            {"$$type":"color","value":"#333333"}',
						'  Background image: {"$$type":"background","value":{"background-overlay":{"$$type":"background-overlay","value":[{"$$type":"background-image-overlay","value":{"image":{"$$type":"image","value":{"src":{"$$type":"image-src","value":{"id":null,"url":{"$$type":"url","value":"https://example.com/img.jpg"}}},"size":{"$$type":"string","value":"large"}}},"size":{"$$type":"string","value":"cover"},"position":{"$$type":"string","value":"center center"},"repeat":{"$$type":"string","value":"no-repeat"},"attachment":{"$$type":"string","value":"scroll"}}}]}}}',
						'    — image-src.id MUST be raw null when there is no attachment ID. Do NOT wrap as {"$$type":"image-attachment-id","value":null} — the wrapped form requires a numeric value and will fail validation.',
						'    — image.size is the WP media-library size enum [thumbnail, medium, medium_large, large, 1536x1536, 2048x2048, full] — NOT a CSS keyword like "cover". CSS sizing lives at background-image-overlay.size (a separate Union of string|background-image-size-scale).',
						'For ANY other prop type shape, call elementor/prop-schema { "type": "<key>" } — eliminates guesswork and round-trips.',
						'ERROR FORMAT (dry_run): style errors include both the Style_Parser top-level key and a deep path-aware reason chain, joined by " → ". Example: \'Element "x" style "y": variants[0].background: invalid_value → variants[0].background.background-overlay[0].image.size: value did not validate against "string". Allowed enum: [thumbnail, ..., full]. Got: "cover"\'. Always read the part after the " → " to find the exact bad sub-field.',
						'The ability normalizes (id, breakpoint) and validates ($$type usage, class IDs, full Style_Schema) before saving — errors come back with clear messages or, in dry_run mode, in the errors array.',
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
		$dry_run  = ! empty( $input['dry_run'] );
		$output   = [ 'post_id' => $post_id ];

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		// Step 1: upsert variables (skipped in dry-run to keep the call side-effect-free).
		if ( ! empty( $input['variables'] ) && ! $dry_run ) {
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
		if ( ! empty( $input['classes'] ) && ! $dry_run ) {
			$classes = $input['classes'];
			$this->resolve_variable_labels_in_classes( $classes, $var_label_to_id );
			$output['classes'] = ( new Set_Global_Classes_Ability() )->execute( [ 'classes' => $classes ] );
		} elseif ( ! empty( $input['classes'] ) && $dry_run ) {
			// In dry-run we still validate the variable-label resolution so missing labels surface.
			$dry_classes = $input['classes'];
			$this->resolve_variable_labels_in_classes( $dry_classes, $var_label_to_id );
		}

		// Step 3: build label→id index from the now-current repository state.
		// In dry-run, also fold in any class IDs/labels the input proposes so element-tree label
		// resolution and class-ID validation don't fail purely because the upsert was skipped.
		$repo        = new Global_Classes_Repository();
		$label_to_id = [];
		$known_ids   = [];
		foreach ( $repo->all()->get_items()->all() as $id => $item ) {
			$known_ids[]                            = $id;
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}
		if ( $dry_run && ! empty( $input['classes'] ) ) {
			foreach ( $input['classes'] as $proposed ) {
				if ( ! is_array( $proposed ) ) {
					continue;
				}
				if ( isset( $proposed['id'] ) && is_string( $proposed['id'] ) ) {
					$known_ids[] = $proposed['id'];
				}
				if ( isset( $proposed['label'], $proposed['id'] ) && is_string( $proposed['label'] ) && is_string( $proposed['id'] ) ) {
					$label_to_id[ $proposed['label'] ] = $proposed['id'];
				}
			}
		}

		// Step 4: resolve class labels in the element tree.
		$this->resolve_class_labels( $elements, $label_to_id );

		// Step 5: normalize then validate.
		// Normalize first so common omissions (style.id, label, null breakpoint) don't trip validation,
		// and mirror every local style key into settings.classes.value so styles actually attach.
		$this->normalize_element_styles( $elements );
		$this->auto_mirror_style_keys_into_classes( $elements );

		$local_ids = [];
		$this->collect_local_style_ids( $elements, $local_ids );

		// Run every validator up-front (both dry-run and save) and collect all errors,
		// so one round-trip reports structural + style-prop failures together.
		$errors = [];
		$this->validate_elements( $elements, array_merge( $known_ids, $local_ids ), $errors );
		$this->coerce_style_props( $elements );
		$style_errors = $this->validate_element_styles( $elements );
		$all_errors   = array_values( array_merge( $errors, $style_errors ) );

		if ( $dry_run ) {
			$output['success']   = empty( $all_errors );
			$output['validated'] = empty( $all_errors );
			$output['dry_run']   = true;
			$output['errors']    = $all_errors;
			return $output;
		}

		if ( ! empty( $all_errors ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( 'build-page validation failed:' . "\n - " . implode( "\n - ", $all_errors ) );
		}

		// Step 6: save. Validation already ran — skip the redundant pass inside set-post-content.
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
}
