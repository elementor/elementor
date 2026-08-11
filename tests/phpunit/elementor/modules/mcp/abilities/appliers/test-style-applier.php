<?php

namespace Elementor {
	if ( ! class_exists( 'Elementor\Utils' ) ) {
		class Utils {
			public static function generate_random_string(): string {
				return dechex( rand() );
			}

			public static function has_pro(): bool {
				return true;
			}
		}
	}
}

namespace {
	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	if ( ! function_exists( 'wp_rand' ) ) {
		function wp_rand( $min = 0, $max = 0 ) {
			return rand( (int) $min, (int) ( $max ?: PHP_INT_MAX ) );
		}
	}

	use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
	use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
	use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
	use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
	use PHPUnit\Framework\TestCase;

	class Test_Style_Applier extends TestCase {

		private array $active_breakpoints = [ 'desktop', 'mobile', 'tablet' ];

		private function make_converter( array $parse_nested_map = [], array $convert_map = [] ): Css_Converter {
			$converter = $this->createMock( Css_Converter::class );

			if ( ! empty( $parse_nested_map ) ) {
				$converter->method( 'parse_nested' )->willReturnMap( $parse_nested_map );
			} else {
				$converter->method( 'parse_nested' )
					->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => '' ] ] ] );
			}

			if ( ! empty( $convert_map ) ) {
				$converter->method( 'convert' )->willReturnMap( $convert_map );
			} else {
				$converter->method( 'convert' )
					->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );
			}

			return $converter;
		}

		private function make_applier( Css_Converter $converter ): Style_Applier {
			return new Style_Applier( $converter, $this->active_breakpoints );
		}

		public function test_apply__returns_empty_result_when_styles_is_empty() {
			// Arrange.
			$applier = $this->make_applier( $this->make_converter() );
			$node    = [ 'id' => 'elem-1', 'settings' => [], 'styles' => [] ];
			$index   = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [] );

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertEmpty( $result['warnings'] );
			$this->assertEmpty( $node['styles'] );
		}

		public function test_apply__flat_css_creates_desktop_variant_in_new_local_style() {
			// Arrange.
			$css       = 'color: red;';
			$converter = $this->make_converter(
				[ [ $css, [ 'blocks' => [ [ 'selector' => null, 'css' => $css ] ] ] ] ],
				[ [ $css, [ 'props' => [ 'color' => [ '$$type' => 'string', 'value' => 'red' ] ], 'customCss' => '', 'rejected' => [] ] ] ]
			);
			$applier = $this->make_applier( $converter );
			$node    = [ 'id' => 'elem-1', 'settings' => [], 'styles' => [] ];
			$index   = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => $css ] );

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertCount( 1, $node['styles'] );
			$style_id = array_key_first( $node['styles'] );
			$this->assertStringStartsWith( 'e-', $style_id );
			$this->assertSame( 'desktop', $node['styles'][ $style_id ]['variants'][0]['meta']['breakpoint'] );
			$this->assertArrayHasKey( 'color', $node['styles'][ $style_id ]['variants'][0]['props'] );
			$this->assertContains( $style_id, $node['settings']['classes']['value'] );
		}

		public function test_apply__pseudo_state_css_creates_hover_variant() {
			// Arrange.
			$css       = '&:hover { color: blue; }';
			$hover_css = 'color: blue;';
			$converter = $this->make_converter(
				[ [ $css, [ 'blocks' => [ [ 'selector' => null, 'css' => '' ], [ 'selector' => ':hover', 'css' => $hover_css ] ] ] ] ],
				[
					[ '',         [ 'props' => [], 'customCss' => '', 'rejected' => [] ] ],
					[ $hover_css, [ 'props' => [ 'color' => [ '$$type' => 'string', 'value' => 'blue' ] ], 'customCss' => '', 'rejected' => [] ] ],
				]
			);
			$applier = $this->make_applier( $converter );
			$node    = [ 'id' => 'elem-1', 'settings' => [], 'styles' => [] ];
			$index   = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => $css ] );

			// Assert.
			$this->assertNull( $result['error'] );
			$style_id = array_key_first( $node['styles'] );
			$variants = $node['styles'][ $style_id ]['variants'];
			$hover_variants = array_filter( $variants, fn( $v ) => ( $v['meta']['state'] ?? null ) === 'hover' );
			$this->assertCount( 1, $hover_variants );
		}

		public function test_apply__breakpoint_css_creates_mobile_variant() {
			// Arrange.
			$mobile_css = 'font-size: 1rem;';
			$converter  = $this->make_converter(
				[ [ $mobile_css, [ 'blocks' => [ [ 'selector' => null, 'css' => $mobile_css ] ] ] ] ],
				[ [ $mobile_css, [ 'props' => [ 'fontSize' => [ '$$type' => 'string', 'value' => '1rem' ] ], 'customCss' => '', 'rejected' => [] ] ] ]
			);
			$applier = $this->make_applier( $converter );
			$node    = [ 'id' => 'elem-1', 'settings' => [], 'styles' => [] ];
			$index   = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => '@media(--mobile) { ' . $mobile_css . ' }' ] );

			// Assert.
			$this->assertNull( $result['error'] );
			$style_id      = array_key_first( $node['styles'] );
			$variants      = $node['styles'][ $style_id ]['variants'];
			$mobile_vars   = array_filter( $variants, fn( $v ) => ( $v['meta']['breakpoint'] ?? null ) === 'mobile' );
			$this->assertCount( 1, $mobile_vars );
		}

		public function test_apply__patch_mode_preserves_existing_variants_for_other_breakpoints() {
			// Arrange.
			$mobile_variant = [ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'fontSize' => [ '$$type' => 'string', 'value' => '1rem' ] ], 'custom_css' => null ];
			$css            = 'color: red;';
			$converter      = $this->make_converter(
				[ [ $css, [ 'blocks' => [ [ 'selector' => null, 'css' => $css ] ] ] ] ],
				[ [ $css, [ 'props' => [ 'color' => [ '$$type' => 'string', 'value' => 'red' ] ], 'customCss' => '', 'rejected' => [] ] ] ]
			);
			$applier = $this->make_applier( $converter );
			$node    = [
				'id'       => 'elem-1',
				'settings' => [ 'classes' => [ '$$type' => 'classes', 'value' => [ 'e-existing' ] ] ],
				'styles'   => [ 'e-existing' => [ 'id' => 'e-existing', 'label' => 'local', 'type' => 'class', 'variants' => [ $mobile_variant ] ] ],
			];
			$index = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => $css ], 'patch' );

			// Assert.
			$this->assertNull( $result['error'] );
			$variants         = $node['styles']['e-existing']['variants'];
			$mobile_variants  = array_filter( $variants, fn( $v ) => ( $v['meta']['breakpoint'] ?? null ) === 'mobile' );
			$desktop_variants = array_filter( $variants, fn( $v ) => ( $v['meta']['breakpoint'] ?? null ) === 'desktop' );
			$this->assertCount( 1, $mobile_variants, 'Mobile variant must be preserved in patch mode.' );
			$this->assertCount( 1, $desktop_variants, 'Desktop variant must be added.' );
		}

		public function test_apply__replace_mode_removes_existing_variants_for_affected_breakpoints() {
			// Arrange.
			$old_desktop_variant = [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => [ '$$type' => 'string', 'value' => 'blue' ] ], 'custom_css' => null ];
			$mobile_variant      = [ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'fontSize' => [ '$$type' => 'string', 'value' => '1rem' ] ], 'custom_css' => null ];
			$css                 = 'color: red;';
			$converter           = $this->make_converter(
				[ [ $css, [ 'blocks' => [ [ 'selector' => null, 'css' => $css ] ] ] ] ],
				[ [ $css, [ 'props' => [ 'color' => [ '$$type' => 'string', 'value' => 'red' ] ], 'customCss' => '', 'rejected' => [] ] ] ]
			);
			$applier = $this->make_applier( $converter );
			$node    = [
				'id'       => 'elem-1',
				'settings' => [ 'classes' => [ '$$type' => 'classes', 'value' => [ 'e-existing' ] ] ],
				'styles'   => [ 'e-existing' => [ 'id' => 'e-existing', 'label' => 'local', 'type' => 'class', 'variants' => [ $old_desktop_variant, $mobile_variant ] ] ],
			];
			$index = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => $css ], 'replace' );

			// Assert.
			$this->assertNull( $result['error'] );
			$variants         = $node['styles']['e-existing']['variants'];
			$desktop_variants = array_filter( $variants, fn( $v ) => ( $v['meta']['breakpoint'] ?? null ) === 'desktop' );
			$mobile_variants  = array_filter( $variants, fn( $v ) => ( $v['meta']['breakpoint'] ?? null ) === 'mobile' );
			$this->assertCount( 1, $desktop_variants, 'Desktop variant must be replaced.' );
			$this->assertCount( 1, $mobile_variants, 'Mobile variant must be preserved.' );
			$desktop = array_values( $desktop_variants )[0];
			$this->assertSame( 'red', $desktop['props']['color']['value'] ?? null, 'Desktop variant must have new color.' );
		}

		public function test_apply__replace_mode_with_empty_css_wipes_all_variants() {
			// Arrange.
			$existing_variant = [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => [ '$$type' => 'string', 'value' => 'blue' ] ], 'custom_css' => null ];
			$applier          = $this->make_applier( $this->make_converter() );
			$node             = [
				'id'       => 'elem-1',
				'settings' => [ 'classes' => [ '$$type' => 'classes', 'value' => [ 'e-existing' ] ] ],
				'styles'   => [ 'e-existing' => [ 'id' => 'e-existing', 'label' => 'local', 'type' => 'class', 'variants' => [ $existing_variant ] ] ],
			];
			$index = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => '' ], 'replace' );

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertEmpty( $node['styles']['e-existing']['variants'] );
		}

		public function test_apply__invalid_css_returns_error() {
			// Arrange.
			$invalid_css = 'color: red; &:hover { unclosed';
			$converter   = $this->make_converter(
				[ [ $invalid_css, [ 'blocks' => [], 'error' => 'Unclosed brace at line 1' ] ] ]
			);
			$applier = $this->make_applier( $converter );
			$node    = [ 'id' => 'elem-1', 'settings' => [], 'styles' => [] ];
			$index   = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => $invalid_css ] );

			// Assert.
			$this->assertInstanceOf( \WP_Error::class, $result['error'] );
			$this->assertStringContainsString( 'Unclosed brace', $result['error']->get_error_message() );
		}

		public function test_apply__unknown_breakpoint_returns_error() {
			// Arrange.
			$applier = $this->make_applier( $this->make_converter() );
			$node    = [ 'id' => 'elem-1', 'settings' => [], 'styles' => [] ];
			$index   = [ 'hero-title' => &$node ];

			// Act.
			$result = $applier->apply( $index, [ 'hero-title' => '@media(--nonexistent) { color: red; }' ] );

			// Assert.
			$this->assertInstanceOf( \WP_Error::class, $result['error'] );
			$this->assertStringContainsString( 'nonexistent', $result['error']->get_error_message() );
		}

		public function test_apply__v3_maps_css_to_settings_and_falls_back_unmapped_to_custom_css() {
			// Arrange.
			$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );
			$applier = $this->make_applier( $converter );
			$node = [
				'id' => 'elem-1',
				'elType' => 'widget',
				'widgetType' => 'theme-post-title',
				'settings' => [],
				'styles' => [],
			];
			$index = [ 'post-title' => &$node ];
			$widget_configs = [
				'theme-post-title' => [
					'controls' => [
						'title_color' => [ 'type' => 'color' ],
						'typography_typography' => [ 'type' => 'typography' ],
						'typography_font_size' => [ 'type' => 'slider' ],
					],
				],
			];

			// Act.
			$result = $applier->apply(
				$index,
				[ 'post-title' => 'color: #222222; font-size: 2rem; filter: blur(2px);' ],
				'patch',
				$widget_configs
			);

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertSame( '#222222', $node['settings']['title_color'] );
			$this->assertSame( 'custom', $node['settings']['typography_typography'] );
			$this->assertSame( [ 'unit' => 'rem', 'size' => 2.0 ], $node['settings']['typography_font_size'] );
			$this->assertNotEmpty( $result['warnings'] );
			$this->assertTrue(
				(bool) array_filter(
					$result['warnings'],
					static fn( $warning ) => false !== strpos( (string) $warning, 'filter: blur(2px);' )
				)
			);

			if ( \Elementor\Utils::has_pro() ) {
				$this->assertArrayHasKey( 'custom_css', $node['settings'] );
				$this->assertStringContainsString( 'filter: blur(2px);', $node['settings']['custom_css'] );
			} else {
				$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
			}
		}

		public function test_apply__v3_replace_clears_mapped_settings_and_custom_css() {
			// Arrange.
			$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );
			$applier = $this->make_applier( $converter );
			$node = [
				'id' => 'elem-1',
				'elType' => 'widget',
				'widgetType' => 'theme-post-title',
				'settings' => [
					'title' => 'Keep me',
					'title_color' => '#111111',
					'typography_typography' => 'custom',
					'typography_font_size' => [ 'unit' => 'px', 'size' => 40 ],
					'custom_css' => 'selector { filter: blur(2px); }',
				],
				'styles' => [],
			];
			$index = [ 'post-title' => &$node ];
			$widget_configs = [
				'theme-post-title' => [
					'controls' => [
						'title_color' => [ 'type' => 'color' ],
						'typography_typography' => [ 'type' => 'typography' ],
						'typography_font_size' => [ 'type' => 'slider' ],
					],
				],
			];

			// Act.
			$result = $applier->apply(
				$index,
				[ 'post-title' => 'color: #abcdef;' ],
				'replace',
				$widget_configs
			);

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertSame( 'Keep me', $node['settings']['title'] );
			$this->assertSame( '#abcdef', $node['settings']['title_color'] );
			$this->assertArrayNotHasKey( 'typography_typography', $node['settings'] );
			$this->assertArrayNotHasKey( 'typography_font_size', $node['settings'] );
			$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
		}

		public function test_apply__v3_replace_empty_css_wipes_styles() {
			// Arrange.
			$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );
			$applier = $this->make_applier( $converter );
			$node = [
				'id' => 'elem-1',
				'elType' => 'widget',
				'widgetType' => 'theme-post-title',
				'settings' => [
					'title' => 'Keep me',
					'title_color' => '#111111',
					'custom_css' => 'selector { filter: blur(2px); }',
				],
				'styles' => [],
			];
			$index = [ 'post-title' => &$node ];
			$widget_configs = [
				'theme-post-title' => [
					'controls' => [
						'title_color' => [ 'type' => 'color' ],
					],
				],
			];

			// Act.
			$result = $applier->apply(
				$index,
				[ 'post-title' => '' ],
				'replace',
				$widget_configs
			);

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertSame( 'Keep me', $node['settings']['title'] );
			$this->assertArrayNotHasKey( 'title_color', $node['settings'] );
			$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
		}
	}
}
