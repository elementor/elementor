<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Widget_Base extends Elementor_Test_Base {

	public function test_get_atomic_settings__returns_the_saved_value() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'test_prop' => Atomic_Prop::make()
					->default( 'default-value' ),
			],
			'settings' => [
				'test_prop' => 'saved-value',
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'test_prop' => 'saved-value',
		], $settings );
	}

	public function test_get_atomic_settings__returns_the_default_value() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'test_prop' => Atomic_Prop::make()
					->default( 'default-value-a' ),
			],
			'settings' => [],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'test_prop' => 'default-value-a',
		], $settings );
	}

	public function test_get_atomic_settings__returns_only_settings_that_are_defined_in_the_schema() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'test_prop' => Atomic_Prop::make()
					->default( 'default-value-a' ),
			],
			'settings' => [
				'test_prop' => 'saved-value',
				'not_in_schema' => 'not-in-schema',
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'test_prop' => 'saved-value',
		], $settings );
	}

	public function test_get_atomic_settings__transforms_classes_prop() {
		// Arrange.
		$widget = $this->make_mock_widget(
			[
				'props_schema' => [
					'should_transform' => Atomic_Prop::make(),
				],
				'settings' => [
					'should_transform' => [
						'$$type' => 'classes',
						'value' => [ 'one', 'two', 'three' ],
					],
				],
			],
		);

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'should_transform' => 'one two three',
		], $settings );
	}

	public function test_get_atomic_settings__returns_empty_string_when_classes_prop_value_is_not_an_array() {
		// Arrange.
		$widget = $this->make_mock_widget(
			[
				'props_schema' => [
					'classes' => Atomic_Prop::make(),
				],
				'settings' => [
					'classes' => [
						'$$type' => 'classes',
						'value' => 'not-an-array',
					],
				],
			],
		);

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'classes' => '',
		], $settings );
	}

	public function test_get_atomic_settings__returns_null_for_transformable_setting_when_transformer_does_not_exist() {
		// Arrange.
		$widget = $this->make_mock_widget(
			[
				'props_schema' => [
					'transformer_does_not_exist' => Atomic_Prop::make(),
				],
				'settings' => [
					'transformer_does_not_exist' => [
						'$$type' => 'non_existing_type',
						'value' => [],
					],
				],
			],
		);

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertNull( $settings[ 'transformer_does_not_exist' ] );
	}

	public function test_get_atomic_settings__skip_the_value_transformation_when_it_is_not_transformable() {
		// Arrange.
		$widget = $this->make_mock_widget(
			[
				'props_schema' => [
					'invalid_transformable_setting_1' => Atomic_Prop::make(),
					'invalid_transformable_setting_2' => Atomic_Prop::make(),
				],
				'settings' => [
					'invalid_transformable_setting_1' => [
						'$$type' => 'type',
					],
					'invalid_transformable_setting_2' => [
						'$$type' => [],
						'value' => [],
					],
				],
			],
		);

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'invalid_transformable_setting_1' => [
				'$$type' => 'type',
			],
			'invalid_transformable_setting_2' => [
				'$$type' => [],
				'value' => [],
			],
		], $settings );
	}

	public function test_get_props_schema__is_serializable() {
		// Act.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'test_prop' => Atomic_Prop::make()
					->default( 'default-value-a' ),
			],
			'settings' => [],
		] );

		$serialized = json_encode( $widget::get_props_schema() );

		// Assert.
		$this->assertJsonStringEqualsJsonString( '{
			"test_prop": {
				"default": "default-value-a"
			}
		}', $serialized );
	}

	public function test_get_atomic_controls__throws_when_control_is_invalid() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [],
			'controls' => [
				new \stdClass(),
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Control must be an instance of `Atomic_Control_Base`.' );

		// Act.
		$widget->get_atomic_controls();
	}

	public function test_get_atomic_controls__throws_when_control_inside_a_section_is_not_in_schema() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [],
			'controls' => [
				Section::make()->set_items( [
					Textarea_Control::bind_to( 'not-in-schema' )
				] )
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Prop `not-in-schema` is not defined in the schema of `test-widget`. Did you forget to define it?' );

		// Act.
		$widget->get_atomic_controls();
	}

	public function test_get_atomic_controls__throws_when_top_level_control_is_not_in_schema() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [],
			'controls' => [
				Textarea_Control::bind_to( 'not-in-schema' ),
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Prop `not-in-schema` is not defined in the schema of `test-widget`. Did you forget to define it?' );

		// Act.
		$widget->get_atomic_controls();
	}

	public function test_get_atomic_controls__throws_when_control_has_empty_bind() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [],
			'controls' => [
				Textarea_Control::bind_to( '' ),
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Control is missing a bound prop from the schema.' );

		// Act.
		$widget->get_atomic_controls();
	}

	public function test_get_atomic_controls() {
		// Arrange.
		$controls_definitions = [
			// Top-level control
			Textarea_Control::bind_to( 'text' ),

			// Control in section
			Section::make()->set_items( [
				Select_Control::bind_to( 'select' ),

				// Nested section
				Section::make()->set_items( [
					Textarea_Control::bind_to( 'nested-text' ),
				] ),
			] ),
		];

		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'text' => Atomic_Prop::make(),
				'select' => Atomic_Prop::make(),
				'nested-text' => Atomic_Prop::make(),
			],
			'controls' => $controls_definitions,
		] );

		// Act.
		$controls = $widget->get_atomic_controls();

		// Assert.
		$this->assertEquals( $controls_definitions, $controls );
	}

	/**
	 * @param array{controls: array, props_schema: array, settings: array} $options
	 */
	private function make_mock_widget( array $options ) {
		return new class( $options ) extends Atomic_Widget_Base {
			private static array $options;

			public function __construct( $options ) {
				static::$options = $options;

				parent::__construct( [
					'id' => 1,
					'settings' => $options['settings'] ?? [],
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
}
