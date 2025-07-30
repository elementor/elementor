<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Component_Styles;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Component_Styles extends Elementor_Test_Base {
	private $hook_call_count = 0;
	private $rendered_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		$this->hook_call_count = 0;
		$this->rendered_post_ids = [];

		remove_all_actions( 'elementor/post/render' );
	}

	private function setup_test_hooks() {
		add_action( 'elementor/post/render', [ $this, 'track_post_render' ], 5, 1 );
	}

	public function track_post_render( $post_id ) {
		$this->hook_call_count++;
		$this->rendered_post_ids[] = $post_id;
	}

	private function create_test_post( array $elements_data = [] ) {
		// Create a test post
		$post_id = wp_insert_post([
			'post_title' => 'Test E-Component Post',
			'post_content' => 'Test content',
			'post_status' => 'publish',
			'post_type' => 'page'
		]);

		$this->assertNotInstanceOf( 'WP_Error', $post_id, 'Failed to create test post' );

        // Create test data with e-component widgets having different component-ids
        $test_elements_data = [
            [
                'id' => 'test-section-1',
                'elType' => 'section',
                'elements' => [
                    [
                        'id' => 'test-post',
                        'elType' => 'container',
                        'elements' => $elements_data
                    ]
                ]
            ]
        ];

		// Store the elements data in post meta (this is how Elementor stores page data)
		update_post_meta( $post_id, '_elementor_data', wp_json_encode( $test_elements_data ) );
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );

		return $post_id;
	}

	/**
	 * Test that Atomic_Component_Styles extracts component IDs and triggers hooks
	 */
	public function test_atomic_component_styles_triggers_hooks_for_unique_component_ids() {
		// Arrange
		$atomic_component_styles = new Atomic_Component_Styles();
		$atomic_component_styles->register_hooks();

		$this->setup_test_hooks();
		$post_id = $this->create_test_post([
            // Not an e-component widget
            [
                'id' => 'e-some-widget-1',
                'elType' => 'widget',
                'widgetType' => 'e-some-widget',
                'settings' => [
                    'component_id' => [
                        '$$type' => 'string',
                        'value' => '50'
                    ]
                ]
            ],
            // First e-component widget with component-id "180"
            [
                'id' => 'e-component-1',
                'elType' => 'widget',
                'widgetType' => 'e-component',
                'settings' => [
                    'component_id' => [
                        '$$type' => 'string',
                        'value' => '180'
                    ]
                ]
            ],
            // Second e-component widget with same component-id "180" (should not trigger duplicate)
            [
                'id' => 'e-component-2',
                'elType' => 'widget', 
                'widgetType' => 'e-component',
                'settings' => [
                    'component_id' => [
                        '$$type' => 'string',
                        'value' => '180'
                    ]
                ]
            ],
            // Third e-component widget with different component-id "250"
            [
                'id' => 'e-component-3',
                'elType' => 'widget',
                'widgetType' => 'e-component', 
                'settings' => [
                    'component_id' => [
                        '$$type' => 'string',
                        'value' => '250'
                    ]
                ]
            ]
        ]);

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
	public function test_invalid_atomic_components_in_post() {
		// Arrange
		$atomic_component_styles = new Atomic_Component_Styles();
		$atomic_component_styles->register_hooks();

		$this->setup_test_hooks();
		$post_id = $this->create_test_post([
            [
                'id' => 'e-some-widget-1',
                'elType' => 'widget',
                'widgetType' => 'e-component',
                'settings' => [
                    'post_id' => [
                        '$$type' => 'string',
                        'value' => '180'
                    ]
                ]
            ]
        ]);

		// Act
		do_action( 'elementor/post/render', $post_id );

		// Assert
		$this->assertEquals( 1, $this->hook_call_count, 'Hook should be called once' );

		$expected_post_ids = [ $post_id ];
		$this->assertEquals( $expected_post_ids, $this->rendered_post_ids, 'Should render original post only' );
	}
}