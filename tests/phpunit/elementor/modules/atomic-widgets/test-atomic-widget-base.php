<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\DynamicTags\Data_Tag;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Widget_Base extends Elementor_Test_Base {

	/**
	 * @dataProvider get_atomic_settings_data_provider
	 */
	public function test_get_atomic_settings( $args, $arrange_cb = null ) {
		// Arrange.
		$cleanup = $arrange_cb ? $arrange_cb() : fn() => null;

		$widget = $this->make_mock_widget( [
			'props_schema' => $args['prop_types'],
			'settings' => $args['settings'],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( $args['result'], $settings );

		$cleanup();
	}

	public function get_atomic_settings_data_provider() {
		return [
			'basic' => [
				'args' => [
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
				]
			],
			'cannot transform value' => [
				'args' => [
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
				]
			],
			'transform classes' => [
				'args' => [
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
			],
			'transform dynamic' => [
				'args' => [
					'prop_types' => [
						'text' => String_Prop_Type::make()->default( 'Cool cool cool' ),
						'text_2' => String_Prop_Type::make(),
						'invalid_name' => String_Prop_Type::make(),
						'invalid_settings' => String_Prop_Type::make(),
					],
					'settings' => [
						'text' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'dynamic-tag',
								'settings' => [
									'before' => 'Before text - '
								],
							],
						],
						'text_2' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'not-exist-dynamic-tag',
								'settings' => []
							],
						],
						'invalid_name' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 123,
								'settings' => []
							],
						],
						'invalid_settings' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'dynamic-tag',
								'settings' => 'Invalid Before - ',
							],
						],
					],
					'result' => [
						'text' => 'Before text - Dynamic tag content',
						'text_2' => null,
						'invalid_name' => null,
						'invalid_settings' => null,
					],
				],
				'arrange_cb' => function() {
					Plugin::$instance->dynamic_tags->register(
						new class() extends Tag {
							public function get_name() { return 'dynamic-tag'; }
							public function get_group() { return 'dynamic'; }
							public function get_categories() { return [ 'text' ]; }
							public function get_title() { return 'Dynamic Tag'; }
							public function get_content( array $options = [] ) {
								$settings = $this->get_settings();

								return "{$settings['before']}Dynamic tag content";
							}
						}
					);

					return fn() => Plugin::$instance->dynamic_tags->unregister( 'dynamic-tag' );
				},
			]
		];
	}

	public function test_get_atomic_settings__transforms_image_prop_recursively__default() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'image' => Image_Prop_Type::make()->default_url( 'https://example.com/default-image.jpg' ),
			],
			'settings' => [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'size' => 'medium',
					],
				],
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'src' => 'https://example.com/default-image.jpg',
		], $settings['image'] );
	}

	public function test_get_atomic_settings__transforms_image_prop_recursively__only_url() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'image' => Image_Prop_Type::make(),
			],
			'settings' => [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => [
								'id' => null,
								'url' => 'https://example.com/image.jpg',
							],
						],
						'size' => 'medium',
					],
				],
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( [
			'src' => 'https://example.com/image.jpg',
		], $settings['image'] );
	}

	public function test_get_atomic_settings__transforms_image_prop_recursively__only_id() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', function() {
			return [
				'https://example.com/image.jpg',
				100,
				200,
			];
		} );

		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'image' => Image_Prop_Type::make(),
			],
			'settings' => [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => [
								'id' => 123,
								'url' => null,
							],
						],
						'size' => 'medium',
					],
				],
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( 'https://example.com/image.jpg', $settings['image']['src'] );
		$this->assertSame( 100, $settings['image']['width'] );
		$this->assertSame( 200, $settings['image']['height'] );
	}

	public function test_get_atomic_settings__transforms_image_prop_recursively__invalid_id() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'image' => Image_Prop_Type::make(),
			],
			'settings' => [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => [
								'id' => -1,
								'url' => null,
							],
						],
						'size' => 'medium',
					],
				],
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertNull( $settings['image'] );
	}

	public function test_get_atomic_settings__transforms_image_prop_recursively__no_id_or_url() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'image' => Image_Prop_Type::make(),
			],
			'settings' => [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => [
								'id' => null,
								'url' => null,
							],
						],
						'size' => 'medium',
					],
				],
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertNull( $settings['image'] );
	}

	public function test_get_atomic_settings__transforms_image_prop_recursively__dynamic_src() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', function() {
			return [
				'https://example.com/image.jpg',
				100,
				200,
			];
		} );

		$dynamic_tag = new class extends Data_Tag {
			public function get_name() {
				return 'test-image-dynamic';
			}

			public function get_title() {
				return 'Test Image Dynamic';
			}

			public function get_categories() {
				return [
					'image',
				];
			}

			public function get_group() {
				return 'basic';
			}

			protected function get_value( array $options = [] ) {
				return [
					'id' => 123,
					'url' => null,
				];
			}
		};

		Plugin::$instance->dynamic_tags->register( $dynamic_tag );

		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'image' => Image_Prop_Type::make(),
			],
			'settings' => [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'test-image-dynamic',
							],
						],
						'size' => 'medium',
					],
				],
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertSame( 'https://example.com/image.jpg', $settings['image']['src'] );
		$this->assertSame( 100, $settings['image']['width'] );
		$this->assertSame( 200, $settings['image']['height'] );

		// Cleanup.
		Plugin::$instance->dynamic_tags->unregister( 'test-image-dynamic' );
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
					->default_url( 'https://example.com/image.jpg' )
					->default_id( 123 )
					->default_size( 'full' ),
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
					"default": {
						"$$type": "image",
						"value": {
							"src": {
								"$$type": "image-src",
								"value": {
									"id": 123,
									"url": "https://example.com/image.jpg"
								}
							},
							"size": "full"
						}
					},
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

	public function test_get_data_for_save() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
				'number_prop' => Number_Prop_Type::make()->default( 0 ),
				'boolean_prop' => Boolean_Prop_Type::make()->default( false ),
				'in_schema_not_in_settings' => String_Prop_Type::make()->default( '' ),
				'not_a_prop_type' => 'not-a-prop-type',
			],
			'settings' => [
				'string_prop' => 'valid-string',
				'number_prop' => 123,
				'boolean_prop' => true,
				'not_in_schema' => 'not-in-schema',
				'not_a_prop_type' => 'not-a-prop-type',
			],
		] );

		// Act.
		$data_for_save = $widget->get_data_for_save();

		// Assert.
		$this->assertSame( [
			'string_prop' => 'valid-string',
			'number_prop' => 123,
			'boolean_prop' => true,
		], $data_for_save['settings'] );
	}

	public function test_get_data_for_save__throws_on_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'mock_prop_1' => String_Prop_Type::make()->default( '' ),
				'mock_prop_2' => Number_Prop_Type::make()->default( 0 ),
			],
			'settings' => [
				'mock_prop_1' => 123,
				'mock_prop_2' => 'not-a-number',
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Settings validation failed. Invalid keys: mock_prop_1, mock_prop_2' );

		// Act.
		$widget->get_data_for_save();
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
}
