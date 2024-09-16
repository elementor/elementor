<?php
namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1DynamicTags;
use Elementor\Plugin;
use Elementor\Testing\Modules\AtomicWidgets\DynamicTags\Mocks\Mock_Dynamic_Tag;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__  . '/mocks/mock-dynamic-tag.php';

class Test_Dynamic_Tags_Module extends Elementor_Test_Base {
	private Dynamic_Tags_Manager $original_dynamic_tags;

	public function set_up() {
		parent::set_up();

		remove_all_actions( 'elementor/init' );
		remove_all_actions( 'elementor/atomic-widgets/prop-types' );
		remove_all_filters( 'elementor/editor/localize_settings' );

		$this->original_dynamic_tags = Plugin::$instance->dynamic_tags;
		Plugin::$instance->dynamic_tags = new Dynamic_Tags_Manager();

		Dynamic_Tags_Module::fresh()->register_hooks();
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->dynamic_tags = $this->original_dynamic_tags;
	}

	public function test_elementor_init__populates_the_dynamic_registry() {
		// Arrange.
		Plugin::$instance->dynamic_tags->register( new Mock_Dynamic_Tag() );

		// Act.
		do_action( 'elementor/init' );

		// Assert.
		$tags = Dynamic_Tags_Module::instance()->registry->get_tags();

		$this->assertArrayHasKey( 'mock-dynamic-tag', $tags );
	}

	public function test_add_atomic_dynamic_tags_settings__returns_the_original_settings_when_there_are_no_tags() {
		// Arrange.
		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( [] );

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [
			'existing-setting' => 'original-value',
		] );

