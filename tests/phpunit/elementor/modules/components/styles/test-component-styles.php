<?php
namespace Elementor\Testing\Modules\Components\Styles;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\AtomicWidgets\Styles\CacheValidity\Cache_Validity;
use Elementor\Modules\Components\Styles\Component_Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Component_Styles extends Elementor_Test_Base {
	private $hook_call_count = 0;
	private $rendered_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		$this->hook_call_count = 0;
		$this->rendered_post_ids = [];

		remove_all_actions( 'elementor/post/render' );

		add_action( 'elementor/post/render', [ $this, 'track_post_render' ], 5, 1 );
	}

	public function track_post_render( $post_id ) {
		$this->hook_call_count++;
		$this->rendered_post_ids[] = $post_id;
	}

	private function make_mock_post_with_elements( $elements_data ) {
		$document = $this->factory()->documents->create_and_get( [
			'post_title' => 'Test E-Component Post',
			'post_status' => 'publish',
		] );

		$test_elements_data = [
			[
				'id' => 'test-section-1',
				'elType' => 'section',
				'elements' => [
					[
						'id' => 'test-post',
						'elType' => 'container',
						'elements' => $elements_data,
					],
				],
			],
		];

		$document->update_json_meta( '_elementor_data', $test_elements_data );

		return $document;
	}

	/**
	 * Test that Component_Styles extracts component IDs and triggers hooks
	 */
	public function test_component_styles_triggers_hooks_for_unique_component_ids() {
		// Arrange
		$component_styles = new Component_Styles();
		$component_styles->register_hooks();

		$post_id = $this->make_mock_post_with_elements([
			// Not an e-component widget
			[
				'id' => 'e-some-widget-1',
				'elType' => 'widget',
				'widgetType' => 'e-some-widget',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [ 'component_id' => [ '$$type' => 'number', 'value' => 50 ] ],
					],
				],
			],
			// First e-component widget with component-id "180"
			[
				'id' => 'e-component-1',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [ 'component_id' => [ '$$type' => 'number', 'value' => 180 ] ],
					],
				],
			],
			// Second e-component widget with same component-id "180" (should not trigger duplicate)
			[
				'id' => 'e-component-2',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [ 'component_id' => [ '$$type' => 'number', 'value' => 180 ] ],
					],
				],
			],
			// Third e-component widget with different component-id "250"
			[
				'id' => 'e-component-3',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [ 'component_id' => [ '$$type' => 'number', 'value' => 250 ] ],
					],
				],
			],
		])->get_main_id();

		// Act
		do_action( 'elementor/post/render', $post_id );

		// Assert
		$this->assertEquals( 3, $this->hook_call_count, 'Hook should be called 3 times: 1 for original post + 2 for unique component-ids' );

		$expected_post_ids = [ $post_id, '180', '250' ];
		$this->assertEquals( $expected_post_ids, $this->rendered_post_ids, 'Should render original post and both unique component-ids' );
	}

	/**
	 * Test that component ID deduplication works correctly
	 */
	public function test_invalid_components_in_post() {
		// Arrange
		$component_styles = new Component_Styles();
		$component_styles->register_hooks();

		$post_id = $this->make_mock_post_with_elements([
			[
				'id' => 'e-some-widget-1',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'post_id' => [
						'$$type' => 'component-instance',
						'value' => [
							'component_id' => [
								'$$type' => 'number',
								'value' => [ '$$type' => 'number', 'value' => 180 ],
							],
						],
					],
				],
			],
		])->get_main_id();

		// Act
		do_action( 'elementor/post/render', $post_id );

		// Assert
		$this->assertEquals( 1, $this->hook_call_count, 'Hook should be called once' );

		$expected_post_ids = [ $post_id ];
		$this->assertEquals( $expected_post_ids, $this->rendered_post_ids, 'Should render original post only' );
	}

	public function test_cache_validity_upon_post_update() {
		// Arrange
		$component_styles = new Component_Styles();
		$component_styles->register_hooks();

		$post = $this->make_mock_post_with_elements([
			[
				'id' => 'e-component-1',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [ 'component_id' => [ '$$type' => 'number', 'value' => 180 ] ],
					],
				],
			],
		]);

		$post_id = $post->get_main_id();
		$component_id = '180';
		$expected_post_ids = [ $post_id, $component_id ];

		// Act
		do_action( 'elementor/post/render', $post_id );

		$cache_validity = new Cache_Validity();

		// Assert
		$this->assertTrue(
			$cache_validity->is_valid( [ Component_Styles::CACHE_ROOT_KEY, $post_id ] ),
			'Post-level cache should be valid'
		);
		$this->assertTrue(
			$cache_validity->is_valid( [ Component_Styles::CACHE_ROOT_KEY, $component_id ],
			'Component-level cache should be valid' )
		);

		$this->assertEquals(
			$expected_post_ids,
			$this->rendered_post_ids,
			'Should render original post only'
		);
		$this->assertEquals(
			[ $component_id ],
			$cache_validity->get_meta( [ Component_Styles::CACHE_ROOT_KEY, $post_id ] ),
			'Post-level cache meta should contain the included component ID (1st level only)'
		);
		$this->assertEquals(
			[],
			$cache_validity->get_meta( [ Component_Styles::CACHE_ROOT_KEY, $component_id ] ),
			'Component-level cache meta should be empty'
		);

		// Act
		do_action( 'elementor/document/after_save', $post, [] );

		// Assert
		$this->assertFalse(
			$cache_validity->is_valid( [ Component_Styles::CACHE_ROOT_KEY, $post_id ] ),
			'After saving changes cache should be invalidated'
		);
		$this->assertTrue(
			$cache_validity->is_valid( [ Component_Styles::CACHE_ROOT_KEY, $component_id ] ),
			'Component-level cache should remain valid, as no change occurred'
		);
	}
}
