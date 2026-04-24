<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Converts a CSS declaration string to Elementor v4 props with the correct $$type shapes.
 *
 * The output matches the shapes produced by atomic-widgets' `Prop_Type::generate()` and
 * validated by Style_Schema — callers can drop the result straight into an element's
 * `settings.<prop>` or a style variant's `props`.
 *
 * var() references are emitted in label form (`{$$type:"global-size-variable",value:"<label>"}`);
 * label→id resolution is the caller's responsibility.
 */
class Css_To_Props_Ability extends Abstract_Ability {

	use Css_Shorthand_Parser;

	protected function get_name(): string {
		return 'elementor/css-to-props';
	}

	protected function get_config(): array {
		return [
			'label'        => 'Elementor CSS to Props',
			'description'  => 'Converts a CSS declaration string (e.g. "padding:12px 16px; border-radius:8px") to Elementor v4 props with correct $$type shapes. Handles shorthands, logical-property rewrites, flex shorthand, box-shadow, and var() references.',
			'category'     => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [
					'css' => [
						'type'        => 'string',
						'description' => 'CSS declarations separated by semicolons, e.g. "padding:12px 16px; border-radius:8px; background:#ffffff". Accepts shorthands, physical + logical property names, var() refs, and calc()/min()/max()/clamp() functions.',
					],
				],
				'required'             => [ 'css' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'props' => [
						'type'        => 'object',
						'description' => 'Map of output-prop-name to $$type-wrapped value. Output keys may differ from input keys (e.g. margin-top -> margin, top -> inset-block-start).',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Converts CSS declarations to v4 props without hand-rolling $$type nesting.',
						'INPUT: one or more CSS declarations separated by ";" — "padding:12px 16px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,.1)".',
						'OUTPUT KEYS: shorthand props keep their name (margin, padding, border-radius, border-width). Side-specific props (margin-top, padding-left, border-top-left-radius) COLLAPSE to the shorthand output key with a partial dimensions value. Multiple side-specific decls for the same shorthand merge into one dimensions object.',
						'POSITIONING: top/right/bottom/left are REWRITTEN to inset-block-start / inset-inline-end / inset-block-end / inset-inline-start.',
						'FLEX: "flex:1 0 auto" is fully parsed into {$$type:"flex", value:{flexGrow, flexShrink, flexBasis}} — do not pass "flex" as string.',
						'AUTO / CSS FUNCTIONS: "auto" and calc()/min()/max()/clamp() emit {$$type:"size", value:{size:"<keyword-or-expr>", unit:"custom"}} — do not fall back to strings.',
						'VAR() REFS: "var(--brand)" on a color prop emits {$$type:"global-color-variable", value:"brand"} (label form). Same for --space-* on size props via global-size-variable. Resolve labels to IDs before save (build-page does this for class variant props; element styles need the same pass).',
						'UNKNOWN / ENUM-VALIDATED props fall through to {$$type:"string", value:<raw>} — font-weight, font-family, display, position, transform, border-style, justify/align-*, cursor, flex-direction, flex-wrap are all string fallbacks at this layer.',
						'USE THIS instead of the html-css-converter plugin when you only have CSS strings and need v4 props — avoids a round-trip through the converter plugin.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$css = isset( $input['css'] ) && is_string( $input['css'] ) ? $input['css'] : '';

		return [
			'props' => $this->css_to_props( $css ),
		];
	}
}
