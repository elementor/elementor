<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds a single style-entry record from a CSS declaration string.
 *
 * Returns the shape expected by Style_Parser: a class-type entry with one variant whose
 * props map is produced by the shared Css_Shorthand_Parser. Drop directly into an element's
 * `styles` map (keyed by the returned style_id) — keys must also be mirrored into
 * `settings.classes.value` to actually apply (Build_Page_Ability auto-mirrors).
 */
class Make_Style_Ability extends Abstract_Ability {

	use Css_Shorthand_Parser;

	protected function get_name(): string {
		return 'elementor/make-style';
	}

	protected function get_config(): array {
		return [
			'label'        => 'Elementor Make Style',
			'description'  => 'Builds a single local style-entry record from a CSS string. Output is shape-compatible with element.styles values and build-page input.',
			'category'     => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [
					'id'         => [
						'type'        => 'string',
						'description' => 'Style ID (7-hex). Auto-generated when omitted. Must also appear in settings.classes.value to take effect.',
					],
					'label'      => [
						'type'        => 'string',
						'description' => 'Human-readable label. Defaults to "local".',
					],
					'css'        => [
						'type'        => 'string',
						'description' => 'CSS declarations separated by ";" — same format as elementor/css-to-props input.',
					],
					'breakpoint' => [
						'type'        => 'string',
						'description' => 'Breakpoint for this variant. Defaults to "desktop". Use "tablet" / "mobile" / any registered responsive breakpoint for other screen sizes.',
					],
					'state'      => [
						'type'        => 'string',
						'description' => 'Interaction state for this variant. Valid values: null (default), "hover", "focus", "active", "focus-visible", "checked". Omit for the base state.',
					],
				],
				'required'             => [ 'css' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'style_id' => [
						'type'        => 'string',
						'description' => 'The ID for this style entry — must match the key under element.styles and also appear in settings.classes.value.',
					],
					'entry'    => [
						'type'        => 'object',
						'description' => 'Full style-entry record { id, type:"class", label, variants:[{meta, props}] }. Ready to paste as the value of element.styles[<style_id>].',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Produces one class-type style entry from a CSS string — no hand-rolling of the variants / meta / props structure.',
						'OUTPUT: { style_id, entry: { id, type:"class", label, variants: [{meta:{breakpoint, state}, props}] } }. entry.id === style_id === the key you use in element.styles.',
						'PROPS: css is passed through the shared Css_Shorthand_Parser — the same shapes elementor/css-to-props produces (dimensions for margin/padding, border-radius for corners, flex for flex shorthand, inset-* for positioning, etc.).',
						'USAGE: add the returned { [style_id]: entry } into your element.styles map, AND push style_id into settings.classes.value. build-page auto-mirrors the key into classes.value if you forget.',
						'VAR() LABELS: var() refs emit label form — build-page resolves them when saving class variants, but element-style var-labels still need manual label->id resolution until make-page gains the same pass.',
						'STATE: null = default state. Use "hover", "focus", "active", "focus-visible", "checked" for interactive states. Empty string "" and "normal" are INVALID.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$css        = isset( $input['css'] ) && is_string( $input['css'] ) ? $input['css'] : '';
		$style_id   = isset( $input['id'] ) && is_string( $input['id'] ) && '' !== $input['id'] ? $input['id'] : Utils::generate_id();
		$label      = isset( $input['label'] ) && is_string( $input['label'] ) && '' !== $input['label'] ? $input['label'] : 'local';
		$breakpoint = isset( $input['breakpoint'] ) && is_string( $input['breakpoint'] ) && '' !== $input['breakpoint'] ? $input['breakpoint'] : 'desktop';
		$state      = array_key_exists( 'state', $input ) && is_string( $input['state'] ) && '' !== $input['state'] ? $input['state'] : null;

		$props = $this->css_to_props( $css );

		$entry = [
			'id'       => $style_id,
			'type'     => 'class',
			'label'    => $label,
			'variants' => [
				[
					'meta'  => [
						'breakpoint' => $breakpoint,
						'state'      => $state,
					],
					'props' => $props,
				],
			],
		];

		return [
			'style_id' => $style_id,
			'entry'    => $entry,
		];
	}
}