		// Assert.
		$this->assertEquals( [ 'existing-setting' => 'original-value' ], $settings );
	}

	public function test_add_atomic_dynamic_tags_settings__returns_the_atomic_dynamic_tags() {
		// Arrange.
		$tags = [
			'info' => [
				'name' => 'info',
				'title' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'controls' => [
					'advanced' => [
						'type' => 'section',
						'label' => 'Advanced',
						'name' => 'advanced',
					],
					'before' => [
						'type' => 'text',
						'section' => 'advanced',
						'label' => 'Before',
						'name' => 'before',
						'default' => '',
					],
					'key' => [
						'type' => 'select',
						'section' => 'advanced',
						'label' => 'Key',
						'name' => 'after',
						'default' => '',
						'options' => [
							'name' => 'Name',
							'email' => 'Email',
						],
					],
				],
			],
			'post' => [
				'name' => 'post',
				'title' => 'Post',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'atomic_controls' => [],
				'prop_types' => [],
			],
		];

		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( $tags );

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
							'label' => 'Advanced',
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
										'bind' => 'after',
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
				'prop_types' => [
					'before' => [
						'type' => [
							'key' => 'string',
							'default' => '',
							'settings' => [],
						],
						'additional_types' => [],
					],
					'after' => [
						'type' => [
							'key' => 'string',
							'default' => '',
							'settings' => [
								'enum' => [
									'name',
									'email',
								],
							],
						],
						'additional_types' => [],
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
				'prop_types' => [],
			]
		];

		$this->assertEqualSets( $expected, json_decode( wp_json_encode( $settings['atomicDynamicTags']['tags'] ), true ) );
	}

	public function test_add_atomic_dynamic_tags_settings__returns_empty_array_when_tags_have_no_name() {
		// Arrange.
		$tags = [
			'tag' => [
				'title' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
			],
		];

		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( $tags );

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
	}

	public function test_add_atomic_dynamic_tags_settings__returns_empty_array_when_tags_have_no_categories() {
		// Arrange.
		$tags = [
			'tag' => [
				'name' => 'info',
				'title' => 'Info',
				'group' => 'post',
			],
		];

		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( $tags );

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
	}

	public function test_add_atomic_dynamic_tags_settings__returns_empty_array_when_tags_have_unsupported_control() {
		// Arrange.
		$tags = [
			'tag' => [
				'name' => 'info',
				'title' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'controls' => [
					'advanced' => [
						'type' => 'section',
						'label' => 'Advanced',
						'name' => 'advanced',
					],
					'before' => [
						'type' => 'text',
						'section' => 'advanced',
						'label' => 'Before',
						'name' => 'before',
						'default' => '',
					],
					'unsupported' => [
						'type' => 'unsupported',
						'section' => 'advanced',
						'label' => 'Key',
						'name' => 'after',
						'default' => '',
					],
				],
			],
		];

		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( $tags );

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
	}

	/**
	 * @dataProvider missing_control_prop_data_provider
	 */
	public function test_add_atomic_dynamic_tags_settings__returns_empty_array_when_tag_control_is_missing_props( string $prop_to_remove ) {
		// Arrange.
		$control = [
			'type' => 'text',
			'name' => 'before',
			'section' => 'advanced',
			'label' => 'Before',
			'default' => 'test',
		];

		unset( $control[ $prop_to_remove ] );

		$tags = [
			'tag' => [
				'name' => 'info',
				'title' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'controls' => [
					'advanced' => [
						'type' => 'section',
						'label' => 'Advanced',
						'name' => 'advanced',
					],
					'before' => $control,
				],
			],
		];

		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( $tags );

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
	}

	public function missing_control_prop_data_provider() {
		return [
			'no type' => [ 'type' ],
			'no name' => [ 'name' ],
			'no section' => [ 'section' ],
			'no label' => [ 'label' ],
			'no default' => [ 'default' ],
		];
	}

	public function test_add_atomic_dynamic_tags_settings__returns_empty_array_when_tags_have_select_control_with_no_options() {
		// Arrange.
		$tags = [
			'tag' => [
				'name' => 'info',
				'title' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'controls' => [
					'advanced' => [
						'type' => 'section',
						'label' => 'Advanced',
						'name' => 'advanced',
					],
					'before' => [
						'type' => 'text',
						'section' => 'advanced',
						'label' => 'Before',
						'name' => 'before',
						'default' => '',
					],
					'after' => [
						'type' => 'select',
						'section' => 'advanced',
						'label' => 'Key',
						'name' => 'after',
						'default' => '',
					],
				],
			],
		];

		Dynamic_Tags_Module::instance()->registry->populate_from_v1_tags( $tags );

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
	}

	public function test_add_dynamic_prop_type__skips_non_prop_types() {
		// Act.
		$prop_types = apply_filters( 'elementor/atomic-widgets/prop-types', [
			'prop' => 'not-a-prop-type',
		] );

		// Assert.
		$this->assertSame( [ 'prop' => 'not-a-prop-type' ], $prop_types );
	}

	public function test_add_dynamic_prop_type__skips_prop_types_that_ignore_dynamic() {
		// Act.
		$prop1 = String_Prop_Type::make()
			->add_meta( Dynamic_Prop_Type::ignore() )
			->default( 'default-value' );

		$prop2 = String_Prop_Type::make()
			->add_meta( 'dynamic', false )
			->default( 'default-value' );

		$prop_types = apply_filters( 'elementor/atomic-widgets/prop-types', [
			'prop1' => $prop1,
			'prop2' => $prop2,
		] );

		// Assert.
		$this->assertSame( [ 'prop1' => $prop1, 'prop2' => $prop2 ], $prop_types );
		$this->assertEmpty( $prop1->get_additional_types() );
		$this->assertEmpty( $prop2->get_additional_types() );
	}

	/**
	 * @dataProvider add_dynamic_prop_type_data_provider
	 */
	public function test_add_dynamic_prop_type( Prop_Type $prop, array $expected_categories ) {
		// Act.
		$prop_types = apply_filters( 'elementor/atomic-widgets/prop-types', [
			'prop' => $prop,
		] );

		// Assert.
		$expected = empty( $expected_categories )
			? []
			: [ Dynamic_Prop_Type::make()->categories( $expected_categories ) ];

		$this->assertSame( [ 'prop' => $prop ], $prop_types );
		$this->assertEquals( $expected, $prop->get_additional_types() );
	}

	public function add_dynamic_prop_type_data_provider() {
		return [
			'number' => [
				Number_Prop_Type::make()->default( 0 ),
				[ V1DynamicTags::NUMBER_CATEGORY ],
			],

			'image' => [
				Image_Prop_Type::make()->default( [ 'url' => 'test' ] ),
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
}
