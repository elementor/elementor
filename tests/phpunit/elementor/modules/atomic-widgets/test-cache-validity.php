<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Cache_Validity;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const ROOT_KEY = 'test';

class Test_Cache_Validity extends Elementor_Test_Base {

	public function tear_down() {
		parent::tear_down();

		// Clear any cached data from previous tests to ensure test isolation
		$this->clear_cache_validity_options();
	}

	/**
	 * Clear all WordPress options used by Cache_Validity class.
	 */
	private function clear_cache_validity_options(): void {
		delete_option( Cache_Validity::CACHE_KEY_PREFIX . ROOT_KEY );
	}

	public function test_validation_on_root_key() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY ] ),
			'Cache state should be false if not defined.'
		);

		// Act.
		$cache_validity->validate( [ ROOT_KEY ] );

		// Assert.
		$this->assertTrue(
			$cache_validity->is_valid( [ ROOT_KEY ] ),
			'Cache state should be true after validation.'
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY ] );

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY ] ),
			'Cache state should be false after invalidation.'
		);
	}

	public function test_non_existing_items_are_invalid() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( [ 'non-existing' ] ),
			'Cache state should be false for non-existing items.'
		);
	}

	public function test_validation_on_nested_keys() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY ] ),
			'Cache state should be false if not defined.'
		);

		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY, 'nested' ] ),
			'Cache state should be false if not defined.'
		);

		// Act.
		$cache_validity->validate( [ ROOT_KEY, 'nested' ] );

		// Assert.
		$this->assertTrue(
			$cache_validity->is_valid( [ ROOT_KEY, 'nested' ] ),
			'Cache state should be true after validation.'
		);
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY ] ),
			'Root cache state should remain false as long as it was not validated.'
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY, 'nested' ] );

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY, 'nested' ] ),
			'Cache state should be false after invalidation.'
		);
	}

	public function test_invalidation_root_should_invalidate_nested_items() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY ] );
		$cache_validity->validate( [ ROOT_KEY, 'depth1_1' ] );
		$cache_validity->validate( [ ROOT_KEY, 'depth1_1', 'depth2_1' ] );
		$cache_validity->validate( [ ROOT_KEY, 'depth1_1', 'depth2_2' ] );
		$cache_validity->validate( [ ROOT_KEY, 'depth1_2' ] );
		$cache_validity->validate( [ ROOT_KEY, 'depth1_2', 'depth2_1' ] );

		$cache_validity->invalidate( [ ROOT_KEY, 'depth1_1' ] );

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY, 'depth1_1', 'depth2_1' ] ),
			'Nested items should be invalidated too.'
		);
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY, 'depth1_1', 'depth2_2' ] ),
			'Nested items should be invalidated too.'
		);
		$this->assertTrue(
			$cache_validity->is_valid( [ ROOT_KEY, 'depth1_2' ] ),
			'Other nested items should remain valid.'
		);
		$this->assertTrue(
			$cache_validity->is_valid( [ ROOT_KEY, 'depth1_2', 'depth2_1' ] ),
			'Other nested items should remain valid.'
		);
	}

	public function test_meta_data_is_stored_and_cleaned_responsively() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		$this->assertNull(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			'Meta data should be null if not set.'
		);

		// Act.
		$cache_validity->validate( [ ROOT_KEY ], [ 'foo' => 'bar' ] );

		// Assert.
		$this->assertEquals(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			[ 'foo' => 'bar' ],
			'Meta data should be stored.'
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY ] );

		// Assert.
		$this->assertNull(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			'Meta data should be cleaned.'
		);
	}

	public function test_meta_data_is_stored_and_cleaned_responsively_for_nested_keys() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY, 'nested' ], [ 'foo' => 'bar' ] );

		// Assert.
		$this->assertEquals(
			$cache_validity->get_meta( [ ROOT_KEY, 'nested' ] ),
			[ 'foo' => 'bar' ],
			'Meta data should be stored.'
		);

		$this->assertNull(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			'Meta data should be empty.'
		);
	}
}
