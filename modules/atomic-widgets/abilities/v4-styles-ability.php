<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V4_Styles_Ability extends Abstract_Ability {

	private Breakpoints_Manager $breakpoints_manager;

	public function __construct( Breakpoints_Manager $breakpoints_manager ) {
		$this->breakpoints_manager = $breakpoints_manager;
	}

	protected function get_name(): string {
		return 'elementor/v4-styles';
	}

	protected function get_config(): array {
		return [
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
				],
			],
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
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$result = [
			'critical_rules'    => V4_Styles_Reference::get_critical_rules(),
			'prop_types'        => V4_Styles_Reference::get_prop_types(),
			'style_schema'      => V4_Styles_Reference::get_style_schema(),
			'element_structure' => V4_Styles_Reference::get_element_structure(),
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

		$rendered_css = '';
		try {
			$breakpoints_config = $this->breakpoints_manager->get_breakpoints_config();
			$rendered_css = Styles_Renderer::make( $breakpoints_config, '' )->render(
				[
					[
						'id'       => 'vp',
						'label'    => 'preview',
						'type'     => 'class',
						'variants' => [
							[
								'meta'       => [
									'breakpoint' => 'desktop',
									'state'      => null,
								],
								'props'      => $props,
								'custom_css' => null,
							],
						],
					],
				]
			);
		} catch ( \Throwable $exception ) {
			$warnings[] = 'RENDER ERROR: ' . $exception->getMessage();
		} finally {
			restore_error_handler();
		}

		$declarations    = trim( preg_replace( '/^\.vp\{/', '', rtrim( $rendered_css, '}' ) ) );
		$has_array_error = ( strpos( $rendered_css, ':Array' ) !== false || strpos( $rendered_css, 'Array;' ) !== false );

		if ( $has_array_error ) {
			$warnings[] = 'ARRAY ERROR: A prop value resolved to a PHP array instead of a string. Check $$type keys and nested prop structure.';
		}

		return [
			'css'          => $rendered_css,
			'declarations' => $declarations,
			'warnings'     => $warnings,
			'valid'        => empty( $warnings ) && ! empty( $declarations ) && ! $has_array_error,
			'hint'         => empty( $declarations ) ? 'No CSS produced — check that $$type keys are correct (double dollar sign) and all values match the expected prop types.' : null,
		];
	}

	private function get_breakpoints_reference(): array {
		$breakpoints_config = [];
		try {
			$breakpoints_config = $this->breakpoints_manager->get_breakpoints_config();
		} catch ( \Throwable $exception ) {
			$breakpoints_config = [ 'error' => $exception->getMessage() ];
		}

		return [
			'note'        => 'Add multiple variants to a single style to make it responsive. Each variant specifies a breakpoint in meta.breakpoint.',
			'breakpoints' => [
				'desktop'      => 'No media query — base styles, always applied. Always include this variant.',
				'laptop'       => '@media (max-width: 1366px)',
				'tablet_extra' => '@media (max-width: 1200px)',
				'tablet'       => '@media (max-width: 1024px)',
				'mobile_extra' => '@media (max-width: 880px)',
				'mobile'       => '@media (max-width: 767px)',
				'widescreen'   => '@media (min-width: 2400px)',
			],
			'active_config' => $breakpoints_config,
			'rules'         => [
				'Always define a desktop variant first — it is the base and has no media query.',
				'Only include the props that change at each breakpoint — CSS cascade handles the rest.',
				'The same $$type prop formats apply at every breakpoint.',
				'Use validate_props (desktop only) to verify prop formats before adding responsive variants.',
			],
			'example' => [
				'id'       => 'e-my-heading-s',
				'label'    => 'local',
				'type'     => 'class',
				'variants' => [
					[
						'meta'       => [
							'breakpoint' => 'desktop',
							'state'      => null,
						],
						'props'      => [
							'font-size' => [
								'$$type' => 'size',
								'value'  => [
									'size' => 64,
									'unit' => 'px',
								],
							],
							'padding'   => [
								'$$type' => 'size',
								'value'  => [
									'size' => 80,
									'unit' => 'px',
								],
							],
						],
						'custom_css' => null,
					],
					[
						'meta'       => [
							'breakpoint' => 'tablet',
							'state'      => null,
						],
						'props'      => [
							'font-size' => [
								'$$type' => 'size',
								'value'  => [
									'size' => 40,
									'unit' => 'px',
								],
							],
							'padding'   => [
								'$$type' => 'size',
								'value'  => [
									'size' => 48,
									'unit' => 'px',
								],
							],
						],
						'custom_css' => null,
					],
					[
						'meta'       => [
							'breakpoint' => 'mobile',
							'state'      => null,
						],
						'props'      => [
							'font-size' => [
								'$$type' => 'size',
								'value'  => [
									'size' => 28,
									'unit' => 'px',
								],
							],
							'padding'   => [
								'$$type' => 'size',
								'value'  => [
									'size' => 24,
									'unit' => 'px',
								],
							],
						],
						'custom_css' => null,
					],
				],
			],
		];
	}
}
