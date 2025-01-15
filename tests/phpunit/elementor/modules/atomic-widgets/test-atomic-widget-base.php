<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\DynamicTags\Data_Tag;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
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
						'link' => Link_Prop_Type::make(),
					],
					'settings' => [
						'text' => [ '$$type' => 'string', 'value' => 'This text is more great than the greatest text'],
						'invalid_prop' => [ '$$type' => 'string', 'value' => 'This prop is not in the schema'],
						'link' => [
							'$$type' => 'link',
							'value' => [
								'href' => 'https://elementor.com',
								'isTargetBlank' => true,
							],
						],
					],
					'result' => [
						'text' => 'This text is more great than the greatest text',
						'tag' => 'h2',
						'link' => [
							'href' => 'https://elementor.com',
							'target' => '_blank',
						],
					],
				]
			],
			'support_disabled' => [
				'args' => [
					'prop_types' => [
						'non_disabled_prop' => String_Prop_Type::make(),
						'disabled_prop' => String_Prop_Type::make(),
					],
					'settings' => [
						'non_disabled_prop' => [
							'$$type' => 'string',
							'disabled' => false,
							'value' => 'Awesome!'
						],
						'disabled_prop' => [
							'$$type' => 'string',
							'disabled' => true,
							'value' => 'Should be null'
						]
					],
					'result' => [
						'non_disabled_prop' => 'Awesome!',
						'disabled_prop' => null,
					]
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
						'size' => [ '$$type' => 'string', 'value' => 'medium' ],
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
						'size' => [ '$$type' => 'string', 'value' => 'medium' ],
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
						'size' => [ '$$type' => 'string', 'value' => 'medium' ],
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
						'size' => [ '$$type' => 'string', 'value' => 'medium' ],
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
						'size' => [ '$$type' => 'string', 'value' => 'medium' ],
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
						'size' => [ '$$type' => 'string', 'value' => 'medium' ],
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

		$schema = [
			'string_prop' => String_Prop_Type::make()
				->enum( [ 'value-a', 'value-b' ] )
				->default( 'value-a' ),

			'number_prop' => Number_Prop_Type::make()
				->default( 123 ),

			'boolean_prop' => Boolean_Prop_Type::make()
				->default( true ),

			'image_prop' => Image_Prop_Type::make()
				->default_url( 'https://example.com/image.jpg' )
				->default_size( 'full' ),

			'classes_prop' => Classes_Prop_Type::make(),
		];

		$widget = $this->make_mock_widget( [
			'props_schema' => $schema,
			'settings' => [],
		] );

		// Act.
		$json = json_decode( json_encode( $widget::get_props_schema() ), true );

		// Assert.
		$keys = [
			'string_prop',
			'number_prop',
			'boolean_prop',
			'image_prop',
			'classes_prop',
		];

		$this->assertEqualSets( $keys, array_keys( $json ) );

		foreach ( $keys as $key ) {
			$this->assertEquals( $json[$key]['kind'], $schema[$key]::KIND );
			$this->assertEquals( $json[$key]['key'], $schema[$key]::get_key() );
			$this->assertEquals( $json[$key]['default'], $schema[$key]->get_default() );
			$this->assertEquals( $json[$key]['settings'], $schema[$key]->get_settings() );
		}
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
		$widget_styles = [
			's-1234' => [
				'id' => 's-1234',
				'type' => 'class',
				'label' => 'My Class',
				'variants' => [
					[
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'red',
							],
							'font-size' => [
								'$$type' => 'size',
								'value' => [
									'unit' => 'px',
									'size' => 16,
								],
							],
							'padding' => [
								'$$type' => 'linked-dimensions',
								'value' => [
									'top' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 0,
										],
									],
									'right' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 0,
										],
									],
								],
							],
							'border-radius' => [
								'$$type' => 'border-radius',
								'value' => [
									'top-left' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 0,
										],
									],
									'top-right' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 0,
										],
									],
								],
							],
							'border-width' => [
								'$$type' => 'border-width',
								'value' => [
									'top' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 0,
										],
									],
									'right' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 0,
										],
									],
								],
							],
							'-webkit-text-stroke' => [
								'$$type' => 'stroke',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '#ff0000',
									],
									'width' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 10,
										],
									],
								],
							],
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '#000000',
									],
								],
							],
						],
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
					],
				],
			]
		];

		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
				'number_prop' => Number_Prop_Type::make()->default( 0 ),
				'boolean_prop' => Boolean_Prop_Type::make()->default( false ),
				'in_schema_not_in_settings' => String_Prop_Type::make()->default( '' ),
				'not_a_prop_type' => 'not-a-prop-type',
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
				'number_prop' => [ '$$type' => 'number', 'value' => 123 ],
				'boolean_prop' => [ '$$type' => 'boolean', 'value' => true ],
				'not_in_schema' => [ '$$type' => 'string', 'value' => 'not-in-schema' ],
				'not_a_prop_type' => [ '$$type' => 'string', 'value' => 'not-a-prop-type' ],
			],
			'styles' => $widget_styles
		] );

		// Act.
		$data_for_save = $widget->get_data_for_save();

		// Assert.
		$this->assertSame( [
			'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			'number_prop' => [ '$$type' => 'number', 'value' => 123 ],
			'boolean_prop' => [ '$$type' => 'boolean', 'value' => true ],
		], $data_for_save['settings'] );

		$this->assertTrue( $widget_styles == $data_for_save['styles'] );
	}

	public function test_get_data_for_save__sanitize_settings() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
				'number_prop' => Number_Prop_Type::make()->default( 0 ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => '<b>invalid HTML string</b>' ],
				'number_prop' => [ '$$type' => 'number', 'value' => '123' ],
			],
		] );

		// Act.
		$data_for_save = $widget->get_data_for_save();

		// Assert.
		$this->assertSame( [
			'string_prop' => [ '$$type' => 'string', 'value' => 'invalid HTML string' ],
			'number_prop' => [ '$$type' => 'number', 'value' => 123 ],
		], $data_for_save['settings'] );
	}

	public function test_get_data_for_save__throws_on_styles_size_prop_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'font-size' => [ '$$type' => 'string', 'value' => 'not-a-size' ],
								'width' => [ // Missing unit
									'$$type' => 'size',
									'value' => [ 'size' => 16 ],
								],
								'height' => [ // Missing size
									'$$type' => 'size',
									'value' => [ 'unit' => 'px' ],
								],
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: width, height, font-size' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_meta_state_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'invalid-state',
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: meta' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_meta_breakpoint_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [],
							'meta' => [
								'breakpoint' => [ 'invalid-breakpoint' ],
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: meta' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_id_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [
					'$$type' => 'string',
					'value' => 'valid-string'
				],
			],
			'styles' => [
				'1234' => [
					'id' => 12344,
					'type' => 'class',
					'variants' => [
						[
							'props' => [],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: id' );

		// Act.
		$data = $widget->get_data_for_save();

		// Assert.
		$this->assertSame($data['styles']['1234'], []);
	}

	public function test_get_data_for_save__throws_on_styles_type_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [
					'$$type' => 'string',
					'value' => 'valid-string'
				],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'invalid-type',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: type' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_label_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [
					'$$type' => 'string',
					'value' => 'valid-string'
				]
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'variants' => [
						[
							'props' => [],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: label' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_linked_dimensions_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'padding' => [
									'$$type' => 'linked-dimensions',
									'value' => [
										'top' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => 14
											]
										],
										'right' => 'not-a-size',
										'bottom' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => 14
											]
										],
										'left' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => 14
											]
										],
									]
								],
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: padding' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_border_radius_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'border-radius' => [
									'$$type' => 'border-radius',
									'value' => [
										'top-left' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => 0,
											],
										],
										'top-right' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => 0,
											],
										],
										'bottom-left' => 'not-a-size',
									],
								]
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: border-radius' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_border_width_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'border-width' => [
									'$$type' => 'border-width',
									'value' => [
										'top' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => '14'
											]
										],
										'right' => 'not-a-size',
										'bottom' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => '14'
											]
										],
										'left' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => '14'
											]
										],
									]
								]
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: border-width' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_color_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'color' => 'not-a-color',
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: color' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_settings_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'mock_prop_1' => String_Prop_Type::make()->default( '' ),
				'mock_prop_2' => Number_Prop_Type::make()->default( 0 ),
			],
			'settings' => [
				'mock_prop_1' => [ '$$type' => 'number', 'value' => 123 ],
				'mock_prop_2' => [ '$$type' => 'string', 'value' => 'not-a-number' ],
			],
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Settings validation failed. Invalid keys: mock_prop_1, mock_prop_2' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_stroke_prop_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'-webkit-text-stroke' => [
									'$$type' => 'stroke',
									'value' => [
										'color' => null,
										'width' => [
											'$$type' => 'size',
											'value' => [
												'unit' => 'px',
												'size' => 'test',
											],
										],
									],
								],
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: -webkit-text-stroke' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_background_color_overlay_prop_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'string_prop' => String_Prop_Type::make()->default( '' ),
			],
			'settings' => [
				'string_prop' => [ '$$type' => 'string', 'value' => 'valid-string' ],
			],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'type' => 'class',
					'label' => 'My Class',
					'variants' => [
						[
							'props' => [
								'background' => [
									'$$type' => 'background',
									'value' => [
										'background-overlay' => [
											'$$type' => 'background-overlay',
											'value' => [
												[
													'$$type' => 'background-color-overlay',
													'value' => 4,
												],
												[
													'$$type' => 'background-image-overlay',
													'value' => [
														'image-src' => [
															'$$type' => 'image-src',
															'value' => [
																'id' => [
																	'$$type' => 'image-attachment-id',
																	'value' => 3,
																],
																'url' => null
															],
														]
													]
												],
											],
										],

										'color' => [
											'$$type' => 'color',
											'value' => 'red',
										],
									],
								],
							],

							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed. Invalid keys: background' );

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
}
