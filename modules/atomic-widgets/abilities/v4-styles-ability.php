<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V4_Styles_Ability {

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/v4-styles', [
			'label'       => 'Elementor V4 Style Prop-Type Reference',
			'description' => 'Verified data formats for every Elementor v4 style prop type. Validates props against live renderer. Call this before writing any style props.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'validate_props' => [
						'type'        => 'object',
						'description' => 'Optional: pass a props object to validate and render to CSS before saving.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'critical_rules'    => [ 'type' => 'array' ],
					'prop_types'        => [ 'type' => 'object' ],
					'style_schema'      => [ 'type' => 'object' ],
					'element_structure' => [ 'type' => 'object' ],
					'breakpoints'       => [ 'type' => 'object' ],
					'validation'        => [ 'type' => 'object' ],
				],
			],
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'CRITICAL: All prop type keys use "$$type" (double dollar), NEVER "$type" (single dollar). This is the #1 cause of rendering failures.',
						'Call this ability before writing any Elementor v4 style props to learn the correct formats.',
						'Use validate_props input to verify your props render to correct CSS before saving to the database.',
						'Every prop value must be wrapped in {$$type, value} — no raw scalars ever.',
						'Styles are stored INLINE in each element\'s "styles" property, keyed by style ID (e.g. "e-myid-s").',
						'The element settings.classes references the style ID: {"$$type":"classes","value":["e-myid-s"]}.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		] );
	}

	public function permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function execute( array $input ): array {
		$result = [
			'critical_rules'    => $this->get_critical_rules(),
			'prop_types'        => $this->get_prop_types_reference(),
			'style_schema'      => $this->get_style_schema_reference(),
			'element_structure' => $this->get_element_structure(),
			'breakpoints'       => $this->get_breakpoints_reference(),
		];

		if ( ! empty( $input['validate_props'] ) && is_array( $input['validate_props'] ) ) {
			$result['validation'] = $this->validate_props( $input['validate_props'] );
		}

		return $result;
	}

	private function validate_props( array $props ): array {
		$warnings = [];
		set_error_handler( function( $errno, $errstr ) use ( &$warnings ) {
			$warnings[] = $errstr;
			return true;
		} );

		$css = '';
		try {
			$bp  = Plugin::$instance->breakpoints->get_breakpoints_config();
			$css = Styles_Renderer::make( $bp, '' )->render( [ [
				'id'       => 'vp',
				'label'    => 'preview',
				'type'     => 'class',
				'variants' => [ [
					'meta'       => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props'      => $props,
					'custom_css' => null,
				] ],
			] ] );
		} catch ( \Throwable $e ) {
			$warnings[] = 'RENDER ERROR: ' . $e->getMessage();
		}

		restore_error_handler();

		$declarations  = trim( preg_replace( '/^\.vp\{/', '', rtrim( $css, '}' ) ) );
		$has_array_err = ( strpos( $css, ':Array' ) !== false || strpos( $css, 'Array;' ) !== false );

		if ( $has_array_err ) {
			$warnings[] = 'ARRAY ERROR: A prop value resolved to a PHP array instead of a string. Check $$type keys and nested prop structure.';
		}

		return [
			'css'          => $css,
			'declarations' => $declarations,
			'warnings'     => $warnings,
			'valid'        => empty( $warnings ) && ! empty( $declarations ) && ! $has_array_err,
			'hint'         => empty( $declarations ) ? 'No CSS produced — check that $$type keys are correct (double dollar sign) and all values match the expected prop types.' : null,
		];
	}

	private function get_critical_rules(): array {
		return [
			'TYPE KEY: ALL prop values use "$$type" (DOUBLE dollar sign). NEVER "$type" (single dollar). This is the most common source of failures — the renderer silently produces no CSS when the key is wrong.',
			'WRAPPING: Every prop value must be {"$$type": "...", "value": ...}. Raw scalars are NEVER valid at the prop level.',
			'BACKGROUND OVERLAY: background-overlay MUST be {"$$type":"background-overlay","value":[...]} because it is Array_Prop_Type. A plain PHP/JSON array here causes "Array to string conversion" fatal errors.',
			'GRADIENT ANGLE: background-gradient-overlay.angle uses {"$$type":"number","value":135} (Number_Prop_Type), NOT size.',
			'COLOR STOP OFFSET: color-stop.offset uses {"$$type":"number","value":0} where value is 0-100 (percent integer), NOT a size object.',
			'PADDING/MARGIN KEYS: dimensions uses logical CSS keys block-start (top), inline-end (right), block-end (bottom), inline-start (left) — NOT top/right/bottom/left.',
			'BORDER RADIUS KEYS: border-radius object uses start-start, start-end, end-start, end-end — NOT top-left etc. Maps to border-start-start-radius etc.',
			'BORDER WIDTH KEYS: border-width object uses block-start, block-end, inline-start, inline-end. Maps to border-block-start-width etc.',
			'SIMPLE UNIFORM VALUES: For uniform border-width/border-radius/padding, pass {"$$type":"size","value":{...}} directly (schema is Union type).',
			'SHADOW SIZE FIELDS: box-shadow hOffset/vOffset/blur/spread are {"$$type":"size","value":{"size":n,"unit":"px"}} objects. NOT plain strings.',
			'FONT FAMILY: font-family is String_Prop_Type — use {"$$type":"string","value":"Arial, sans-serif"} or {"$$type":"global-font-variable","value":"variable-id"}.',
			'STYLES LOCATION: Styles are stored INLINE in each element\'s own "styles" property — there is NO separate _elementor_styles post meta.',
			'STYLE ID CONVENTION: Style ID = "e-{elementId}-s". The element settings.classes value references this same ID.',
			'VALIDATE FIRST: Always use validate_props before saving. valid=true + non-empty declarations = correct props.',
			'SAVING: update_post_meta($post_id, "_elementor_data", wp_slash(wp_json_encode($data))); delete_post_meta($post_id, "_elementor_css");',
		];
	}

	private function get_prop_types_reference(): array {
		return [
			'string' => [
				'description' => 'Plain string. Used for flex-direction, justify-content, align-items, text-align, font-weight, text-transform, border-style, display, position, font-family, cursor, overflow, clip-path, font-style, flex-wrap.',
				'format'      => [ '$$type' => 'string', 'value' => '<string>' ],
				'examples'    => [
					'flex-direction'  => [ '$$type' => 'string', 'value' => 'column' ],
					'justify-content' => [ '$$type' => 'string', 'value' => 'center' ],
					'align-items'     => [ '$$type' => 'string', 'value' => 'flex-start' ],
					'text-align'      => [ '$$type' => 'string', 'value' => 'center' ],
					'text-transform'  => [ '$$type' => 'string', 'value' => 'uppercase' ],
					'font-weight'     => [ '$$type' => 'string', 'value' => '700' ],
					'font-style'      => [ '$$type' => 'string', 'value' => 'italic' ],
					'font-family'     => [ '$$type' => 'string', 'value' => 'Georgia, serif' ],
					'border-style'    => [ '$$type' => 'string', 'value' => 'solid' ],
					'display'         => [ '$$type' => 'string', 'value' => 'flex' ],
					'overflow'        => [ '$$type' => 'string', 'value' => 'hidden' ],
					'flex-wrap'       => [ '$$type' => 'string', 'value' => 'wrap' ],
					'clip-path'       => [ '$$type' => 'string', 'value' => 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' ],
				],
			],

			'number' => [
				'description' => 'Plain number. Used inside object shapes: gradient angle, color-stop offset, z-index, column-count, flex order.',
				'format'      => [ '$$type' => 'number', 'value' => 135 ],
				'used_for'    => [
					'gradient angle (degrees, e.g. 135 = top-left to bottom-right)',
					'color-stop offset (0-100, represents percent position)',
					'z-index',
					'column-count',
					'order (flex item order)',
				],
			],

			'size' => [
				'description' => 'CSS dimension. Used for font-size, letter-spacing, line-height, width, height, min-height, max-width, gap, and also for simple (uniform) border-radius and border-width.',
				'format'      => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
				'units'       => [ 'px', 'em', 'rem', '%', 'vw', 'vh', 'deg', 'ms', 's', 'fr', 'ch', 'svh', 'dvh', 'auto', 'custom' ],
				'note'        => 'Use unit="auto" with size="" for CSS auto. Use unit="custom" when size is a full CSS value string.',
				'examples'    => [
					'font-size'                      => [ '$$type' => 'size', 'value' => [ 'size' => 48,   'unit' => 'px' ] ],
					'letter-spacing'                 => [ '$$type' => 'size', 'value' => [ 'size' => -1,   'unit' => 'px' ] ],
					'line-height'                    => [ '$$type' => 'size', 'value' => [ 'size' => 1.6,  'unit' => 'em' ] ],
					'min-height (100vh)'             => [ '$$type' => 'size', 'value' => [ 'size' => 100,  'unit' => 'vh' ] ],
					'max-width'                      => [ '$$type' => 'size', 'value' => [ 'size' => 1200, 'unit' => 'px' ] ],
					'gap'                            => [ '$$type' => 'size', 'value' => [ 'size' => 24,   'unit' => 'px' ] ],
					'width 50%'                      => [ '$$type' => 'size', 'value' => [ 'size' => 50,   'unit' => '%'  ] ],
					'border-radius (simple uniform)' => [ '$$type' => 'size', 'value' => [ 'size' => 8,    'unit' => 'px' ] ],
					'border-width (simple uniform)'  => [ '$$type' => 'size', 'value' => [ 'size' => 2,    'unit' => 'px' ] ],
					'padding (simple uniform)'       => [ '$$type' => 'size', 'value' => [ 'size' => 40,   'unit' => 'px' ] ],
				],
			],

			'color' => [
				'description' => 'CSS color value. Used for color (text), border-color, outline-color, and inside shadow/background overlays.',
				'format'      => [ '$$type' => 'color', 'value' => '#RRGGBB or rgba(...) or hsl(...)' ],
				'examples'    => [
					[ '$$type' => 'color', 'value' => '#FFFFFF' ],
					[ '$$type' => 'color', 'value' => '#D2001A' ],
					[ '$$type' => 'color', 'value' => 'rgba(0,0,0,0.2)' ],
					[ '$$type' => 'color', 'value' => 'rgba(210,0,26,0.5)' ],
				],
			],

			'global-color-variable' => [
				'description' => 'References a kit global color variable by ID. Renders as var(--e-global-color-...). Can be used anywhere a color is accepted.',
				'format'      => [ '$$type' => 'global-color-variable', 'value' => '<variable-id>' ],
				'example'     => [ '$$type' => 'global-color-variable', 'value' => 'e-gv-e70596b' ],
				'note'        => 'Get variable IDs from the elementor/variables ability.',
			],

			'global-font-variable' => [
				'description' => 'References a kit global font variable by ID.',
				'format'      => [ '$$type' => 'global-font-variable', 'value' => '<variable-id>' ],
				'example'     => [ '$$type' => 'global-font-variable', 'value' => 'e-gv-1fa868d' ],
				'note'        => 'Get variable IDs from the elementor/variables ability.',
			],

			'dimensions' => [
				'description' => 'Four-sided spacing for padding or margin. Uses CSS logical property names as keys.',
				'warning'     => 'Keys are block-start/inline-end/block-end/inline-start (NOT top/right/bottom/left). Wrong keys produce no output silently.',
				'key_map'     => [
					'block-start'  => 'top    -> padding-block-start / margin-block-start',
					'inline-end'   => 'right  -> padding-inline-end / margin-inline-end',
					'block-end'    => 'bottom -> padding-block-end / margin-block-end',
					'inline-start' => 'left   -> padding-inline-start / margin-inline-start',
				],
				'format'      => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 80, 'unit' => 'px' ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 40, 'unit' => 'px' ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 80, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 40, 'unit' => 'px' ] ],
					],
				],
				'note' => 'padding/margin schema is Union(dimensions|size). Use dimensions for individual sides; use {$$type:size} for uniform all-sides.',
			],

			'border-radius-obj' => [
				'description' => 'Border radius with individual corners. CSS logical property names.',
				'warning'     => 'Keys: start-start (top-left), start-end (top-right), end-start (bottom-left), end-end (bottom-right).',
				'format'      => [
					'$$type' => 'border-radius',
					'value'  => [
						'start-start' => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
						'start-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
						'end-start'   => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
						'end-end'     => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
					],
				],
				'note' => 'border-radius schema is Union(border-radius|size). Use {$$type:size} for uniform radius.',
			],

			'border-width-obj' => [
				'description' => 'Border width per side. CSS logical property names.',
				'format'      => [
					'$$type' => 'border-width',
					'value'  => [
						'block-start'  => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'block-end'    => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
						'inline-end'   => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
					],
				],
			],

			'box-shadow' => [
				'description' => 'Array of shadow objects. hOffset/vOffset/blur/spread are Size_Prop_Type objects. color is Union(color|global-color-variable).',
				'warning'     => 'hOffset/vOffset/blur/spread MUST use {$$type:size,...} — passing plain strings fails silently.',
				'format'      => [
					'$$type' => 'box-shadow',
					'value'  => [
						[
							'$$type' => 'shadow',
							'value'  => [
								'hOffset' => [ '$$type' => 'size', 'value' => [ 'size' => 0,  'unit' => 'px' ] ],
								'vOffset' => [ '$$type' => 'size', 'value' => [ 'size' => 8,  'unit' => 'px' ] ],
								'blur'    => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
								'spread'  => [ '$$type' => 'size', 'value' => [ 'size' => 0,  'unit' => 'px' ] ],
								'color'   => [ '$$type' => 'color', 'value' => 'rgba(0,0,0,0.2)' ],
							],
						],
					],
				],
			],

			'background' => [
				'description' => 'Background. Object shape with background-overlay (Array_Prop_Type).',
				'pipeline'    => [
					'background (Object) -> background-overlay (Array_Prop_Type) MUST use {$$type:background-overlay,value:[...]}',
					'Each overlay item is Union: background-gradient-overlay | background-color-overlay | background-image-overlay',
					'background-gradient-overlay shape: type(string), angle(NUMBER not size), positions(string), stops(gradient-color-stop Array)',
					'gradient-color-stop (Array_Prop_Type): {$$type:gradient-color-stop,value:[...color-stop items]}',
					'color-stop (Object): {color: color|global-color-variable, offset: NUMBER 0-100}',
					'background-color-overlay shape: {color: color|global-color-variable}',
				],
				'examples' => [
					'solid_color' => [
						'comment' => 'Solid background — use background-color-overlay',
						'$$type'  => 'background',
						'value'   => [
							'background-overlay' => [
								'$$type' => 'background-overlay',
								'value'  => [
									[
										'$$type' => 'background-color-overlay',
										'value'  => [ 'color' => [ '$$type' => 'color', 'value' => '#D2001A' ] ],
									],
								],
							],
						],
					],
					'linear_gradient' => [
						'comment' => 'Linear gradient — angle is NUMBER (not size), offset is NUMBER 0-100',
						'$$type'  => 'background',
						'value'   => [
							'background-overlay' => [
								'$$type' => 'background-overlay',
								'value'  => [
									[
										'$$type' => 'background-gradient-overlay',
										'value'  => [
											'type'  => [ '$$type' => 'string', 'value' => 'linear' ],
											'angle' => [ '$$type' => 'number', 'value' => 135 ],
											'stops' => [
												'$$type' => 'gradient-color-stop',
												'value'  => [
													[ '$$type' => 'color-stop', 'value' => [ 'color' => [ '$$type' => 'color', 'value' => '#CC0000' ], 'offset' => [ '$$type' => 'number', 'value' => 0   ] ] ],
													[ '$$type' => 'color-stop', 'value' => [ 'color' => [ '$$type' => 'color', 'value' => '#0A0A0A' ], 'offset' => [ '$$type' => 'number', 'value' => 100 ] ] ],
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],

			'transition' => [
				'description' => 'CSS transitions.',
				'warning'     => 'Only "all" is supported as property. Per-property transitions are silently ignored.',
				'format'      => [
					'$$type' => 'transition',
					'value'  => [ [ 'selection' => [ 'value' => 'all' ], 'size' => '0.3s ease' ] ],
				],
			],
		];
	}

	private function get_style_schema_reference(): array {
		return [
			'note'             => 'Full list of style prop keys from Style_Schema::get(). Use these exact key names in your props objects.',
			'size_props'       => [ 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'overflow', 'aspect-ratio', 'object-fit' ],
			'position_props'   => [ 'position', 'inset-block-start', 'inset-inline-end', 'inset-block-end', 'inset-inline-start', 'z-index', 'scroll-margin-top' ],
			'typography_props' => [ 'font-family', 'font-weight', 'font-size', 'color', 'letter-spacing', 'word-spacing', 'column-count', 'column-gap', 'line-height', 'text-align', 'font-style', 'text-decoration', 'text-transform', 'direction', 'stroke', 'all', 'cursor' ],
			'spacing_props'    => [
				'padding' => 'Union(dimensions|size)',
				'margin'  => 'Union(dimensions|size)',
			],
			'border_props'     => [ 'border-radius', 'border-width', 'border-color', 'border-style', 'outline-width', 'outline-color', 'outline-style', 'outline-offset' ],
			'background_props' => [ 'background' ],
			'effects_props'    => [ 'mix-blend-mode', 'box-shadow', 'opacity', 'filter', 'backdrop-filter', 'transform', 'transition' ],
			'layout_props'     => [ 'display', 'flex-direction', 'gap', 'flex-wrap', 'flex' ],
			'alignment_props'  => [ 'justify-content', 'justify-items', 'align-content', 'align-items', 'align-self', 'order' ],
			'special_props'    => [ 'content', 'appearance', 'clip-path' ],
		];
	}

	private function get_element_structure(): array {
		return [
			'style_id_convention' => 'Style ID = "e-{elementId}-s". Always follow this pattern.',
			'classes_setting'     => '{"$$type":"classes","value":["e-{elementId}-s"]}',
			'styles_location'     => 'Stored INLINE in element["styles"] object — keyed by style ID. No separate _elementor_styles meta.',
			'custom_css_format'   => 'custom_css.raw = base64_encode($css_string). Set to null to omit.',
			'saving_command'      => 'update_post_meta($id, "_elementor_data", wp_slash(wp_json_encode($data))); delete_post_meta($id, "_elementor_css");',
			'widget_types'        => [
				'e-heading'   => 'settings: tag={$$type:string,value:h1}, title={$$type:html-v3,...}',
				'e-paragraph' => 'settings: paragraph={$$type:html-v3,...}',
				'e-button'    => 'settings: text={$$type:html-v3,...}',
			],
			'html_v3_format'    => [ '$$type' => 'html-v3', 'value' => [ 'content' => [ '$$type' => 'string', 'value' => 'Your text here' ], 'children' => [] ] ],
			'flexbox_container' => [
				'id' => 'my-id', 'elType' => 'e-flexbox',
				'settings' => [ 'classes' => [ '$$type' => 'classes', 'value' => [ 'e-my-id-s' ] ] ],
				'elements' => [], 'isInner' => true, 'interactions' => [], 'editor_settings' => [], 'version' => '0.0',
				'styles' => [
					'e-my-id-s' => [
						'id' => 'e-my-id-s', 'label' => 'local', 'type' => 'class',
						'variants' => [ [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [], 'custom_css' => null ] ],
					],
				],
			],
		];
	}

	private function get_breakpoints_reference(): array {
		$bp_config = [];
		try {
			$bp_config = Plugin::$instance->breakpoints->get_breakpoints_config();
		} catch ( \Throwable $e ) {
			$bp_config = [ 'error' => $e->getMessage() ];
		}

		return [
			'note'   => 'Add multiple variants to a single style to make it responsive. Each variant specifies a breakpoint in meta.breakpoint.',
			'breakpoints' => [
				'desktop'      => 'No media query — base styles, always applied. Always include this variant.',
				'laptop'       => '@media (max-width: 1366px)',
				'tablet_extra' => '@media (max-width: 1200px)',
				'tablet'       => '@media (max-width: 1024px)',
				'mobile_extra' => '@media (max-width: 880px)',
				'mobile'       => '@media (max-width: 767px)',
				'widescreen'   => '@media (min-width: 2400px)',
			],
			'active_config' => $bp_config,
			'rules' => [
				'Always define a desktop variant first — it is the base and has no media query.',
				'Only include the props that change at each breakpoint — CSS cascade handles the rest.',
				'The same $$type prop formats apply at every breakpoint.',
				'Use validate_props (desktop only) to verify prop formats before adding responsive variants.',
			],
			'example' => [
				'id'    => 'e-my-heading-s',
				'label' => 'local',
				'type'  => 'class',
				'variants' => [
					[
						'meta'  => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 64, 'unit' => 'px' ] ],
							'padding'   => [ '$$type' => 'size', 'value' => [ 'size' => 80, 'unit' => 'px' ] ],
						],
						'custom_css' => null,
					],
					[
						'meta'  => [ 'breakpoint' => 'tablet', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 40, 'unit' => 'px' ] ],
							'padding'   => [ '$$type' => 'size', 'value' => [ 'size' => 48, 'unit' => 'px' ] ],
						],
						'custom_css' => null,
					],
					[
						'meta'  => [ 'breakpoint' => 'mobile', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 28, 'unit' => 'px' ] ],
							'padding'   => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
						],
						'custom_css' => null,
					],
				],
			],
		];
	}
}
