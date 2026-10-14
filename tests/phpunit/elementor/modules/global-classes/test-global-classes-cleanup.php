<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Cleanup;
use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Base\Document;

class Test_Global_Classes_Cleanup extends Elementor_Test_Base {

	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'type' => 'class',
				'id' => 'g-4-123',
				'label' => 'pinky',
				'variants' => [],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'type' => 'class',
				'label' => 'bluey',
				'variants' => [],
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
							'id' => 'jkl10122',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'settings' => [],
						],
					],
				],
			],
		],
	];

	public function setUp(): void {
		parent::setUp();

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		remove_all_actions( 'elementor/global_classes/update' );
		remove_all_actions( 'elementor/global_classes/cleanup' );
	}

	public function test_no_deleted_global_classes() {
		// Arrange.
		( new Global_Classes_Cleanup() )->register_hooks();

		$post_id = $this->make_mock_post_with_elements( $this->mock_elementor_data );

		$updated_global_classes = $this->mock_global_classes;
		$updated_global_classes['items']['g-4-123']['label'] = 'pinky updated';

		// Act.
		Global_Classes_Repository::make()->put(
			$updated_global_classes['items'],
			$updated_global_classes['order'],
		);

		// Assert.
		$document = Plugin::$instance->documents->get( $post_id );
		$elements_data = $document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

		$this->assertEquals( $this->mock_elementor_data, $elements_data );
	}

	public function test_deleted_global_classes() {
		// Arrange.
		( new Global_Classes_Cleanup() )->register_hooks();

		$post_id_1 = $this->make_mock_post_with_elements( $this->mock_elementor_data );
		$post_id_2 = $this->make_mock_post_with_elements( $this->mock_elementor_data );

		$this->index_relations( $post_id_1, [ 'g-4-123', 'g-4-124' ] );
		$this->index_relations( $post_id_2, [ 'g-4-123', 'g-4-124' ] );

		$new_global_classes = [
			'items' => array_filter(
				$this->mock_global_classes['items'],
				fn( $item ) => 'g-4-123' !== $item['id']
			),
			'order' => array_filter(
				$this->mock_global_classes['order'],
				fn( $item ) => 'g-4-123' !== $item
			),
		];

		// Act.
		Global_Classes_Repository::make()->put(
			$new_global_classes['items'],
			$new_global_classes['order'],
		);

		// Assert.
		$document_1 = Plugin::$instance->documents->get( $post_id_1 );
		$elements_data_1 = $document_1->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

		$document_2 = Plugin::$instance->documents->get( $post_id_2 );
		$elements_data_2 = $document_2->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

		$expected = [
			[
				'id' => 'abc123',
				'elType' => 'e-div-block',
				'settings' => [
					'classes' => [
						'value' => ['e-4-124']
					]
				],
				'elements' => [
					[
						'id' => 'def456',
						'elType' => 'e-div-block',
						'settings' => [
							'classes' => [
								'value' => ['g-4-124', 'e-4-1222']
							]
						],
						'elements' => [
							[
								'id' => 'ghi789',
								'elType' => 'e-heading',
								'settings' => [
									'classes' => [
										'value' => ['e-4-1222']
									]
								],
							],
							[
								'id' => 'jkl10122',
								'elType' => 'widget',
								'widgetType' => 'e-heading',
								'settings' => [],
							]
						],
					],
				],
			],
		];

		$this->assertEquals( $expected, $elements_data_1 );
		$this->assertEquals( $expected, $elements_data_2 );
	}

	public function test_deleted_global_classes_via_apply_changes() {
		// Arrange.
		( new Global_Classes_Cleanup() )->register_hooks();

		$post_id_1 = $this->make_mock_post_with_elements( $this->mock_elementor_data );
		$post_id_2 = $this->make_mock_post_with_elements( $this->mock_elementor_data );

		$this->index_relations( $post_id_1, [ 'g-4-123', 'g-4-124' ] );
		$this->index_relations( $post_id_2, [ 'g-4-123', 'g-4-124' ] );

		$remaining_item = $this->mock_global_classes['items']['g-4-124'];

		// Act - editor/API path uses apply_changes(), not put().
		Global_Classes_Repository::make()->apply_changes(
			[ 'g-4-124' => $remaining_item ],
			[
				'added' => [],
				'deleted' => [ 'g-4-123' ],
				'modified' => [],
				'order' => false,
			],
			[ 'g-4-124' ]
		);

		// Assert.
		$document_1 = Plugin::$instance->documents->get( $post_id_1 );
		$elements_data_1 = $document_1->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

		$document_2 = Plugin::$instance->documents->get( $post_id_2 );
		$elements_data_2 = $document_2->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

		$expected = [
			[
				'id' => 'abc123',
				'elType' => 'e-div-block',
				'settings' => [
					'classes' => [
						'value' => ['e-4-124']
					]
				],
				'elements' => [
					[
						'id' => 'def456',
						'elType' => 'e-div-block',
						'settings' => [
							'classes' => [
								'value' => ['g-4-124', 'e-4-1222']
							]
						],
						'elements' => [
							[
								'id' => 'ghi789',
								'elType' => 'e-heading',
								'settings' => [
									'classes' => [
										'value' => ['e-4-1222']
									]
								],
							],
							[
								'id' => 'jkl10122',
								'elType' => 'widget',
								'widgetType' => 'e-heading',
								'settings' => [],
							]
						],
					],
				],
			],
		];

		$this->assertEquals( $expected, $elements_data_1 );
		$this->assertEquals( $expected, $elements_data_2 );
	}

	private function make_mock_post_with_elements( array $elements_data ): int {
		$document = $this->factory()->documents->create_and_get( [
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$document->update_json_meta( '_elementor_data', $elements_data );

		return $document->get_main_id();
	}

	private function index_relations( int $post_id, array $class_ids ): void {
		( new Global_Classes_Relations() )->set_styles_for_post( $post_id, $class_ids );
	}
}
