<?php
namespace Elementor\Testing\Modules\AtomicWidgets\AtomicDynamicTags;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\AtomicWidgets\AtomicDynamicTags\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	private $module;

	public function set_up() {
		parent::set_up();

		$this->module = new Module();
	}

	public function test_convert_dynamic_tags_to_atomic__returns_the_atomic_dynamic_tags() {
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
		];

		// Act.
		$atomic_tags = $this->module->convert_dynamic_tags_to_atomic( $tags );

		// Assert.
		$expected = [
			[
				'name' => 'info',
				'label' => 'Info',
				'categories' => [
					'text',
				],
				'group' => 'post',
				'controls' => [
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
						'constraints' => [
						],
					],
					'after' => [
						'default' => '',
						'type' => 'string',
						'constraints' => [
							[
								'type' => 'enum',
								'value' => [
									'name',
									'email',
								],
							],
						],
					],
				],
			]
		];

		$this->assertEquals( $expected, json_decode( json_encode( $atomic_tags ), true ) );
	}

	public function test_convert_dynamic_tags_to_atomic__returns_empty_array_when_tags_have_unsupported_control() {
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

		// Act.
		$atomic_tags = $this->module->convert_dynamic_tags_to_atomic( $tags );

		// Assert.
		$this->assertEmpty( $atomic_tags );
	}

	public function test_convert_dynamic_tags_to_atomic__returns_empty_array_when_tags_have_select_control_with_no_options() {
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

		// Act.
		$atomic_tags = $this->module->convert_dynamic_tags_to_atomic( $tags );

		// Assert.
		$this->assertEmpty( $atomic_tags );
	}
}
