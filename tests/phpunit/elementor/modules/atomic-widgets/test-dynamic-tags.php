<?php
namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Dynamic_Tags;
use Elementor\Modules\AtomicWidgets\PropTypes\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\DynamicTags\Module as DynamicTagsModule;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dynamic_Tags extends Elementor_Test_Base {
	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/editor/localize_settings' );
	}

	public function test_add_atomic_dynamic_tags_settings__returns_the_original_settings_when_there_are_no_tags() {
		// Arrange.
		( new Dynamic_Tags() )->register_hooks();

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
				'props_schema' => [],
			],
		];

		( new Dynamic_Tags() )->register_hooks();

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
				'props_schema' => [
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
				'props_schema' => [],
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

		( new Dynamic_Tags() )->register_hooks();

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

		( new Dynamic_Tags() )->register_hooks();

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

		( new Dynamic_Tags() )->register_hooks();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
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

		( new Dynamic_Tags() )->register_hooks();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => $tags ] ] );

		// Assert.
		$this->assertEmpty( $settings['atomicDynamicTags']['tags'] );
	}

	public function test_add_dynamic_prop_type__skips_non_prop_types() {
		// Arrange.
		remove_all_filters( 'elementor/atomic-widgets/props-schema' );

		( new Dynamic_Tags() )->register_hooks();

		// Act.
		$schema = apply_filters( 'elementor/atomic-widgets/props-schema', [
			'prop' => 'not-a-prop-type',
		] );

		// Assert.
		$this->assertSame( [ 'prop' => 'not-a-prop-type' ], $schema );
	}

	public function test_add_dynamic_prop_type__skips_prop_types_that_ignore_dynamic() {
		// Arrange.
		remove_all_filters( 'elementor/atomic-widgets/props-schema' );

		( new Dynamic_Tags() )->register_hooks();

		// Act.
		$prop1 = String_Prop_Type::make()
			->add_meta( Dynamic_Tags::ignore() )
			->default( 'default-value' );

		$prop2 = String_Prop_Type::make()
			->add_meta( 'dynamic', false )
			->default( 'default-value' );

		$schema = apply_filters( 'elementor/atomic-widgets/props-schema', [
			'prop1' => $prop1,
			'prop2' => $prop2,
		] );

		// Assert.
		$this->assertSame( [ 'prop1' => $prop1, 'prop2' => $prop2 ], $schema );
		$this->assertEmpty( $prop1->get_additional_types() );
		$this->assertEmpty( $prop2->get_additional_types() );
	}

	/**
	 * @dataProvider add_dynamic_prop_type_data_provider
	 */
	public function test_add_dynamic_prop_type( Prop_Type $prop, array $expected_categories ) {
		// Arrange.
		remove_all_filters( 'elementor/atomic-widgets/props-schema' );

		( new Dynamic_Tags() )->register_hooks();

		// Act.
		$schema = apply_filters( 'elementor/atomic-widgets/props-schema', [
			'prop' => $prop,
		] );

		// Assert.
		$expected = empty( $expected_categories )
			? []
			: [ Dynamic_Prop_Type::make()->categories( $expected_categories ) ];

		$this->assertSame( [ 'prop' => $prop ], $schema );
		$this->assertEquals( $expected, $prop->get_additional_types() );
	}

	public function add_dynamic_prop_type_data_provider() {
		return [
			'number' => [
				Number_Prop_Type::make()->default( 0 ),
				[ DynamicTagsModule::NUMBER_CATEGORY ],
			],

			'image' => [
				Image_Prop_Type::make()->default( [ 'url' => 'test' ] ),
				[ DynamicTagsModule::IMAGE_CATEGORY ],
			],

			'string' => [
				String_Prop_Type::make()->default( 'test' ),
				[ DynamicTagsModule::TEXT_CATEGORY ],
			],

			'string with enum' => [
				String_Prop_Type::make()->enum( [ 'a', 'b', 'c' ] )->default( 'a' ),
				[],
			],
		];
	}
}
