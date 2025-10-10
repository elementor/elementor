<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\CacheValidity\Cache_Validity;
use Elementor\Modules\AtomicWidgets\CacheValidity\Cache_Validity_Item;
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
		delete_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );
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
		$cache_validity->validate( [ ROOT_KEY, 'nested' ], [ 'foo' => 'bar' ] );

		// Assert.
		$this->assertEquals(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			[ 'foo' => 'bar' ],
			'Meta data should be stored for root key.'
		);
		$this->assertEquals(
			$cache_validity->get_meta( [ ROOT_KEY, 'nested' ] ),
			[ 'foo' => 'bar' ],
			'Meta data should be stored for nested key.'
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY, 'nested' ] );

		// Assert.
		$this->assertEquals(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			[ 'foo' => 'bar' ],
			'Meta data should remain stored for root key.'
		);
		$this->assertNull(
			$cache_validity->get_meta( [ ROOT_KEY, 'nested' ] ),
			'Meta data should be cleaned for nested key.'
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

	public function test_clear_method() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY ], [ 'foo' => 'bar' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested' ], [ 'foo' => 'bar' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-2' ], [ 'foo' => 'bar' ] );

		$cache_validity->invalidate( [ ROOT_KEY, 'nested' ] );

		// Assert.
		$this->assertTrue(
			$cache_validity->is_valid( [ ROOT_KEY ] ),
			'Cache state should be true after clearing.'
		);
		$this->assertEquals(
			$cache_validity->get_meta( [ ROOT_KEY ] ),
			[ 'foo' => 'bar' ],
			'Meta data should be stored.'
		);
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY, 'nested' ] ),
			'Cache state should be false after clearing.'
		);
		$this->assertFalse(
			$cache_validity->is_valid( [ ROOT_KEY, 'nested', 'nested-2' ] ),
			'Cache state of children should be false too.'
		);
		$this->assertNull(
			$cache_validity->get_meta( [ ROOT_KEY, 'nested' ] ),
			'Meta data should be empty after clearing.'
		);
		$this->assertNull(
			$cache_validity->get_meta( [ ROOT_KEY, 'nested', 'nested-2' ] ),
			'Meta data of children should be empty too.'
		);
	}

	public function test_stored_data() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => true,
				'meta' => null,
			],
			$stored_data,
		);
	}

	public function test_stored_data_with_meta() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY ], [ 'foo' => 'bar' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => true,
				'meta' => [ 'foo' => 'bar' ],
			],
			$stored_data,
		);
	}

	public function test_stored_data_with_nested_keys() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-2' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => false,
				'children' => [
					'nested' => [
						'state' => false,
						'children' => [
							'nested-2' => true,
						],
					],
				],
			],
			$stored_data,
		);

		// Act.
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-2' ], [ 'foo' => 'bar' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-3' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => false,
				'children' => [
					'nested' => [
						'state' => false,
						'children' => [
							'nested-2' => [
								'state' => true,
								'meta' => [ 'foo' => 'bar' ],
							],
							'nested-3' => true,
						],
					],
				],
			],
			$stored_data,
			'Should store the most minimal data.'
		);
	}

	public function test_stored_data_after_invalidation() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		$cache_validity->validate( [ ROOT_KEY ], [ 'foo' => 'bar' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested' ], [ 'foo' => 'bar' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-2' ], [ 'foo' => 'bar' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-3' ] );

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY, 'nested', 'nested-2' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => true,
				'meta' => [ 'foo' => 'bar' ],
				'children' => [
					'nested' => [
						'state' => true,
						'meta' => [ 'foo' => 'bar' ],
						'children' => [
							'nested-3' => true,
						],
					],
				],
			],
			$stored_data,
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY, 'nested' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY, null );

		$this->assertEquals(
			[
				'state' => true,
				'children' => [],
				'meta' => [ 'foo' => 'bar' ],
			],
			$stored_data,
		);
	}

	public function test_placeholder_nodes_are_removed_after_invalidation() {
		// Arrange.
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-1', 'empty-1', 'empty-2', 'nested-1-1' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-2', 'empty-3', 'empty-4', 'nested-2-1', 'nested-2-1-1' ] );
		$cache_validity->validate( [ ROOT_KEY, 'nested', 'nested-2', 'empty-3', 'empty-4', 'nested-2-1', 'nested-2-1-2' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => false,
				'children' => [
					'nested' => [
						'state' => false,
						'children' => [
							'nested-1' => [
								'state' => false,
								'children' => [
									'empty-1' => [
										'state' => false,
										'children' => [
											'empty-2' => [
												'state' => false,
												'children' => [
													'nested-1-1' => true,
												],
											],
										],
									],
								],
							],
							'nested-2' => [
								'state' => false,
								'children' => [
									'empty-3' => [
										'state' => false,
										'children' => [
											'empty-4' => [
												'state' => false,
												'children' => [
													'nested-2-1' => [
														'state' => false,
														'children' => [
															'nested-2-1-1' => true,
															'nested-2-1-2' => true,
														],
													],
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],
			$stored_data,
			'Stored data should include all required placeholders'
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY, 'nested', 'nested-1', 'empty-1', 'empty-2', 'nested-1-1' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => false,
				'children' => [
					'nested' => [
						'state' => false,
						'children' => [
							'nested-2' => [
								'state' => false,
								'children' => [
									'empty-3' => [
										'state' => false,
										'children' => [
											'empty-4' => [
												'state' => false,
												'children' => [
													'nested-2-1' => [
														'state' => false,
														'children' => [
															'nested-2-1-1' => true,
															'nested-2-1-2' => true,
														],
													],
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],
			$stored_data,
			'Should remove the whole path of placeholder nodes'
		);

		// Act.
		$cache_validity->invalidate( [ ROOT_KEY, 'nested', 'nested-2', 'empty-3', 'empty-4' ] );

		// Assert.
		$stored_data = get_option( Cache_Validity_Item::CACHE_KEY_PREFIX . ROOT_KEY );

		$this->assertEquals(
			[
				'state' => false,
				'children' => [],
			],
			$stored_data,
		);
	}
}
