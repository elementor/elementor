<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Abilities;

use Elementor\Core\Abilities\Css_Shorthand_Parser;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Shorthand_Parser_Harness {
	use Css_Shorthand_Parser {
		css_to_props as public;
	}
}

class Test_Css_Shorthand_Parser extends Elementor_Test_Base {

	private Css_Shorthand_Parser_Harness $parser;

	public function setUp(): void {
		parent::setUp();
		$this->parser = new Css_Shorthand_Parser_Harness();
	}

	private function size( $n, string $unit = 'px' ): array {
		return [
			'$$type' => 'size',
			'value'  => [
				'size' => $n,
				'unit' => $unit,
			],
		];
	}

	private function size_auto(): array {
		return [
			'$$type' => 'size',
			'value'  => [
				'size' => 'auto',
				'unit' => 'custom',
			],
		];
	}

	private function size_custom( string $expr ): array {
		return [
			'$$type' => 'size',
			'value'  => [
				'size' => $expr,
				'unit' => 'custom',
			],
		];
	}

	private function number( $n ): array {
		return [
			'$$type' => 'number',
			'value'  => (float) $n,
		];
	}

	private function string_val( string $v ): array {
		return [
			'$$type' => 'string',
			'value'  => $v,
		];
	}

	private function color( string $v ): array {
		return [
			'$$type' => 'color',
			'value'  => $v,
		];
	}

	private function global_size_var( string $label ): array {
		return [
			'$$type' => 'global-size-variable',
			'value'  => $label,
		];
	}

	private function global_color_var( string $label ): array {
		return [
			'$$type' => 'global-color-variable',
			'value'  => $label,
		];
	}

