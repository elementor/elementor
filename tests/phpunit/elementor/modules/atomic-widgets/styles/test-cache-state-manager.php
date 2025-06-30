<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Cache_State_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Cache_State_Manager extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();


	}

	public function tearDown(): void {
		parent::tearDown();


	}

	public function test_validation_on_root_key() {
		// Arrange.
		$cache_state_manager = new Cache_State_Manager();

		// Assert.
		$this->assertFalse(
			$cache_state_manager->get(['test']),
			'Cache state should be false if not defined.'
		);

		// Act.
		$cache_state_manager->validate(['test']);

		// Assert.
		$this->assertTrue(
			$cache_state_manager->get(['test']),
			'Cache state should be true after validation.'
		);

		// Act.
		$cache_state_manager->invalidate(['test']);

		// Assert.
		$this->assertFalse(
			$cache_state_manager->get(['test']),
			'Cache state should be false after invalidation.'
		);
	}

	public function test_non_existing_items_are_invalid() {
		// Arrange.
		$cache_state_manager = new Cache_State_Manager();

		// Assert.
		$this->assertFalse(
			$cache_state_manager->get(['non-existing']),
			'Cache state should be false for non-existing items.'
		);
	}

	public function test_validation_on_nested_keys() {
		// Arrange.
		$cache_state_manager = new Cache_State_Manager();

		// Assert.
		$this->assertFalse(
			$cache_state_manager->get(['test']),
			'Cache state should be false if not defined.'
		);

		$this->assertFalse(
			$cache_state_manager->get(['test', 'nested']),
			'Cache state should be false if not defined.'
		);

		// Act.
		$cache_state_manager->validate(['test', 'nested']);

		// Assert.
		$this->assertTrue(
			$cache_state_manager->get(['test', 'nested']),
			'Cache state should be true after validation.'
		);
		$this->assertFalse(
			$cache_state_manager->get(['test']),
			'Root cache state should remain false as long as it was not validated.'
		);

		// Act.
		$cache_state_manager->invalidate(['test', 'nested']);

		// Assert.
		$this->assertFalse(
			$cache_state_manager->get(['test', 'nested']),
			'Cache state should be false after invalidation.'
		);
	}

	public function test_invalidation_root_should_invalidate_nested_items() {
		// Arrange.
		$cache_state_manager = new Cache_State_Manager();

		// Act.
		$cache_state_manager->validate(['test']);
		$cache_state_manager->validate(['test', 'depth1_1']);
		$cache_state_manager->validate(['test', 'depth1_1', 'depth2_1']);
		$cache_state_manager->validate(['test', 'depth1_1', 'depth2_2']);
		$cache_state_manager->validate(['test', 'depth1_2']);
		$cache_state_manager->validate(['test', 'depth1_2', 'depth2_1']);

		$cache_state_manager->invalidate(['test', 'depth1_1']);

		// Assert.
		$this->assertFalse(
			$cache_state_manager->get(['test', 'depth1_1', 'depth2_1']),
			'Nested items should be invalidated too.'
		);
		$this->assertFalse(
			$cache_state_manager->get(['test', 'depth1_1', 'depth2_2']),
			'Nested items should be invalidated too.'
		);
		$this->assertTrue(
			$cache_state_manager->get(['test', 'depth1_2']),
			'Other nested items should remain valid.'
		);
		$this->assertTrue(
			$cache_state_manager->get(['test', 'depth1_2', 'depth2_1']),
			'Other nested items should remain valid.'
		);
	}
}
