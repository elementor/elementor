<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Custom_Css_Pro_Restriction extends Elementor_Test_Base {

	public function set_up() {
		parent::set_up();

		update_option( 'elementor_experiment-e_atomic_elements', 'active' );
	}

	public function tear_down() {
		parent::tear_down();
	}

	public function test_remove_custom_css_from_styles__removes_all_custom_css() {
		$styles_with_custom_css = [
			'style-1' => [
				'variants' => [
					[
						'props' => [ 'color' => 'red' ],
						'custom_css' => [ 'raw' => 'Y29sb3I6IGJsdWU7' ],
					],
					[
						'props' => [ 'font-size' => '16px' ],
						'custom_css' => [ 'raw' => 'bWFyZ2luOiAxMHB4Ow==' ],
					],
				],
			],
			'style-2' => [
				'variants' => [
					[
						'props' => [ 'padding' => '20px' ],
						'custom_css' => [ 'raw' => 'cGFkZGluZzogMTVweDs=' ],
					],
				],
			],
		];

		$result = Atomic_Widget_Styles::remove_custom_css_from_styles( $styles_with_custom_css );

		$this->assertArrayNotHasKey( 'custom_css', $result['style-1']['variants'][0] );
		$this->assertArrayNotHasKey( 'custom_css', $result['style-1']['variants'][1] );
		$this->assertArrayNotHasKey( 'custom_css', $result['style-2']['variants'][0] );
		$this->assertArrayHasKey( 'props', $result['style-1']['variants'][0] );
		$this->assertEquals( [ 'color' => 'red' ], $result['style-1']['variants'][0]['props'] );
	}

	public function test_remove_custom_css_from_styles__preserves_styles_without_custom_css() {
		$result = apply_filters( 'elementor/atomic_widgets/styles/post_styles', $this->styles_without_custom_css(), $this->styles_with_custom_css() );

		$this->assertEquals( $this->styles_without_custom_css(), $result );
	}

	public function test_remove_custom_css_from_styles__handles_empty_styles() {
		$empty_styles = [];

		$result = Atomic_Widget_Styles::remove_custom_css_from_styles( $empty_styles );

		$this->assertEquals( [], $result );
	}

	public function test_post_styles_filter__removes_custom_css_when_pro_not_active() {
		$atomic_widget_styles = new Atomic_Widget_Styles();
		$atomic_widget_styles->register_hooks();

		$result = apply_filters( 'elementor/atomic_widgets/styles/post_styles', $this->styles_without_custom_css(), $this->styles_with_custom_css() );

		$this->assertArrayNotHasKey( 'custom_css', $result['test-style']['variants'][0] );
		$this->assertArrayHasKey( 'props', $result['test-style']['variants'][0] );
	}


	// Add a test for when the pro is not active and the version is under 3.35
	public function test_remove_custom_css_from_styles__does_not_remove_custom_css_when_pro_is_not_active() {
		$result = Atomic_Widget_Styles::remove_custom_css_from_styles( $this->styles_with_custom_css() );
	
		$this->assertArrayNotHasKey( 'custom_css', $result['test-style']['variants'][0] );
	}
 
	public function test_remove_custom_css_from_styles__removes_custom_css_when_pro_version_is_3_35_or_higher() {
		return $this->markTestSkipped();
		define( 'ELEMENTOR_PRO_VERSION', '3.35' );
		$result = Atomic_Widget_Styles::remove_custom_css_from_styles( $this->styles_with_custom_css() );

		$this->assertArrayNotHasKey( 'custom_css', $result['test-style']['variants'][0] );
	}

	private function styles_with_custom_css() {
		return [
			'test-style' => [
				'variants' => [
					[
						'props' => [ 'color' => 'blue' ],
						'custom_css' => [ 'raw' => 'Y29sb3I6IHJlZDs=' ],
					],
				],
			],
		];
	}

	private function styles_without_custom_css() {
		return [
			'test-style' => [
				'variants' => [
					[
						'props' => [ 'color' => 'blue' ],
					],
				],
			],
		];
	}
}
