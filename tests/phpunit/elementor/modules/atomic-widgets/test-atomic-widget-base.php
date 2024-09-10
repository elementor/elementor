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
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Widget_Base extends Elementor_Test_Base {

	/**
	 * @dataProvider get_atomic_settings_data_provider
	 */
	public function test_get_atomic_settings( $prop_types, $settings, $result ) {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => $prop_types,
			'settings' => $settings,
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( $result, $settings );
	}

	public function get_atomic_settings_data_provider() {
		return [
			'basic' => [
				'prop_types' => [
					'text' => String_Prop_Type::make()->default( 'The greatest text' ),
					'tag' => String_Prop_Type::make()->default( 'h2' ),
				],
				'settings' => [
					'text' => 'This text is more great than the greatest text',
					'invalid_prop' => 'This prop is not in the schema',
				],
				'result' => [
					'text' => 'This text is more great than the greatest text',
					'tag' => 'h2',
				],
			],
			'cannot transform value' => [
				'prop_types' => [
					'text' => String_Prop_Type::make()->default( 'Not transformable' ),
				],
				'settings' => [
					'text' => [
						'$$type' => 'not_transformable',
						'value' => 'Not transformable',
					],
				],
				'result' => [
					'text' => null,
				],
			],
			'transform classes' => [
				'prop_types' => [
					'classes' => Classes_Prop_Type::make()->default( [] ),
					'inner_classes' => Classes_Prop_Type::make()->default( [] ),
					'outer_classes' => Classes_Prop_Type::make()->default( [] ),
				],
				'settings' => [
					'classes' => [
						'$$type' => 'classes',
						'value' => [ 'one', 'two', 'three' ],
					],
					'outer_classes' => [
						'$$type' => 'classes',
						'value' => 111, // Invalid value for classes
					],
				],
				'result' => [
					'classes' => 'one two three',
					'inner_classes' => '',
					'outer_classes' => null,
				],
			],
		];
	}

	public function test_get_props_schema__is_serializable() {
		// Arrange.
		remove_all_filters( 'elementor/atomic-widgets/props-schema' );

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
				"type": {
					"key": "string",
					"default": "value-a",
					"settings": {
						"enum": ["value-a", "value-b"]
					}
				},
				"additional_types": []
			},
			"number_prop": {
				"type": {
					"key": "number",
					"default": 123,
					"settings": {}
				},
				"additional_types": []
			},
			"boolean_prop": {
				"type": {
					"key": "boolean",
					"default": true,
					"settings": {}
				},
				"additional_types": []
			},
			"image_prop": {
				"type": {
					"key": "image",
					"default": { "$$type": "image", "value": { "url": "https://images.com/image.png" } },
					"settings": {}
				},
				"additional_types": []
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

	public function test_get_atomic_widget_sanitized_settings__removes_non_existing_fields() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
				'number_prop' => Number_Prop_Type::make()->default( 0 ),
				'boolean_prop' => Boolean_Prop_Type::make()->default( false ),
			],
			'settings' => [
				'string_prop' => 'valid-string',
				'number_prop' => 123,
				'boolean_prop' => true,
				'invalid_prop' => 'invalid-value',
			],
		] );

		// Act.
		$sanitized_settings = $widget::sanitize_schema( $widget::get_props_schema(), $widget->get_atomic_settings() );

		// Assert.
		$this->assertSame( [
			'string_prop' => 'valid-string',
			'number_prop' => 123,
			'boolean_prop' => true,
		], $sanitized_settings );
	}

	public function test_get_atomic_widget_sanitized_settings__removes_invalid_values() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
				'number_prop' => Number_Prop_Type::make()->default( 0 ),
				'boolean_prop' => Boolean_Prop_Type::make()->default( false ),
				'invalid_string_prop' => String_Prop_Type::make()->default( '' ),
				'invalid_number_prop' => Number_Prop_Type::make()->default( 0 ),
				'invalid_boolean_prop' => Boolean_Prop_Type::make()->default( false ),
			],
			'settings' => [
				'string_prop' => 'valid-string',
				'number_prop' => 123,
				'boolean_prop' => true,
				'invalid_string_prop' => 123,
				'invalid_number_prop' => 'invalid-number',
				'invalid_boolean_prop' => 'invalid-boolean',
			],
		] );

		// Act.
		$sanitized_settings = $widget::sanitize_schema( $widget::get_props_schema(), $widget->get_atomic_settings() );

		// Assert.
		$this->assertSame( [
			'string_prop' => 'valid-string',
			'number_prop' => 123,
			'boolean_prop' => true,
		], $sanitized_settings );
	}

	public function test_get_atomic_widget_sanitized_settings__throws_on_sanitization_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'mock_prop' => $this->make_mock_prop_type()::make()->default( '' ),
			],
			'settings' => [
				'mock_prop' => 'valid-value',
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessageMatches( '/Error while sanitizing `mock_prop` prop/' );

		// Act.
		$widget::sanitize_schema( $widget::get_props_schema(), $widget->get_atomic_settings() );
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

	private function make_mock_prop_type() {
		return new class() extends Prop_Type {
			public static function get_key(): string {
				return 'mock-prop-type';
			}

			public function validate( $value ): void {}

			public function sanitize( $value ): void {
				throw new \Exception( 'Throwing sanitization exception.' );
			}
		};
	}
}
