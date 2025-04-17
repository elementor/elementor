<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Usage\Global_Classes_Usage;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Global_Classes_Usage extends Elementor_Test_Base {
	private $post_ids = [];

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
			'g-4-125' => [
				'id' => 'g-4-125',
				'type' => 'class',
				'label' => 'globaly',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'red',
							]
						],
					],
				],
			],
			'g-4-126' => [
				'id' => 'g-4-126',
				'type' => 'class',
				'label' => 'yellowy',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'yellow',
							]
						],
					],
				],
			],
		],
		'order' => ['g-4-124', 'g-4-123', 'g-4-125', 'g-4-126'],
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
							'id' => 'jkl10122',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'settings' => [],
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

	private $mock_elementor_data_2 = [
		[
			'id' => 'abc1234',
			'elType' => 'e-div-block',
			'settings' => [
				'classes' => [
					'value' => ['g-4-123', 'e-4-124', 'g-4-125']
				]
			],
			'elements' => [
				[
					'id' => 'def4564',
					'elType' => 'e-div-block',
					'settings' => [
						'classes' => [
							'value' => ['g-4-124', 'e-4-1222']
						]
					],
					'elements' => [
						[
							'id' => 'ghi7894',
							'elType' => 'e-button',
							'settings' => [
								'classes' => [
									'value' => ['g-4-123', 'e-4-1222', 'g-4-125', 'g-4-126']
								]
							],
						],
						[
							'id' => 'jkl1014',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [],
						]
					],
				],
			],
		],
	];

	private $mock_elementor_data_3 = [
		[
			'id' => 'abc12345',
			'elType' => 'e-div-block',
			'settings' => [
				'classes' => [
					'value' => ['g-4-123', 'e-4-124', 'g-4-125']
				]
			],
			'elements' => [
				[
					'id' => 'def45645',
					'elType' => 'e-div-block',
					'settings' => [
						'classes' => [
							'value' => ['g-4-124', 'e-4-1222']
						]
					],
					'elements' => [
						[
							'id' => 'ghi7895',
							'elType' => 'e-button',
							'settings' => [
								'classes' => [
									'value' => ['g-4-123', 'e-4-1222', 'g-4-125', 'g-4-126']
								]
							],
						],
						[
							'id' => 'jkl10154',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [],
						]
					],
				],
			],
		],
	];


	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		remove_all_filters( 'elementor/tracker/send_tracking_data_params' );
	}

	public function tear_down() {
		( new Global_Classes_Repository() )->put( [], [] );

		foreach ( $this->post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->post_ids = [];

		parent::tear_down();
	}

	public function test_global_classes_usage() {
		// Arrange.
		$global_classes_usage = new Global_Classes_Usage();
		$global_classes_usage->register_hooks();
		$this->make_mock_post_with_elements( $this->mock_elementor_data );

		// Act.
		$params = apply_filters( 'elementor/tracker/send_tracking_data_params', [] );

		// Assert.
		$this->assertSame( 4, $params['usages']['global_classes']['total_count'] );
		$this->assertEquals( 3, $params['usages']['global_classes']['low_usage_global_classes_count'] );
	}

	public function test_global_classes_usage_with_multiple_posts() {
		// Arrange.
		$global_classes_usage = new Global_Classes_Usage();
		$global_classes_usage->register_hooks();

		$this->make_mock_post_with_elements( $this->mock_elementor_data );
		$this->make_mock_post_with_elements( $this->mock_elementor_data_2 );

		// Act.
		$params = apply_filters( 'elementor/tracker/send_tracking_data_params', [] );

		// Assert.
		$this->assertEquals( 4, $params['usages']['global_classes']['total_count'] );
		$this->assertEquals( 1, $params['usages']['global_classes']['low_usage_global_classes_count'] );
	}

	public function test_global_classes_usage_with_no_classes_exist() {
		// Arrange.
		Global_Classes_Repository::make()->put( [], [] );
		$global_classes_usage = new Global_Classes_Usage();
		$global_classes_usage->register_hooks();

		// Act.
		$params = apply_filters( 'elementor/tracker/send_tracking_data_params', [] );

		// Assert.
		$this->assertEquals( 0, $params['usages']['global_classes']['total_count'] );
		$this->assertArrayNotHasKey( 'low_usage_global_classes_count', $params['usages']['global_classes'] );
	}

	public function test_global_classes_usage_with_all_classes_applied_above_min() {
		// Arrange.
		$global_classes_usage = new Global_Classes_Usage();
		$global_classes_usage->register_hooks();

		$this->make_mock_post_with_elements( $this->mock_elementor_data );
		$this->make_mock_post_with_elements( $this->mock_elementor_data_2 );
		$this->make_mock_post_with_elements( $this->mock_elementor_data_3 );

		// Act.
		$params = [];

		$params = apply_filters('elementor/tracker/send_tracking_data_params', $params);

		// Assert.
		$this->assertEquals(4, $params['usages']['global_classes']['total_count']);
		$this->assertArrayNotHasKey('low_usage_global_classes_count', $params['usages']['global_classes']);
	}

	private function make_mock_post_with_elements( $elements_data ) {
		$document = $this->factory()->documents->create_and_get( [
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$document->update_json_meta( '_elementor_data', $elements_data );

		$this->post_ids[] = $document->get_main_id();

		return $document->get_main_id();
	}
}
