<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Frontend;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Plugin;
use Elementor\Testing\Modules\AtomicWidgets\Props_Factory;
use Elementor\Widget_Base;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Files\CSS\Post;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../props-factory.php';

class Test_Atomic_Styles extends Elementor_Test_Base {
	use MatchesSnapshots;

	private Frontend $frontend;
	private Frontend $frontend_mock;

	public function set_up() {
		parent::set_up();

		$this->frontend = Plugin::$instance->frontend;
		$this->frontend_mock = $this->createMock( Frontend::class );
		Plugin::$instance->frontend = $this->frontend_mock;

		remove_all_filters( 'elementor/atomic-widgets/styles/transformers' );
		remove_all_actions( 'elementor/element/parse_css' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->frontend = $this->frontend;
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
								'font-size' => '16px',
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
								'font-weight' => 'bold',
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
								'font-size' => '18px',
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
								'font-size' => '16px',
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
								'font-size' => '18px',
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
								'color' => Props_Factory::color( 'red' ),
								'font-size' => Props_Factory::size( 16 ),
								'box-shadow' => Props_Factory::box_shadow( [
									Props_Factory::shadow(
										Props_Factory::size( 10 ),
										Props_Factory::size( 5, 'rem' ),
										Props_Factory::size( 5 ),
										Props_Factory::size( 20 ),
										Props_Factory::color( 'rgba(0, 0, 0, 0.1)' ),
										null,
									),
									Props_Factory::shadow(
										Props_Factory::size( 0 ),
										Props_Factory::size( 0 ),
										Props_Factory::size( 10 ),
										Props_Factory::size( 0 ),
										Props_Factory::color( 'blue' ),
										'inset',
									),
								] ),
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

	public function test_parse_atomic_widget_styles__enqueue_font_family() {
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
								'font-family' => 'Roboto',
							],
							'meta' => [],
						],
					],
				],
			],
		]);

		// Assert.
		$this->frontend_mock->expects( $this->once() )
			->method( 'enqueue_font' )
			->with( 'Roboto' );


		// Act.
		do_action( 'elementor/element/parse_css', $post, $element );
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
								'font-size' => '16px',
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
