<?php

namespace Elementor\Testing\Modules\GlobalClasses;


use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Usage\Global_Classes_Usage;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Global_Classes_Usage extends Elementor_Test_Base {
	private $post_id;

	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'type' => 'class',
				'id' => 'g-4-123',
				'label' => 'pinky',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'mobile',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'pink',
							],
						],
					],
				],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'type' => 'class',
				'label' => 'bluey',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'blue',
							]
						],
					],
				],
			],
		],
		'order' => ['g-4-124', 'g-4-123'],
	];

	private $mock_elementor_data = [
		[
			'id' => 'abc123',
			'elType' => 'e-div-block',
			'settings' => [
				'classes' => [
					'value' => ['g-4-123', 'e-4-124']
				]
			],
			'elements' => [
				[
					'id' => 'def456',
					'elType' => 'e-div-block',
					'settings' => [
						'classes' => [
							'value' => ['g-4-124', 'g-4-123', 'e-4-1222']
						]
					],
					'elements' => [
						[
							'id' => 'ghi789',
							'elType' => 'e-heading',
							'settings' => [
								'classes' => [
									'value' => ['g-4-123', 'e-4-1222']
								]
							],
						],
						[
							'id' => 'jkl101',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [],
						]
					],
				],
			],
		],
	];

	public function set_up() {
		parent::set_up();

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		$document = Plugin::$instance->documents->create( 'post', [
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$document->update_json_meta( '_elementor_data', $this->mock_elementor_data );

		$this->post_id = $document->get_main_id();

		remove_all_filters( 'elementor/tracker/send_tracking_data_params' );
	}

	public function tear_down() {
		( new Global_Classes_Repository() )->put( [], [] );

		wp_delete_post( $this->post_id, true );

		parent::tear_down();
	}

	public function test_global_classes_usage() {
		$global_classes_usage = new Global_Classes_Usage();
		$global_classes_usage->register_hooks();

		$params = [];

		$params = apply_filters( 'elementor/tracker/send_tracking_data_params', $params );

		$this->assertEquals( 2, $params['usages']['global_classes']['total_count'] );
		$this->assertEquals(
			[
				'e-div-block' => 3,
				'e-heading' => 1,
			],
			$params['usages']['global_classes']['applied_classes_per_element_type'],
		);
	}


}
