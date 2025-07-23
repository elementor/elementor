<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
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
		$cleanup = $arrange_cb ? $arrange_cb() : null;

		$widget = $this->make_mock_widget( [
			'props_schema' => $args['prop_types'],
			'settings' => $args['settings'],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();
		array_pop( $settings ); // remove common settings

		// Assert.
		$this->assertSame( $args['result'], $settings );

		if ( $cleanup ) {
			$cleanup();
		}
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
								'destination' => [
									'$$type' => 'url',
									'value' => 'https://elementor.com',
								],
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
							'value' => [ 'one', 'two', 'three', null ],
						],
						'outer_classes' => [
							'$$type' => 'classes',
							'value' => 111, // Invalid value for classes
						],
					],
					'result' => [
						'classes' => [ 'one', 'two', 'three' ],
						'inner_classes' => [],
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
									'before' => [
										'$$type' => 'string',
										'value' => 'Before text - ',
									],
									'not-in-schema' => [
										'$$type' => 'string',
										'value' => 'Not in schema',
									],
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
			],
			'transform image' => [
				'args' => [
					'prop_types' => [
						'image' => Image_Prop_Type::make()->default_url( 'https://example.com/default-image.jpg' ),
						'just_default_image' => Image_Prop_Type::make()->default_url( 'https://example.com/default-image-2.jpg' ),
						'only_url_image' => Image_Prop_Type::make()->default_url( 'https://example.com/default-image-3.jpg' ),
						'image_with_attachment' => Image_Prop_Type::make()->default('https://example.com/default-image-4.jpg' )
					],
					'settings' => [
						'image' => [
							'$$type' => 'image',
							'value' => [
								'size' => [ '$$type' => 'string', 'value' => 'medium' ],
							],
						],
						'only_url_image' => [
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
						'image_with_attachment' => [
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
					'result' => [
						'image' => [
							'src' => 'https://example.com/default-image.jpg',
						],
						'just_default_image' => [
							'src' => 'https://example.com/default-image-2.jpg',
						],
						'only_url_image' => [
							'src' => 'https://example.com/image.jpg',
						],
						'image_with_attachment' => [
							'src' => 'https://example.com/image.jpg',
							'width' => 100,
							'height' => 200,
							'srcset' => false,
							'alt' => '',
						],
					],
				],
				'arrange_cb' => function() {
					add_filter( 'wp_get_attachment_image_src', function() {
						return [
							'https://example.com/image.jpg',
							100,
							200,
						];
					} );
				},
			],
		];
	}

	public function test_get_props_schema__is_serializable() {
		// Arrange.
		remove_all_filters( 'elementor/atomic-widgets/props-schema' );

		$schema = [
			'_cssid' => String_Prop_Type::make(),

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
			'_cssid', // will automatically be added as a common prop
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

		$test_schema = $widget::get_props_schema();
		unset( $test_schema['_cssid'] );
		// Act & Assert.
		$this->assertSame( $schema, $test_schema );
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
		array_pop( $controls ); //remove settings section

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

	public function test_get_atomic_controls__supports_control_injections() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [
				'prop-1' => String_Prop_Type::make()->default( '' ),
				'prop-2' => String_Prop_Type::make()->default( '' ),
				'prop-3' => String_Prop_Type::make()->default( '' ),
			],
			'controls' => [
				Section::make()
					->set_id( 'test-section-1')
					->set_items( [
						Textarea_Control::bind_to( 'prop-1' ),
					] ),

				Section::make()
					->set_id( 'test-section-2')
					->set_items( [
						Textarea_Control::bind_to( 'prop-2' ),
					] ),
			]
		] );

		add_filter( 'elementor/atomic-widgets/controls', function ( $controls ) {
			/** @var Section $second_section */
			$second_section = Collection::make( $controls )->find(
				fn( $control ) => $control instanceof Section && $control->get_id() === 'test-section-2'
			);

			$second_section->add_item(
				Textarea_Control::bind_to( 'prop-3' )
			);

			return $controls;
		} );

		// Act.
		$controls = $widget->get_atomic_controls();

		// Assert.
		$this->assertCount( 2, $controls[1]->get_items() );
		$this->assertEquals( Textarea_Control::bind_to( 'prop-3' ), $controls[1]->get_items()[1] );
	}

	public function test_get_data_for_save() {
		// Arrange.
		$widget_styles = [
			's-1234' => [
				'id' => 's-1234',
				'type' => 'class',
				'label' => 'my-class',
				'variants' => [
					[
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'red',
							],
						],
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'custom_css' => null,
					],
				],
			]
		];

		$widget_editor_settings = [
			'title' => 'My Custom Title',
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
			'editor_settings' => $widget_editor_settings,
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

		$this->assertSame( $widget_editor_settings, $data_for_save['editor_settings'] );

		$this->assertSame( $widget_styles, $data_for_save['styles'] );
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

	public function test_get_data_for_save__sanitize_editor_settings() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'editor_settings' => [
				'title' => '<b>invalid HTML string</b>',
			],
		] );

		// Act.
		$data_for_save = $widget->get_data_for_save();

		// Assert.
		$this->assertSame( [
			'title' => 'invalid HTML string',
		], $data_for_save['editor_settings'] );
	}

	public function test_get_data_for_save__removes_editor_settings_on_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'editor_settings' => [
				'title' => 6639,
			],
		] );

		// Act.
		$data_for_save = $widget->get_data_for_save();

		// Assert.
		$this->assertSame( [], $data_for_save['editor_settings'] );
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
					'label' => 'my-class',
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
		$this->expectExceptionMessage( 'Styles validation failed for style `s-1234`. meta.state: missing_or_invalid_value' );

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
					'label' => 'my-class',
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
		$this->expectExceptionMessage( 'Styles validation failed for style `s-1234`. meta.breakpoint: missing_or_invalid_value' );

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
		$this->expectExceptionMessage( 'Styles validation failed for style `1234`. id: missing_or_invalid, label: missing_or_invalid' );

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
					'label' => 'my-class',
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
		$this->expectExceptionMessage( 'Styles validation failed for style `s-1234`. type: missing_or_invalid' );

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
		$this->expectExceptionMessage( 'Styles validation failed for style `s-1234`. label: missing_or_invalid' );

		// Act.
		$widget->get_data_for_save();
	}

	public function test_get_data_for_save__throws_on_styles_variant_validation_error() {
		// Arrange.
		$widget = $this->make_mock_widget( [
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				's-1234' => [
					'id' => 's-1234',
					'label' => 'Test',
					'type' => 'class',
					'variants' => [
						[
							'props' => [],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
						],
						[
							'props' => [
								'padding' => [
									'$$type' => 'size',
									'value' => 'not-a-size',
								],
							],
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'hover',
							],
						],
					],
				]
			]
		] );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Styles validation failed for style `s-1234`. variants[1].padding: invalid_value' );

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
		$this->expectExceptionMessage( 'Settings validation failed. mock_prop_1: invalid_value, mock_prop_2: invalid_value' );

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
					'editor_settings' => $options['editor_settings'] ?? [],
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
		};
	}
}
