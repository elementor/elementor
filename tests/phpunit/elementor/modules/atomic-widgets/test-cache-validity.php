<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Cache_Validity;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Cache_Validity extends Elementor_Test_Base {
	
	public function setUp(): void {
		parent::setUp();
		
		// Clear any cached data from previous tests to ensure test isolation
		$this->clear_cache_validity_options();
	}
	
	/**
	 * Clear all WordPress options used by Cache_Validity class.
	 */
	private function clear_cache_validity_options(): void {
		global $wpdb;
		
		// Delete all options that start with the cache key prefix
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				'elementor_atomic_cache_validity-%'
			)
		);
		
		// Clear the object cache to ensure options are truly cleared
		wp_cache_flush();
	}

	public function test_validation_on_root_key() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid(['test']),
			'Cache state should be false if not defined.'
		);

		// Act.
		$cache_validity->validate(['test']);

		// Assert.
		$this->assertTrue(
			$cache_validity->is_valid(['test']),
			'Cache state should be true after validation.'
		);

		// Act.
		$cache_validity->invalidate(['test']);

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid(['test']),
			'Cache state should be false after invalidation.'
		);
	}

	public function test_non_existing_items_are_invalid() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid(['non-existing']),
			'Cache state should be false for non-existing items.'
		);
	}

	public function test_validation_on_nested_keys() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid(['test']),
			'Cache state should be false if not defined.'
		);

		$this->assertFalse(
			$cache_validity->is_valid(['test', 'nested']),
			'Cache state should be false if not defined.'
		);

		// Act.
		$cache_validity->validate(['test', 'nested']);

		// Assert.
		$this->assertTrue(
			$cache_validity->is_valid(['test', 'nested']),
			'Cache state should be true after validation.'
		);
		$this->assertFalse(
			$cache_validity->is_valid(['test']),
			'Root cache state should remain false as long as it was not validated.'
		);

		// Act.
		$cache_validity->invalidate(['test', 'nested']);

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid(['test', 'nested']),
			'Cache state should be false after invalidation.'
		);
	}

	public function test_invalidation_root_should_invalidate_nested_items() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate(['test']);
		$cache_validity->validate(['test', 'depth1_1']);
		$cache_validity->validate(['test', 'depth1_1', 'depth2_1']);
		$cache_validity->validate(['test', 'depth1_1', 'depth2_2']);
		$cache_validity->validate(['test', 'depth1_2']);
		$cache_validity->validate(['test', 'depth1_2', 'depth2_1']);

		$cache_validity->invalidate(['test', 'depth1_1']);

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid(['test', 'depth1_1', 'depth2_1']),
			'Nested items should be invalidated too.'
		);
		$this->assertFalse(
			$cache_validity->is_valid(['test', 'depth1_1', 'depth2_2']),
			'Nested items should be invalidated too.'
		);
		$this->assertTrue(
			$cache_validity->is_valid(['test', 'depth1_2']),
			'Other nested items should remain valid.'
		);
		$this->assertTrue(
			$cache_validity->is_valid(['test', 'depth1_2', 'depth2_1']),
			'Other nested items should remain valid.'
		);
	}

	public function test_meta_data_is_stored_and_cleaned_responsively() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		$this->assertNull(
			$cache_validity->get_meta(['test']),
			'Meta data should be null if not set.'
		);

		// Act.
		$cache_validity->validate(['test'], ['meta' => 'data']);

		// Assert.
		$this->assertEquals(
			$cache_validity->get_meta(['test']),
			['meta' => 'data'],
			'Meta data should be stored.'
		);

		// Act.
		$cache_validity->invalidate(['test']);

		// Assert.
		$this->assertNull(
			$cache_validity->get_meta(['test']),
			'Meta data should be cleaned.'
		);
	}

	public function test_meta_data_is_stored_and_cleaned_responsively_for_nested_keys() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate(['test', 'nested'], ['foo' => 'bar']);

		// Assert.
		$this->assertEquals(
			$cache_validity->get_meta(['test', 'nested']),
			['foo' => 'bar'],
			'Meta data should be stored.'
		);

		$this->assertNull(
			$cache_validity->get_meta(['test']),
			'Meta data should be empty.'
		);
	}
}
