<?php

use PHPUnit\Framework\TestCase;

use Elementor\Modules\Interactions\Interactions_Collector;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Interactions_Collector
 */
class Test_Interactions_Collector extends TestCase {

	/**
	 * Reset the singleton instance before each test to ensure isolation.
	 */
	protected function setUp(): void {
		parent::setUp();
		Interactions_Collector::instance()->reset();
	}

	/**
	 * Clean up after each test.
	 */
	protected function tearDown(): void {
		Interactions_Collector::instance()->reset();
		parent::tearDown();
	}

	/**
	 * Create a sample interaction data array for testing.
	 */
	private function create_sample_interactions( $effect = 'fade', $trigger = 'load' ) {
		return [
			'items' => [
				[
					'$$type' => 'interaction-item',
					'value' => [
						'interaction_id' => [
							'$$type' => 'string',
							'value' => 'test-id-' . uniqid(),
						],
						'trigger' => [
							'$$type' => 'string',
							'value' => $trigger,
						],
						'animation' => [
							'$$type' => 'animation-preset-props',
							'value' => [
								'effect' => [
									'$$type' => 'string',
									'value' => $effect,
								],
								'type' => [
									'$$type' => 'string',
									'value' => 'in',
								],
								'timing_config' => [
									'$$type' => 'timing-config',
									'value' => [
										'duration' => [
											'$$type' => 'number',
											'value' => 300,
										],
										'delay' => [
											'$$type' => 'number',
											'value' => 0,
										],
									],
								],
							],
						],
					],
				],
			],
			'version' => 1,
		];
	}

	// =========================================================================
	// Singleton Pattern Tests
	// =========================================================================

	public function test_instance__returns_same_instance() {
		$instance1 = Interactions_Collector::instance();
		$instance2 = Interactions_Collector::instance();

		$this->assertSame( $instance1, $instance2, 'Singleton should return the same instance' );
	}

	public function test_instance__returns_interactions_collector_type() {
		$instance = Interactions_Collector::instance();

		$this->assertInstanceOf( Interactions_Collector::class, $instance );
	}

	public function test_singleton__state_persists_across_calls() {
		$element_id = 'element-123';
		$interactions = $this->create_sample_interactions();

		// Register via first instance call
		Interactions_Collector::instance()->register( $element_id, $interactions );

		// Verify via second instance call
		$retrieved = Interactions_Collector::instance()->get( $element_id );

		$this->assertEquals( $interactions, $retrieved, 'Data should persist across singleton instance calls' );
	}

	// =========================================================================
	// register() Tests - Valid Data
	// =========================================================================

	public function test_register__stores_interaction_data_for_element() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-abc';
		$interactions = $this->create_sample_interactions();

		$collector->register( $element_id, $interactions );

