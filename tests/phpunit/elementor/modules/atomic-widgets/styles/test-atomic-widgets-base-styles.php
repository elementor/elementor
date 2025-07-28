<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Cache_Validity;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Base_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Plugin;
use Elementor\Testing\Modules\AtomicWidgets\Mock_Widget;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Framework\MockObject\MockObject;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Widgets_Base_Styles extends Elementor_Test_Base {
	private Widgets_Manager $widgets_manager;
	private MockObject $widgets_manager_mock;
	private Elements_Manager $elements_manager;
	private MockObject $elements_manager_mock;
	private MockObject $mock_styles_manager;

	public function set_up() {
		parent::set_up();

		$this->widgets_manager = Plugin::$instance->widgets_manager;
		$this->widgets_manager_mock = $this->getMockBuilder( Widgets_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_widget_types' ] )->getMock();
		Plugin::$instance->widgets_manager = $this->widgets_manager_mock;

		$this->elements_manager = Plugin::$instance->elements_manager;
		$this->elements_manager_mock = $this->getMockBuilder( Elements_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_element_types' ] )->getMock();
		Plugin::$instance->elements_manager = $this->elements_manager_mock;

		$this->mock_styles_manager = $this->createMock( Atomic_Styles_Manager::class );


		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->widgets_manager = $this->widgets_manager;
		Plugin::$instance->elements_manager = $this->elements_manager;
	}

	public function test_register_styles__registers_styles_for_atomic_widgets() {
		// Arrange
		( new Atomic_Widget_Base_Styles() )->register_hooks();

		$widget = $this->make_mock_widget( [
			'base_styles' => [
				'base' => Style_Definition::make()
					->add_variant(
						Style_Variant::make()
							->add_prop( 'color', Color_Prop_Type::generate( 'red' ) )
							->add_prop( 'font-family', String_Prop_Type::generate( 'Poppins' ) )
					)
			]
		] );

		$element = $this->make_mock_widget( [
			'base_styles' => [
				'base' => Style_Definition::make()
					->add_variant(
						Style_Variant::make()
							->add_prop( 'color', Color_Prop_Type::generate( 'blue' ) )
							->add_prop( 'font-size', String_Prop_Type::generate( '16px' ) )
					)
			]
		] );

		$this->widgets_manager_mock->method( 'get_widget_types' )->willReturn( [ $widget ] );
		$this->elements_manager_mock->method( 'get_element_types' )->willReturn( [ $element ] );

		$this->mock_styles_manager
			->expects($this->once())
			->method('register')
			->with(
				Atomic_Widget_Base_Styles::STYLES_KEY,
				$this->callback(function($callback) use ($widget, $element) {
					$styles = $callback([1]);

					$expected = array_merge(
						array_values( $widget->get_base_styles() ),
						array_values( $element->get_base_styles() )
					);

					$this->assertEquals($expected, $styles);
					return true;
				})
			);

		// Act
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_styles_manager );
	}

	public function test_cache_invalidation_on_global_cache_clear() {
		// Arrange.
		( new Atomic_Widget_Base_Styles() )->register_hooks();

		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ Atomic_Widget_Base_Styles::STYLES_KEY ] );

		// Assert.
		$this->assertTrue( $cache_validity->is_valid( [ Atomic_Widget_Base_Styles::STYLES_KEY ] ) );

		// Act.
		do_action('elementor/core/files/clear_cache' );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid( [ Atomic_Widget_Base_Styles::STYLES_KEY ] ) );
	}

	/**
	 * @param array{controls: array, props_schema: array, settings: array} $options
	 */
	public static function make_mock_widget( array $options ): Atomic_Widget_Base {
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

			public static function get_element_type(): string {
				return 'test-widget';
			}

			protected function define_atomic_controls(): array {
				return static::$options['controls'] ?? [];
			}

			protected static function define_props_schema(): array {
				return static::$options['props_schema'] ?? [];
			}

			public function define_base_styles(): array {
				return static::$options['base_styles'] ?? [];
			}
		};
	}
}
