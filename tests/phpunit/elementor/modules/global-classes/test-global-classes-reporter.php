<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Usage\Global_Classes_Reporter;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Reporter extends Elementor_Test_Base {
	use MatchesSnapshots;

	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'id' => 'g-4-123',
				'label' => 'test-class-1',
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
							],
						],
					],
				],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'label' => 'test-class-2',
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
							],
						],
					],
				],
			],
		],
		'order' => [ 'g-4-123', 'g-4-124' ],
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
							'value' => ['g-4-124', 'e-4-1222']
						]
					],
					'elements' => [
						[
							'id' => 'ghi789',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'settings' => [
								'classes' => [
									'value' => ['g-4-123', 'g-4-124']
								]
							]
						]
					]
				]
			]
		]
	];

	private $post_id;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		( new Global_Classes_Repository() )->put( $this->mock_global_classes['items'], $this->mock_global_classes['order'] );

		// Create a post with Elementor data
		$document = Plugin::$instance->documents->create( 'post', [
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$document->update_json_meta( '_elementor_data', $this->mock_elementor_data );

		$this->post_id = $document->get_main_id();
	}

	public function tearDown(): void {
		parent::tearDown();

		( new Global_Classes_Repository() )->put( [], [] );

		// Remove the post with Elementor data
		wp_delete_post( $this->post_id, true );
	}

	public function test_get_raw_classes() {
		// Arrange.
		$reporter = new Global_Classes_Reporter();

		// Act.
		$raw_classes = $reporter->get_raw_global_classes();

		// Assert.
		$this->assertMatchesSnapshot( $raw_classes['value'] );
	}

	public function test_get_classes() {
		// Arrange.
		$reporter = new Global_Classes_Reporter();

		// Act.
		$classes = $reporter->get_global_classes();

		// Assert.
		$this->assertMatchesSnapshot( $classes['value'] );
	}
}