		$this->assertEquals( $interactions, $collector->get( $element_id ) );
	}

	public function test_register__can_store_multiple_elements() {
		$collector = Interactions_Collector::instance();

		$element1_id = 'element-1';
		$element1_data = $this->create_sample_interactions( 'fade' );

		$element2_id = 'element-2';
		$element2_data = $this->create_sample_interactions( 'slide' );

		$element3_id = 'element-3';
		$element3_data = $this->create_sample_interactions( 'zoom' );

		$collector->register( $element1_id, $element1_data );
		$collector->register( $element2_id, $element2_data );
		$collector->register( $element3_id, $element3_data );

		$this->assertEquals( $element1_data, $collector->get( $element1_id ) );
		$this->assertEquals( $element2_data, $collector->get( $element2_id ) );
		$this->assertEquals( $element3_data, $collector->get( $element3_id ) );
	}

	public function test_register__overwrites_existing_data_for_same_element_id() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-overwrite';

		$original_data = $this->create_sample_interactions( 'fade' );
		$new_data = $this->create_sample_interactions( 'slide' );

		$collector->register( $element_id, $original_data );
		$collector->register( $element_id, $new_data );

		$this->assertEquals( $new_data, $collector->get( $element_id ) );
	}

	public function test_register__accepts_array_with_multiple_items() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-multi-items';

		$interactions = [
			'items' => [
				$this->create_sample_interactions( 'fade' )['items'][0],
				$this->create_sample_interactions( 'slide' )['items'][0],
				$this->create_sample_interactions( 'zoom' )['items'][0],
			],
			'version' => 1,
		];

		$collector->register( $element_id, $interactions );

		$retrieved = $collector->get( $element_id );
		$this->assertCount( 3, $retrieved['items'] );
	}

	public function test_register__accepts_numeric_element_id() {
		$collector = Interactions_Collector::instance();
		$element_id = '12345';
		$interactions = $this->create_sample_interactions();

		$collector->register( $element_id, $interactions );

		$this->assertEquals( $interactions, $collector->get( $element_id ) );
	}

	public function test_register__accepts_element_id_with_special_characters() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element_abc-123_def';
		$interactions = $this->create_sample_interactions();

		$collector->register( $element_id, $interactions );

		$this->assertEquals( $interactions, $collector->get( $element_id ) );
	}

	// =========================================================================
	// register() Tests - Invalid Data
	// =========================================================================

	public function test_register__ignores_empty_element_id() {
		$collector = Interactions_Collector::instance();
		$interactions = $this->create_sample_interactions();

		$collector->register( '', $interactions );

		$this->assertEmpty( $collector->get_all() );
	}

	public function test_register__ignores_null_element_id() {
		$collector = Interactions_Collector::instance();
		$interactions = $this->create_sample_interactions();

		$collector->register( null, $interactions );

		$this->assertEmpty( $collector->get_all() );
	}

	public function test_register__ignores_empty_interactions_array() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-empty';

		$collector->register( $element_id, [] );

		$this->assertNull( $collector->get( $element_id ) );
		$this->assertEmpty( $collector->get_all() );
	}

	public function test_register__ignores_null_interactions() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-null';

		$collector->register( $element_id, null );

		$this->assertNull( $collector->get( $element_id ) );
		$this->assertEmpty( $collector->get_all() );
	}

	public function test_register__ignores_when_both_params_empty() {
		$collector = Interactions_Collector::instance();

		$collector->register( '', [] );
		$collector->register( null, null );
		$collector->register( '', null );

		$this->assertEmpty( $collector->get_all() );
	}

	public function test_register__valid_registration_after_invalid_attempts() {
		$collector = Interactions_Collector::instance();

		// Invalid registrations
		$collector->register( '', $this->create_sample_interactions() );
		$collector->register( 'valid-element', [] );
		$collector->register( null, null );

		// Valid registration
		$valid_id = 'valid-element-123';
		$valid_data = $this->create_sample_interactions();
		$collector->register( $valid_id, $valid_data );

		$this->assertCount( 1, $collector->get_all() );
		$this->assertEquals( $valid_data, $collector->get( $valid_id ) );
	}

	// =========================================================================
	// get() Tests - Existing Elements
	// =========================================================================

	public function test_get__returns_correct_data_for_existing_element() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-get-test';
		$interactions = $this->create_sample_interactions( 'bounce', 'scrollIn' );

		$collector->register( $element_id, $interactions );

		$result = $collector->get( $element_id );

		$this->assertEquals( $interactions, $result );
	}

	public function test_get__returns_correct_element_when_multiple_registered() {
		$collector = Interactions_Collector::instance();

		$element1_id = 'first-element';
		$element1_data = $this->create_sample_interactions( 'fade' );

		$element2_id = 'second-element';
		$element2_data = $this->create_sample_interactions( 'slide' );

		$element3_id = 'third-element';
		$element3_data = $this->create_sample_interactions( 'zoom' );

		$collector->register( $element1_id, $element1_data );
		$collector->register( $element2_id, $element2_data );
		$collector->register( $element3_id, $element3_data );

		// Get middle element
		$result = $collector->get( $element2_id );

		$this->assertEquals( $element2_data, $result );
	}

	// =========================================================================
	// get() Tests - Non-Existing Elements
	// =========================================================================

	public function test_get__returns_null_for_non_existing_element() {
		$collector = Interactions_Collector::instance();

		$result = $collector->get( 'non-existent-element' );

		$this->assertNull( $result );
	}

	public function test_get__returns_null_when_collector_is_empty() {
		$collector = Interactions_Collector::instance();

		$result = $collector->get( 'any-element' );

		$this->assertNull( $result );
	}

	public function test_get__returns_null_for_similar_but_different_id() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-123';

		$collector->register( $element_id, $this->create_sample_interactions() );

		// Try to get with slightly different IDs
		$this->assertNull( $collector->get( 'element-1234' ) );
		$this->assertNull( $collector->get( 'element-12' ) );
		$this->assertNull( $collector->get( 'Element-123' ) ); // Case sensitive
		$this->assertNull( $collector->get( ' element-123' ) ); // Leading space
	}

	public function test_get__returns_null_after_reset() {
		$collector = Interactions_Collector::instance();
		$element_id = 'element-reset-test';

		$collector->register( $element_id, $this->create_sample_interactions() );
		$collector->reset();

		$this->assertNull( $collector->get( $element_id ) );
	}

	// =========================================================================
	// get_all() Tests
	// =========================================================================

	public function test_get_all__returns_empty_array_when_no_data() {
		$collector = Interactions_Collector::instance();

		$result = $collector->get_all();

		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	public function test_get_all__returns_single_element() {
		$collector = Interactions_Collector::instance();
		$element_id = 'single-element';
		$interactions = $this->create_sample_interactions();

		$collector->register( $element_id, $interactions );

		$result = $collector->get_all();

		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( $element_id, $result );
		$this->assertEquals( $interactions, $result[ $element_id ] );
	}

	public function test_get_all__returns_multiple_elements() {
		$collector = Interactions_Collector::instance();

		$elements = [
			'element-a' => $this->create_sample_interactions( 'fade' ),
			'element-b' => $this->create_sample_interactions( 'slide' ),
			'element-c' => $this->create_sample_interactions( 'zoom' ),
		];

		foreach ( $elements as $id => $data ) {
			$collector->register( $id, $data );
		}

		$result = $collector->get_all();

		$this->assertCount( 3, $result );
		$this->assertEquals( $elements, $result );
	}

	public function test_get_all__returns_data_keyed_by_element_id() {
		$collector = Interactions_Collector::instance();

		$collector->register( 'key-1', $this->create_sample_interactions() );
		$collector->register( 'key-2', $this->create_sample_interactions() );

		$result = $collector->get_all();

		$this->assertArrayHasKey( 'key-1', $result );
		$this->assertArrayHasKey( 'key-2', $result );
	}

	public function test_get_all__reflects_overwritten_data() {
		$collector = Interactions_Collector::instance();
		$element_id = 'overwrite-element';

		$original_data = $this->create_sample_interactions( 'fade' );
		$new_data = $this->create_sample_interactions( 'slide' );

		$collector->register( $element_id, $original_data );
		$collector->register( $element_id, $new_data );

		$result = $collector->get_all();

		$this->assertCount( 1, $result );
		$this->assertEquals( $new_data, $result[ $element_id ] );
	}

	public function test_get_all__with_large_number_of_elements() {
		$collector = Interactions_Collector::instance();
		$num_elements = 100;

		for ( $i = 0; $i < $num_elements; $i++ ) {
			$collector->register( "element-{$i}", $this->create_sample_interactions() );
		}

		$result = $collector->get_all();

		$this->assertCount( $num_elements, $result );
	}

	// =========================================================================
	// reset() Tests
	// =========================================================================

	public function test_reset__clears_all_data() {
		$collector = Interactions_Collector::instance();

		$collector->register( 'element-1', $this->create_sample_interactions() );
		$collector->register( 'element-2', $this->create_sample_interactions() );
		$collector->register( 'element-3', $this->create_sample_interactions() );

		$collector->reset();

		$this->assertEmpty( $collector->get_all() );
	}

	public function test_reset__allows_new_registrations_after() {
		$collector = Interactions_Collector::instance();

		$collector->register( 'old-element', $this->create_sample_interactions() );
		$collector->reset();

		$new_element_id = 'new-element';
		$new_data = $this->create_sample_interactions( 'new-effect' );
		$collector->register( $new_element_id, $new_data );

		$this->assertCount( 1, $collector->get_all() );
		$this->assertEquals( $new_data, $collector->get( $new_element_id ) );
	}

	public function test_reset__can_be_called_multiple_times() {
		$collector = Interactions_Collector::instance();

		$collector->register( 'element', $this->create_sample_interactions() );
		$collector->reset();
		$collector->reset();
		$collector->reset();

		$this->assertEmpty( $collector->get_all() );
	}

	public function test_reset__on_empty_collector_does_not_throw() {
		$collector = Interactions_Collector::instance();

		// Should not throw any errors
		$collector->reset();

		$this->assertEmpty( $collector->get_all() );
	}

	public function test_reset__does_not_affect_singleton_instance() {
		$instance_before = Interactions_Collector::instance();
		$instance_before->reset();
		$instance_after = Interactions_Collector::instance();

		$this->assertSame( $instance_before, $instance_after );
	}

	// =========================================================================
	// Integration / Edge Case Tests
	// =========================================================================

	public function test_workflow__typical_usage_pattern() {
		$collector = Interactions_Collector::instance();

		// Simulate rendering multiple elements with interactions
		$header_id = 'header-widget';
		$header_interactions = $this->create_sample_interactions( 'fade', 'load' );

		$content_id = 'content-section';
		$content_interactions = $this->create_sample_interactions( 'slide', 'scrollIn' );

		$footer_id = 'footer-widget';
		$footer_interactions = $this->create_sample_interactions( 'zoom', 'load' );

		// Register interactions as elements render
		$collector->register( $header_id, $header_interactions );
		$collector->register( $content_id, $content_interactions );
		$collector->register( $footer_id, $footer_interactions );

		// Collect all for frontend output
		$all_interactions = $collector->get_all();

		$this->assertCount( 3, $all_interactions );
		$this->assertEquals( $header_interactions, $all_interactions[ $header_id ] );
		$this->assertEquals( $content_interactions, $all_interactions[ $content_id ] );
		$this->assertEquals( $footer_interactions, $all_interactions[ $footer_id ] );

		// Reset for next page render
		$collector->reset();
		$this->assertEmpty( $collector->get_all() );
	}

	public function test_data_integrity__complex_nested_structure() {
		$collector = Interactions_Collector::instance();
		$element_id = 'complex-element';

		$complex_interactions = [
			'items' => [
				[
					'$$type' => 'interaction-item',
					'value' => [
						'trigger' => [ '$$type' => 'string', 'value' => 'load' ],
						'animation' => [
							'$$type' => 'animation-preset-props',
							'value' => [
								'effect' => [ '$$type' => 'string', 'value' => 'fade' ],
								'type' => [ '$$type' => 'string', 'value' => 'in' ],
								'direction' => [ '$$type' => 'string', 'value' => 'up' ],
								'timing_config' => [
									'$$type' => 'timing-config',
									'value' => [
										'duration' => [ '$$type' => 'number', 'value' => 500 ],
										'delay' => [ '$$type' => 'number', 'value' => 100 ],
									],
								],
								'config' => [
									'$$type' => 'config',
									'value' => [
										'offsetTop' => [ '$$type' => 'number', 'value' => 10 ],
										'offsetBottom' => [ '$$type' => 'number', 'value' => 90 ],
									],
								],
							],
						],
						'breakpoints' => [
							'$$type' => 'interaction-breakpoints',
							'value' => [
								'excluded' => [
									'$$type' => 'excluded-breakpoints',
									'value' => [
										[ '$$type' => 'string', 'value' => 'mobile' ],
									],
								],
							],
						],
					],
				],
			],
			'version' => 1,
		];

		$collector->register( $element_id, $complex_interactions );

		$retrieved = $collector->get( $element_id );

		// Verify the entire structure is preserved
		$this->assertEquals( $complex_interactions, $retrieved );

		// Verify deep nested values
		$this->assertEquals(
			500,
			$retrieved['items'][0]['value']['animation']['value']['timing_config']['value']['duration']['value']
		);
		$this->assertEquals(
			'mobile',
			$retrieved['items'][0]['value']['breakpoints']['value']['excluded']['value'][0]['value']
		);
	}
}
