<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Reporter;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
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
			'elType' => 'section',
			'settings' => [
				'classes' => [
					'value' => ['g-4-123']
				]
			],
			'elements' => [
				[
					'id' => 'def456',
					'elType' => 'column',
					'settings' => [
						'classes' => [
							'value' => ['g-4-124']
						]
					],
					'elements' => [
						[
							'id' => 'ghi789',
							'elType' => 'widget',
							'widgetType' => 'heading',
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

		// Setup global classes
		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		// Create a post with Elementor data
		$post = $this->factory()->post->create_and_get([
			'post_type' => 'page',
			'post_status' => 'publish',
		]);

		$this->post_id = $post->ID;

		update_post_meta( $post->ID, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post->ID, '_elementor_data', wp_json_encode( $this->mock_elementor_data ) );

		// Mock WP_Query to return only our test post
		add_filter( 'posts_pre_query', function( $posts, $query ) {
			if ( isset( $query->query_vars['meta_key'] ) && $query->query_vars['meta_key'] === '_elementor_edit_mode' ) {
				$post = get_post( $this->post_id );
				return [ $post ];
			}
			return $posts;
		}, 10, 2 );
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->kits_manager->get_active_kit()->delete_meta( Global_Classes_Repository::META_KEY );
		remove_all_filters( 'posts_pre_query' );
	}

	public function test_get_classes_usage() {
		// Arrange.
		$reporter = new Global_Classes_Reporter();

		// Act.
		$usage_data = $reporter->get_classes_usage();

		// Assert.
		$this->assertEquals( 2, $usage_data['count']['value'] );
		$this->assertEquals( 4, $usage_data['applied_classes']['value'] );

		$expected_element_types = [
			'section' => 1,
			'column' => 1,
			'heading' => 2,
		];
		$this->assertEquals( $expected_element_types, $usage_data['applied_classes_element_types']['value'] );
	}

	public function test_get_raw_classes() {
		// Arrange.
		$reporter = new Global_Classes_Reporter();

		// Act.
		$raw_classes = $reporter->get_raw_classes();

		// Assert.
		$this->assertMatchesSnapshot( $raw_classes['value'] );
	}

	public function test_get_classes() {
		// Arrange.
		$reporter = new Global_Classes_Reporter();

		// Act.
		$classes = $reporter->get_classes();

		// Assert.
		$this->assertMatchesSnapshot( $classes['value'] );
	}

	public function test_no_applied_classes_stats_when_empty() {
		// Arrange.
		$post = $this->factory()->post->create_and_get([
			'post_type' => 'page',
			'post_status' => 'publish',
		]);

		update_post_meta( $post->ID, '_elementor_edit_mode', 'builder' );

		$elementor_data = [
			[
				'id' => 'abc123',
				'elType' => 'section',
				'settings' => [],
				'elements' => [
					[
						'id' => 'def456',
						'elType' => 'column',
						'settings' => [],
						'elements' => [
							[
								'id' => 'ghi789',
								'elType' => 'widget',
								'widgetType' => 'heading',
								'settings' => []
							]
						]
					]
				]
			]
		];

		update_post_meta( $post->ID, '_elementor_data', wp_json_encode( $elementor_data ) );

		add_filter( 'posts_pre_query', function( $posts, $query ) use ( $post ) {
			if ( isset( $query->query_vars['meta_key'] ) && $query->query_vars['meta_key'] === '_elementor_edit_mode' ) {
				return [ $post ];
			}
			return $posts;
		}, 10, 2 );

		// Act.
		$reporter = new Global_Classes_Reporter();
		$usage_data = $reporter->get_classes_usage();

		// Assert.
		$this->assertEquals( 2, $usage_data['count']['value'] );
		$this->assertArrayNotHasKey( 'applied_classes', $usage_data );
		$this->assertArrayNotHasKey( 'applied_classes_element_types', $usage_data );
	}
}
