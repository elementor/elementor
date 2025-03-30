<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
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

class Test_Atomic_Widget_Base_Styles extends Elementor_Test_Base {
	private Widgets_Manager $widgets_manager;
	private MockObject $widgets_manager_mock;
	private Elements_Manager $elements_manager;
	private MockObject $elements_manager_mock;

	public function set_up() {
		parent::set_up();

		$this->widgets_manager = Plugin::$instance->widgets_manager;
		$this->widgets_manager_mock = $this->getMockBuilder( Widgets_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_widget_types' ] )->getMock();
		Plugin::$instance->widgets_manager = $this->widgets_manager_mock;

		$this->elements_manager = Plugin::$instance->elements_manager;
		$this->elements_manager_mock = $this->getMockBuilder( Elements_Manager::class )->disableOriginalConstructor()->onlyMethods( [ 'get_element_types' ] )->getMock();
		Plugin::$instance->elements_manager = $this->elements_manager_mock;

		remove_all_actions( 'elementor/css-file/post/parse' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->widgets_manager = $this->widgets_manager;
		Plugin::$instance->elements_manager = $this->elements_manager;
	}

	public function test_it__inject_elements_base_styles() {
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

		$this->widgets_manager_mock->method( 'get_widget_types' )->willReturn( [ $widget ] );
		$this->elements_manager_mock->method( 'get_element_types' )->willReturn( [] );

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		// Act
		$post_css = Post::create( $kit->get_id() );

		// Assert
		$css = $post_css->get_content();
		$this->assertStringContainsString( '.elementor .test-widget-base{font-family:Poppins;color:red;}', $css );
	}

	public function test_it__enqueues_fonts() {
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
					->add_variant( Style_Variant::make()
						->set_breakpoint( 'mobile' )
						->add_prop( 'font-family', String_Prop_Type::generate( 'Inter' ) )
					)
					->add_variant( Style_Variant::make()
						->set_breakpoint( 'tablet' )
						->add_prop( 'font-family', String_Prop_Type::generate( 'Inter' ) )
					)
			]
		] );

		$this->widgets_manager_mock->method( 'get_widget_types' )->willReturn( [ $widget ] );
		$this->elements_manager_mock->method( 'get_element_types' )->willReturn( [] );

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		// Act
		$post_css = Post::create( $kit_id );

		// Assert
		$post_css->get_content();

		$this->assertSame( [ 'Poppins', 'Inter' ], $post_css->get_fonts() );
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
