<?php
namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1DynamicTags;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dynamic_Tags_Module extends Elementor_Test_Base {
	private Dynamic_Tags_Manager $original_dynamic_tags;

	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/editor/localize_settings' );
		remove_all_actions( 'elementor/atomic-widgets/props-schema' );
		remove_all_actions( 'elementor/dynamic_tags/register_tags' );
		remove_all_actions( 'elementor/dynamic_tags/register' );
		remove_all_actions( 'elementor/atomic-widgets/settings/transformers/register' );

		$this->original_dynamic_tags = Plugin::$instance->dynamic_tags;
		Plugin::$instance->dynamic_tags = new Dynamic_Tags_Manager();

		Dynamic_Tags_Module::fresh()->register_hooks();
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->dynamic_tags = $this->original_dynamic_tags;
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_the_original_settings_when_there_are_no_tags() {
		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [
			'existing-setting' => 'original-value',
		] );

		// Assert.
		$this->assertEquals( [ 'existing-setting' => 'original-value' ], $settings );
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_the_atomic_dynamic_tags() {
		$info_tag = $this->make_mock_tag( [
			'name' => 'info',
			'title' => 'Info',
			'categories' => [ 'text' ],
			'group' => 'post',
			'register_controls' => function ( Tag $tag ) {
				$tag->add_control(
					'before',
					[
						'type' => 'text',
						'label' => 'Before',
						'default' => '',
					]
				);

				$tag->add_control(
					'key',
					[
						'type' => 'select',
						'label' => 'Key',
						'options' => [
							'name' => 'Name',
							'email' => 'Email',
						],
						'default' => '',
					]
				);
			}
		] );

		$post_tag = $this->make_mock_tag( [
			'name' => 'post',
			'title' => 'Post',
			'categories' => [ 'text' ],
			'group' => 'post',
			'register_controls' => fn() => null,
		] );

		Plugin::$instance->dynamic_tags->register( $info_tag );
		Plugin::$instance->dynamic_tags->register( $post_tag );

		$tags = Plugin::$instance->dynamic_tags->get_tags_config();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$expected = [
			'info' => [
				'name' => 'info',
				'label' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'atomic_controls' => [
					[
						'type' => 'section',
						'value' => [
							'label' => 'Settings',
							'description' => null,
							'items' => [
								[
									'type' => 'control',
									'value' => [
										'bind' => 'before',
										'label' => 'Before',
										'description' => null,
										'type' => 'text',
										'props' => [
											'placeholder' => null,
										],
									],
								],
								[
									'type' => 'control',
									'value' => [
										'bind' => 'key',
										'label' => 'Key',
										'description' => null,
										'type' => 'select',
										'props' => [
											'options' => [
												[
													'value' => 'name',
													'label' => 'Name',
												],
												[
													'value' => 'email',
													'label' => 'Email',
												],
											],
										],
									],
								],
							],
						],
					],
				],
				'props_schema' => [
					'before' => [
						'kind' => 'plain',
						'key' => 'string',
						'default' => [ '$$type' => 'string', 'value' => '' ],
						'settings' => [],
						'meta' => [],
					],
					'key' => [
						'kind' => 'plain',
						'key' => 'string',
						'default' => [ '$$type' => 'string', 'value' => '' ],
						'settings' => [
							'enum' => [
								'name',
								'email',
							],
						],
						'meta' => [],
					],
				],
			],
			'post' => [
				'name' => 'post',
				'label' => 'Post',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'atomic_controls' => [],
				'props_schema' => [],
			]
		];

		$this->assertEqualSets( $expected, json_decode( wp_json_encode( $settings['atomicDynamicTags']['tags'] ), true ) );

		// Cleanup.
		$info_tag->cleanup();
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_empty_array_when_tags_have_no_name() {
		// Arrange.
		$tag = $this->make_mock_tag( [
			'name' => '',
		] );

		Plugin::$instance->dynamic_tags->register( $tag );

		$tags = Plugin::$instance->dynamic_tags->get_tags_config();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );

		// Cleanup.
		$tag->cleanup();
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_empty_array_when_tags_have_no_categories() {
		// Arrange.
		$tag = $this->make_mock_tag( [
			'categories' => [],
		] );

		Plugin::$instance->dynamic_tags->register( $tag );

		$tags = Plugin::$instance->dynamic_tags->get_tags_config();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );

		// Cleanup.
		$tag->cleanup();
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_empty_array_when_tags_have_unsupported_control() {
		// Arrange.
		$tag = $this->make_mock_tag( [
			'register_controls' => function ( Tag $tag ) {
				$tag->add_control(
					'unsupported-control',
					[
						'type' => 'choose',
					]
				);
			}
		] );

		Plugin::$instance->dynamic_tags->register( $tag );

		$tags = Plugin::$instance->dynamic_tags->get_tags_config();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );

		// Cleanup.
		$tag->cleanup();
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_tag_with_flag_and_unsupported_control() {
		// Arrange.
		$info_tag = $this->make_mock_tag( [
			'name' => 'info',
			'title' => 'Info',
			'categories' => [ 'text' ],
			'group' => 'post',
			'register_controls' => function ( Tag $tag ) {
				$tag->add_control(
					'unsupported-control',
					[
						'type' => 'choose',
					]
				);
			},
			'editor_config' => [
				'force_convert_to_atomic' => true,
			],
		] );

		Plugin::$instance->dynamic_tags->register( $info_tag );

		$tags = Plugin::$instance->dynamic_tags->get_tags_config();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$expected = [
			'info' => [
				'name' => 'info',
				'label' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'atomic_controls' => [],
				'props_schema' => [],
			],
		];

		$this->assertEqualSets( $expected, json_decode( wp_json_encode( $settings['atomicDynamicTags']['tags'] ), true ) );

		// Cleanup.
		$info_tag->cleanup();
	}

	public function test_add_atomic_dynamic_tags_to_editor_settings__returns_empty_array_when_tags_have_select_control_with_no_options() {
		// Arrange.s
		$tag = $this->make_mock_tag( [
			'register_controls' => function ( Tag $tag ) {
				$tag->add_control(
					'key',
					[
						'type' => 'select',
						'label' => 'Key',
						'options' => [],
						'default' => '',
					]
				);
			}
		] );

		Plugin::$instance->dynamic_tags->register( $tag );

		$tags = Plugin::$instance->dynamic_tags->get_tags_config();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );

		// Cleanup.
		$tag->cleanup();
	}

	public function test_add_dynamic_prop_type__skips_non_prop_types() {
		// Act.
		$schema = apply_filters( 'elementor/atomic-widgets/props-schema', [
			'prop' => 'not-a-prop-type',
		] );

		// Assert.
		$this->assertSame( [ 'prop' => 'not-a-prop-type' ], $schema );
	}

	public function test_add_dynamic_prop_type__skips_prop_types_that_ignore_dynamic() {
		// Act.
		$prop1 = String_Prop_Type::make()
			->meta( Dynamic_Prop_Type::ignore() )
			->default( 'default-value' );

		$prop2 = String_Prop_Type::make()
			->meta( 'dynamic', false )
			->default( 'default-value' );

		$schema = apply_filters( 'elementor/atomic-widgets/props-schema', [
			'prop1' => $prop1,
			'prop2' => $prop2,
		] );

		// Assert.
		$this->assertSame( [ 'prop1' => $prop1, 'prop2' => $prop2 ], $schema );
	}

	/**
	 * @dataProvider add_dynamic_prop_type_data_provider
	 */
	public function test_add_dynamic_prop_type( Prop_Type $prop, array $expected_categories ) {
		// Act.
		$schema = apply_filters(
			'elementor/atomic-widgets/props-schema',
			[ 'prop' => $prop ]
		);

		// Assert.
		$has_categories = ! empty( $expected_categories );

		if ( $has_categories ) {
			$this->assertInstanceof( Union_Prop_Type::class, $schema['prop'] );
			$this->assertEquals( $prop->get_default(), $schema['prop']->get_default() );
			$this->assertInstanceof( Dynamic_Prop_Type::class, $schema['prop']->get_prop_type( 'dynamic' ) );
			$this->assertEquals( $expected_categories, $schema['prop']->get_prop_type( 'dynamic' )->get_categories() );
		} else {
			$this->assertEquals( $prop, $schema['prop'] );
		}
	}

	public function test_add_dynamic_prop_type__adds_recursively_to_object_types() {
		// Act.
		$prop = new class extends Object_Prop_Type {
			public static function get_key(): string {
				return 'test';
			}

			protected function define_shape(): array {
				return [
					'internal' => String_Prop_Type::make()->default( 'test' ),
				];
			}
		};

		$schema = apply_filters(
			'elementor/atomic-widgets/props-schema',
			[ 'prop' => $prop ]
		);

		// Assert.
		$this->assertSame( $schema['prop'], $prop );

		$internal = $prop->get_shape_field( 'internal' );

		$this->assertInstanceof( Union_Prop_Type::class, $internal );
		$this->assertInstanceof( Dynamic_Prop_Type::class, $internal->get_prop_type( 'dynamic' ) );
		$this->assertEquals( [ V1DynamicTags::TEXT_CATEGORY ], $internal->get_prop_type( 'dynamic' )->get_categories() );
	}

	public function add_dynamic_prop_type_data_provider() {
		return [
			'number' => [
				Number_Prop_Type::make()->default( 0 ),
				[ V1DynamicTags::NUMBER_CATEGORY ],
			],

			'image-src' => [
				Image_Src_Prop_Type::make(),
				[ V1DynamicTags::IMAGE_CATEGORY ],
			],

			'string' => [
				String_Prop_Type::make()->default( 'test' ),
				[ V1DynamicTags::TEXT_CATEGORY ],
			],

			'string with enum' => [
				String_Prop_Type::make()->enum( [ 'a', 'b', 'c' ] )->default( 'a' ),
				[],
			],
		];
	}

	/**
	 * @param array{
	 *	name?: string,
	 *	title?: string,
	 *	group?: string,
	 *	categories?: string[],
	 *  register_controls?: callable(): void
	 * } $options
	 * @return Tag
	 */
	private function make_mock_tag( array $options ) {
		return new class ( $options ) extends Tag {
			private array $options;

			public function __construct( array $options, array $data = [] ) {
				parent::__construct($data);

				$this->options = $options;
			}

			public function get_name() {
				return $this->options['name'] ?? 'mock-tag';
			}

			public function get_title() {
				return $this->options['title'] ?? 'Mock Tag';
			}

			public function get_group() {
				return $this->options['group'] ?? 'post';
			}

			public function get_categories() {
				return $this->options['categories'] ?? [ 'text' ];
			}

			public function cleanup() {
				Plugin::$instance->controls_manager->delete_stack( $this );
			}

			public function get_editor_config() {
				return array_merge( parent::get_editor_config(), $this->options['editor_config'] ?? [] );
			}

			protected function register_controls() {
				$register_controls = $this->options['register_controls'] ?? null;

				if ( $register_controls ) {
					$register_controls( $this );

					return;
				}

				$this->add_control(
					'text',
					[
						'type' => 'text',
						'label' => 'Text',
						'default' => '',
					]
				);
			}

			protected function register_advanced_section() {}
		};
	}
}
