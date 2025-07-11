<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Cache_Validity;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Cache_Validity extends Elementor_Test_Base {
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
}
