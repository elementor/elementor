<?php
namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Dynamic_Tags;
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
						'default' => '',
						'type' => 'string',
						'settings' => [],
					],
					'after' => [
						'default' => '',
						'type' => 'string',
						'settings' => [
							'enum' => [
								'name',
								'email',
							],
						],
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

	public function test_add_atomic_dynamic_tags_settings__returns_array_of_props_types_mapping() {
		// Arrange.
		( new Dynamic_Tags() )->register_hooks();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'dynamicTags' => [ 'tags' => [] ] ] );

		// Assert.
		$mapping = $settings['atomicDynamicTags']['prop_types_to_dynamic'];

		$this->assertIsArray( $mapping );

		foreach ( $mapping as $key => $dynamic_categories ) {
			$this->assertIsString( $key );
			$this->assertIsArray( $dynamic_categories );

			foreach ( $dynamic_categories as $category ) {
				$this->assertIsString( $category );
			}
		}
	}
}
