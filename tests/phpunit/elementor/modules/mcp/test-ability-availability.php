<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Ability_Availability extends Elementor_Test_Base {

	const V4_ONLY_ABILITY_IDS = [
		'elementor/manage-component',
		'elementor/list-components',
		'elementor/manage-classes',
		'elementor/reorder-classes',
		'elementor/global-classes-resource',
		'elementor/manage-default-styles',
		'elementor/get-default-styles',
		'elementor/manage-global-variable',
		'elementor/global-variables-resource',
		'elementor/manage-global-variable-guide',
		'elementor/interactions-schema-resource',
	];

	const ALWAYS_AVAILABLE_ABILITY_IDS = [
		'elementor/get-page-structure',
		'elementor/build-composition',
		'elementor/manage-elements',
		'elementor/create-page',
		'elementor/publish-document',
	];

	public function test_v4_only_abilities_are_omitted_when_atomic_experiment_is_inactive() {
		// Arrange.
		$this->with_atomic_experiment( Experiments_Manager::STATE_INACTIVE, function () {
			$registry = Mcp_Module::build_core_registry();

			$ids = array_map(
				static fn ( $ability ) => $ability->get_id(),
				$registry->all()
			);

			// Assert.
			foreach ( self::V4_ONLY_ABILITY_IDS as $ability_id ) {
				$this->assertNotContains( $ability_id, $ids, sprintf( 'V4-only ability %s should be omitted when atomic experiment is off.', $ability_id ) );
			}

			foreach ( self::ALWAYS_AVAILABLE_ABILITY_IDS as $ability_id ) {
				$this->assertContains( $ability_id, $ids, sprintf( 'Always-available ability %s should be registered regardless of experiment state.', $ability_id ) );
			}
		} );
	}

	public function test_v4_only_abilities_are_registered_when_atomic_experiment_is_active() {
		// Arrange.
		$this->with_atomic_experiment( Experiments_Manager::STATE_ACTIVE, function () {
			$registry = Mcp_Module::build_core_registry();

			$ids = array_map(
				static fn ( $ability ) => $ability->get_id(),
				$registry->all()
			);

			// Assert.
			foreach ( self::V4_ONLY_ABILITY_IDS as $ability_id ) {
				$this->assertContains( $ability_id, $ids, sprintf( 'V4-only ability %s should be registered when atomic experiment is on.', $ability_id ) );
			}
		} );
	}

	public function test_shared_registry_slug_list_reflects_gating() {
		// Arrange.
		$this->with_atomic_experiment( Experiments_Manager::STATE_INACTIVE, function () {
			$registry = Mcp_Module::build_core_registry();

			$tool_ids = array_map(
				static fn ( $ability ) => $ability->get_id(),
				$registry->tools()
			);

			$resource_ids = array_map(
				static fn ( $ability ) => $ability->get_id(),
				$registry->resources()
			);

			$all_exposed = array_merge( $tool_ids, $resource_ids );

			// Assert.
			foreach ( self::V4_ONLY_ABILITY_IDS as $ability_id ) {
				$this->assertNotContains( $ability_id, $all_exposed, sprintf( 'V4-only ability %s should not appear in tool/resource lists when atomic experiment is off.', $ability_id ) );
			}
		} );
	}

	private function with_atomic_experiment( string $state, callable $callback ): void {
		$experiments = Plugin::$instance->experiments;
		$feature_option_key = $experiments->get_feature_option_key( AtomicWidgetsModule::EXPERIMENT_NAME );
		$original_state = get_option( $feature_option_key );

		update_option( $feature_option_key, $state );

		try {
			$callback();
		} finally {
			if ( false === $original_state ) {
				delete_option( $feature_option_key );
			} else {
				update_option( $feature_option_key, $original_state );
			}
		}
	}
}
