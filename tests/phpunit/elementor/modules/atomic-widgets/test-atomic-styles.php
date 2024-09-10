<?php
namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Atomic_Styles;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Widget_Base;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Files\CSS\Post;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Styles extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/atomic-widgets/styles/transformers' );
		remove_all_actions( 'elementor/element/parse_css' );
	}

	public function test_parse_atomic_widget_styles__append_css_of_multiple_widgets() {
		// Arrange.
		( new Atomic_Styles() )->register_hooks();
		$post = $this->make_mock_post();
		$element_1 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style-1',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'red',
								'fontSize' => '16px',
							],
							'meta' => [],
						],
					],
				],
				[
					'id' => 'test-style-2',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'blue',
								'fontWeight' => 'bold',
							],
							'meta' => [],
						],
					],
				],
			],
		]);
		$element_2 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style-3',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'green',
								'fontSize' => '18px',
							],
							'meta' => [],
						],
					],
				],
			],
		]);

		// Act.
		do_action( 'elementor/element/parse_css', $post, $element_1 );
		do_action( 'elementor/element/parse_css', $post, $element_2 );

		// Assert.
		$this->assertMatchesSnapshot( (string) $post->get_stylesheet() );
	}

	public function test_parse_atomic_widget_styles__append_css_of_styles_with_breakpoints() {
		// Arrange.
		( new Atomic_Styles() )->register_hooks();
		$post = $this->make_mock_post();
		$element_1 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'red',
								'fontSize' => '16px',
							],
							'meta' => [
								'breakpoint' => 'mobile',
							],
						],
					],
				],
			],
		]);
		$element_2 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'blue',
								'fontSize' => '18px',
							],
							'meta' => [
								'breakpoint' => 'tablet',
							],
						],
					],
				],
			],
		]);

		// Act.
		do_action( 'elementor/element/parse_css', $post, $element_1 );
		do_action( 'elementor/element/parse_css', $post, $element_2 );

		// Assert.
		$this->assertMatchesSnapshot( (string) $post->get_stylesheet() );
	}

	public function test_parse_atomic_widget_styles__append_css_of_styles_with_transformable_values() {
		// Arrange.
		( new Atomic_Styles() )->register_hooks();
		$post = $this->make_mock_post();
		$element = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'red',
								'fontSize' => [
									'$$type' => 'size',
									'value' => [
										'unit' => 'px',
										'size' => 16,
									],
								],
							],
							'meta' => [],
						],
					],
				],
			],
		]);

		// Act.
		do_action( 'elementor/element/parse_css', $post, $element );

		// Assert.
		$this->assertMatchesSnapshot( (string) $post->get_stylesheet() );
	}

	public function test_parse_atomic_widget_styles__no_append_when_styles_are_empty() {
		// Arrange.
		( new Atomic_Styles() )->register_hooks();
		$post = $this->make_mock_post();
		$element = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [],
		]);

		// Act.
		do_action( 'elementor/element/parse_css', $post, $element );

		// Assert.
		$this->assertMatchesSnapshot( (string) $post->get_stylesheet() );
	}

	public function test_parse_atomic_widget_styles__invalid_non_atomic_widget() {
		// Arrange.
		( new Atomic_Styles() )->register_hooks();
		$post = $this->make_mock_post();
		$element = $this->mock_non_atomic_widget([
			'styles' => [
				[
					'id' => 'test-style',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'red',
								'fontSize' => '16px',
							],
							'meta' => [],
						],
					],
				],
			],
		]);

		// Act.
		do_action( 'elementor/element/parse_css', $post, $element );

		// Assert.
		$this->assertMatchesSnapshot( (string) $post->get_stylesheet() );
	}

	private function make_mock_post() {
		return new Post( 1 );
	}

	/**
	 * @param array{controls: array, props_schema: array, settings: array} $options
	 */
	private function make_mock_widget( array $options ): Atomic_Widget_Base {
		return new class( $options ) extends Atomic_Widget_Base {
			private static array $options;

			public function __construct( $options ) {
				static::$options = $options;

				parent::__construct( [
					'id' => 1,
					'settings' => $options['settings'] ?? [],
					'styles' => $options['styles'] ?? [],
					'elType' => 'widget',
					'widgetType' => 'test-widget',
				], [] );
			}

			public function get_name() {
				return 'test-widget';
			}

			protected function define_atomic_controls(): array {
				return static::$options['controls'] ?? [];
			}

			protected static function define_props_schema(): array {
				return static::$options['props_schema'] ?? [];
			}
		};
	}

	private function mock_non_atomic_widget( array $options = [] ): Widget_Base {
		return new class() extends Widget_Base {
			public function get_name() {
				return 'test-widget-invalid';
			}

			public function get_raw_data( $with_html_content = false ) {
				$settings = parent::get_raw_data( $with_html_content );
				$styles = $options['styles'] ?? [];
				$settings['styles']  = $styles;
				return $settings;
			}
		};
	}
}