	public function test_margin_shorthand_two_value(): void {
		$out = $this->parser->css_to_props( 'margin:12px 16px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size( 12.0 ),
					'inline-end'   => $this->size( 16.0 ),
					'block-end'    => $this->size( 12.0 ),
					'inline-start' => $this->size( 16.0 ),
				],
			],
		], $out );
	}

	public function test_margin_shorthand_three_value(): void {
		$out = $this->parser->css_to_props( 'margin:12px 16px 8px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size( 12.0 ),
					'inline-end'   => $this->size( 16.0 ),
					'block-end'    => $this->size( 8.0 ),
					'inline-start' => $this->size( 16.0 ),
				],
			],
		], $out );
	}

	public function test_margin_shorthand_four_value(): void {
		$out = $this->parser->css_to_props( 'margin:12px 16px 8px 4px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size( 12.0 ),
					'inline-end'   => $this->size( 16.0 ),
					'block-end'    => $this->size( 8.0 ),
					'inline-start' => $this->size( 4.0 ),
				],
			],
		], $out );
	}

	public function test_margin_top_becomes_partial_dimensions(): void {
		$out = $this->parser->css_to_props( 'margin-top:10px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start' => $this->size( 10.0 ),
				],
			],
		], $out );
	}

	public function test_multiple_side_specific_margins_merge(): void {
		$out = $this->parser->css_to_props( 'margin-top:10px; margin-left:4px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size( 10.0 ),
					'inline-start' => $this->size( 4.0 ),
				],
			],
		], $out );
	}

	public function test_logical_margin_block_start_is_accepted(): void {
		$out = $this->parser->css_to_props( 'margin-block-start:10px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start' => $this->size( 10.0 ),
				],
			],
		], $out );
	}

	public function test_margin_block_axis_shorthand(): void {
		$out = $this->parser->css_to_props( 'margin-block:10px 20px' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start' => $this->size( 10.0 ),
					'block-end'   => $this->size( 20.0 ),
				],
			],
		], $out );
	}

	public function test_margin_auto(): void {
		$out = $this->parser->css_to_props( 'margin:auto' );

		$this->assertSame( [
			'margin' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size_auto(),
					'inline-end'   => $this->size_auto(),
					'block-end'    => $this->size_auto(),
					'inline-start' => $this->size_auto(),
				],
			],
		], $out );
	}

	public function test_padding_calc_preserves_expression(): void {
		$out = $this->parser->css_to_props( 'padding:calc(100% - 20px)' );

		$this->assertSame( [
			'padding' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size_custom( 'calc(100% - 20px)' ),
					'inline-end'   => $this->size_custom( 'calc(100% - 20px)' ),
					'block-end'    => $this->size_custom( 'calc(100% - 20px)' ),
					'inline-start' => $this->size_custom( 'calc(100% - 20px)' ),
				],
			],
		], $out );
	}

	public function test_padding_var_resolves_to_size_variable(): void {
		$out = $this->parser->css_to_props( 'padding:var(--space-4)' );

		$ref = $this->global_size_var( 'space-4' );

		$this->assertSame( [
			'padding' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $ref,
					'inline-end'   => $ref,
					'block-end'    => $ref,
					'inline-start' => $ref,
				],
			],
		], $out );
	}

	public function test_gap_with_var(): void {
		$out = $this->parser->css_to_props( 'gap:var(--space-3)' );
		$this->assertSame( [ 'gap' => $this->global_size_var( 'space-3' ) ], $out );
	}

	public function test_color_var_resolves_to_color_variable(): void {
		$out = $this->parser->css_to_props( 'color:var(--brand-primary)' );
		$this->assertSame( [ 'color' => $this->global_color_var( 'brand-primary' ) ], $out );
	}

	public function test_positioning_top_rewrites_to_inset_block_start(): void {
		$out = $this->parser->css_to_props( 'top:0' );
		$this->assertSame( [ 'inset-block-start' => $this->size( 0.0 ) ], $out );
	}

	public function test_positioning_all_physical_sides(): void {
		$out = $this->parser->css_to_props( 'top:0;right:10px;bottom:20px;left:30px' );

		$this->assertSame( [
			'inset-block-start'  => $this->size( 0.0 ),
			'inset-inline-end'   => $this->size( 10.0 ),
			'inset-block-end'    => $this->size( 20.0 ),
			'inset-inline-start' => $this->size( 30.0 ),
		], $out );
	}

	public function test_border_radius_uniform_fills_all_corners(): void {
		$out = $this->parser->css_to_props( 'border-radius:8px' );

		$this->assertSame( [
			'border-radius' => [
				'$$type' => 'border-radius',
				'value'  => [
					'start-start' => $this->size( 8.0 ),
					'start-end'   => $this->size( 8.0 ),
					'end-end'     => $this->size( 8.0 ),
					'end-start'   => $this->size( 8.0 ),
				],
			],
		], $out );
	}

	public function test_border_top_left_radius_sets_one_corner_others_null(): void {
		$out = $this->parser->css_to_props( 'border-top-left-radius:8px' );

		$this->assertSame( [
			'border-radius' => [
				'$$type' => 'border-radius',
				'value'  => [
					'start-start' => $this->size( 8.0 ),
					'start-end'   => null,
					'end-end'     => null,
					'end-start'   => null,
				],
			],
		], $out );
	}

	public function test_flex_shorthand_three_values(): void {
		$out = $this->parser->css_to_props( 'flex:1 0 auto' );

		$this->assertSame( [
			'flex' => [
				'$$type' => 'flex',
				'value'  => [
					'flexGrow'   => $this->number( 1 ),
					'flexShrink' => $this->number( 0 ),
					'flexBasis'  => $this->size_auto(),
				],
			],
		], $out );
	}

	public function test_flex_single_numeric_defaults_basis_to_zero_px(): void {
		$out = $this->parser->css_to_props( 'flex:1' );

		$this->assertSame( [
			'flex' => [
				'$$type' => 'flex',
				'value'  => [
					'flexGrow'   => $this->number( 1 ),
					'flexShrink' => $this->number( 1 ),
					'flexBasis'  => $this->size( 0.0 ),
				],
			],
		], $out );
	}

	public function test_flex_none_keyword(): void {
		$out = $this->parser->css_to_props( 'flex:none' );

		$this->assertSame( [
			'flex' => [
				'$$type' => 'flex',
				'value'  => [
					'flexGrow'   => $this->number( 0 ),
					'flexShrink' => $this->number( 0 ),
					'flexBasis'  => $this->size_auto(),
				],
			],
		], $out );
	}

	public function test_border_width_shorthand(): void {
		$out = $this->parser->css_to_props( 'border-width:1px 2px' );

		$this->assertSame( [
			'border-width' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start'  => $this->size( 1.0 ),
					'inline-end'   => $this->size( 2.0 ),
					'block-end'    => $this->size( 1.0 ),
					'inline-start' => $this->size( 2.0 ),
				],
			],
		], $out );
	}

	public function test_border_top_width_partial(): void {
		$out = $this->parser->css_to_props( 'border-top-width:1px' );

		$this->assertSame( [
			'border-width' => [
				'$$type' => 'dimensions',
				'value'  => [
					'block-start' => $this->size( 1.0 ),
				],
			],
		], $out );
	}

	public function test_line_height_unitless(): void {
		$out = $this->parser->css_to_props( 'line-height:1.4' );
		$this->assertSame( [ 'line-height' => $this->number( 1.4 ) ], $out );
	}

	public function test_line_height_with_unit(): void {
		$out = $this->parser->css_to_props( 'line-height:24px' );
		$this->assertSame( [ 'line-height' => $this->size( 24.0 ) ], $out );
	}

	public function test_opacity_ratio_converts_to_percent(): void {
		$out = $this->parser->css_to_props( 'opacity:0.5' );
		$this->assertSame( [ 'opacity' => $this->size( 50.0, '%' ) ], $out );
	}

	public function test_opacity_percent_passes_through(): void {
		$out = $this->parser->css_to_props( 'opacity:50%' );
		$this->assertSame( [ 'opacity' => $this->size( 50.0, '%' ) ], $out );
	}

	public function test_background_color_hex(): void {
		$out = $this->parser->css_to_props( 'background:#ffffff' );

		$this->assertSame( [
			'background' => [
				'$$type' => 'background',
				'value'  => [
					'color' => $this->color( '#ffffff' ),
				],
			],
		], $out );
	}

	public function test_background_var_resolves(): void {
		$out = $this->parser->css_to_props( 'background:var(--surface)' );

		$this->assertSame( [
			'background' => [
				'$$type' => 'background',
				'value'  => [
					'color' => $this->global_color_var( 'surface' ),
				],
			],
		], $out );
	}

	public function test_box_shadow_single(): void {
		$out = $this->parser->css_to_props( 'box-shadow:0 4px 12px rgba(0,0,0,.1)' );

		$this->assertSame( [
			'box-shadow' => [
				'$$type' => 'box-shadow',
				'value'  => [
					[
						'$$type' => 'shadow',
						'value'  => [
							'hOffset' => $this->size( 0.0 ),
							'vOffset' => $this->size( 4.0 ),
							'blur'    => $this->size( 12.0 ),
							'spread'  => $this->size( 0.0 ),
							'color'   => $this->color( 'rgba(0,0,0,.1)' ),
						],
					],
				],
			],
		], $out );
	}

	public function test_box_shadow_multi_with_inset(): void {
		$out = $this->parser->css_to_props( 'box-shadow:inset 0 0 0 1px #000, 0 4px 12px rgba(0,0,0,.1)' );

		$this->assertSame( [
			'box-shadow' => [
				'$$type' => 'box-shadow',
				'value'  => [
					[
						'$$type' => 'shadow',
						'value'  => [
							'hOffset'  => $this->size( 0.0 ),
							'vOffset'  => $this->size( 0.0 ),
							'blur'     => $this->size( 0.0 ),
							'spread'   => $this->size( 1.0 ),
							'color'    => $this->color( '#000' ),
							'position' => 'inset',
						],
					],
					[
						'$$type' => 'shadow',
						'value'  => [
							'hOffset' => $this->size( 0.0 ),
							'vOffset' => $this->size( 4.0 ),
							'blur'    => $this->size( 12.0 ),
							'spread'  => $this->size( 0.0 ),
							'color'   => $this->color( 'rgba(0,0,0,.1)' ),
						],
					],
				],
			],
		], $out );
	}

	public function test_transparent_is_rewritten_to_rgba_zero(): void {
		$out = $this->parser->css_to_props( 'background-color:transparent' );
		$this->assertSame( [ 'background-color' => $this->color( 'rgba(0,0,0,0)' ) ], $out );
	}

	public function test_display_grid_string(): void {
		$out = $this->parser->css_to_props( 'display:grid' );
		$this->assertSame( [ 'display' => $this->string_val( 'grid' ) ], $out );
	}

	public function test_transform_string(): void {
		$out = $this->parser->css_to_props( 'transform:translateY(-10%)' );
		$this->assertSame( [ 'transform' => $this->string_val( 'translateY(-10%)' ) ], $out );
	}

	public function test_font_family_var_falls_back_to_string(): void {
		$out = $this->parser->css_to_props( 'font-family:var(--font-heading)' );
		$this->assertSame( [ 'font-family' => $this->string_val( 'var(--font-heading)' ) ], $out );
	}

	public function test_border_style_enum_string(): void {
		$out = $this->parser->css_to_props( 'border-style:solid' );
		$this->assertSame( [ 'border-style' => $this->string_val( 'solid' ) ], $out );
	}

	public function test_flex_direction_string(): void {
		$out = $this->parser->css_to_props( 'flex-direction:column' );
		$this->assertSame( [ 'flex-direction' => $this->string_val( 'column' ) ], $out );
	}
}
