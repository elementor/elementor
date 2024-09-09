<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Widget_Base extends Elementor_Test_Base {

	public function test_get_atomic_settings__returns_the_saved_value() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'test_prop' => String_Prop_Type::make()
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
				'test_prop' => String_Prop_Type::make()
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
				'test_prop' => String_Prop_Type::make()
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
					'should_transform' => Classes_Prop_Type::make()
						->default( [] ),
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
					'classes' => Classes_Prop_Type::make()
						->default( [] ),
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

	public function test_get_atomic_settings__skip_the_value_transformation_when_it_is_not_transformable() {
		// Arrange.
		$widget = $this->make_mock_widget(
			[
				'props_schema' => [
					'invalid_transformable_setting_1' => String_Prop_Type::make()->default( '' ),
					'invalid_transformable_setting_2' => String_Prop_Type::make()->default( '' ),
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
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()
					->enum( [ 'value-a', 'value-b' ] )
					->default( 'value-a' ),

				'number_prop' => Number_Prop_Type::make()
					->default( 123 ),

				'boolean_prop' => Boolean_Prop_Type::make()
					->default( true ),

				'image_prop' => Image_Prop_Type::make()
					->default( [ 'url' => 'https://images.com/image.png' ] ),
			],
			'settings' => [],
		] );

		// Act.
		$serialized = json_encode( $widget::get_props_schema() );

		// Assert.
		$this->assertJsonStringEqualsJsonString( '{
			"string_prop": {
				"type": "string",
				"default": "value-a",
				"settings": {
					"enum": ["value-a", "value-b"]
				}
			},
			"number_prop": {
				"type": "number",
				"default": 123,
				"settings": {}
			},
			"boolean_prop": {
				"type": "boolean",
				"default": true,
				"settings": {}
			},
			"image_prop": {
				"type": "image",
				"default": { "$$type": "image", "value": { "url": "https://images.com/image.png" } },
				"settings": {}
			}
		}', $serialized );
	}

	public function test_get_props_schema() {
		// Arrange,
		$schema = [
			'string_prop' => String_Prop_Type::make()
				->enum( [ 'value-a', 'value-b' ] )
				->default( 'value-a' ),
		];

		$widget = $this->make_mock_widget( [ 'props_schema' => $schema ] );

		// Act & Assert.
		$this->assertSame( $schema, $widget::get_props_schema() );
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
		$this->expectExceptionMessage( 'Prop `not-in-schema` is not defined in the schema of `test-widget`.' );

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
		$this->expectExceptionMessage( 'Prop `not-in-schema` is not defined in the schema of `test-widget`.' );

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
				'text' => String_Prop_Type::make()->default( '' ),
				'select' => String_Prop_Type::make()->default( '' ),
				'nested-text' => String_Prop_Type::make()->default( '' ),
			],
			'controls' => $controls_definitions,
		] );

		// Act.
		$controls = $widget->get_atomic_controls();

		// Assert.
		$this->assertEquals( $controls_definitions, $controls );
	}

	public function test_get_atomic_controls__schema_validation__throws_for_non_prop_type() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'non_prop_type' => 'not-a-prop-type',
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Prop `non_prop_type` must be an instance of `Prop_Type`' );

		// Act.
		$widget->get_atomic_controls();
	}

	public function test_get_atomic_controls__schema_validation__throws_for_invalid_default() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'test_prop' => String_Prop_Type::make()
					->default( 123 ),
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Default value for `test_prop` prop is invalid' );

		// Act.
		$widget->get_atomic_controls();
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
