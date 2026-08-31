<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Widget_Context_Helper_V3_Allowlist extends Elementor_Test_Base {

	public function test_get_allowlisted_v3_types__with_v4_active__returns_gap_and_theme_only() {
		$this->with_atomic_experiment( Experiments_Manager::STATE_ACTIVE, function () {
			$types = Widget_Context_Helper::get_allowlisted_v3_types();

			foreach ( Widget_Context_Helper::V3_ALLOWLIST_GAP as $type ) {
				$this->assertContains( $type, $types );
			}
			foreach ( Widget_Context_Helper::V3_ALLOWLIST_THEME as $type ) {
				$this->assertContains( $type, $types );
			}
			foreach ( Widget_Context_Helper::V3_ALLOWLIST_BASIC as $type ) {
				$this->assertNotContains( $type, $types );
			}
		} );
	}

	public function test_get_allowlisted_v3_types__with_v4_inactive__adds_basic_widgets() {
		$this->with_atomic_experiment( Experiments_Manager::STATE_INACTIVE, function () {
			$types = Widget_Context_Helper::get_allowlisted_v3_types();

			foreach ( Widget_Context_Helper::V3_ALLOWLIST_BASIC as $type ) {
				$this->assertContains( $type, $types );
			}
			foreach ( Widget_Context_Helper::V3_ALLOWLIST_GAP as $type ) {
				$this->assertContains( $type, $types );
			}
			foreach ( Widget_Context_Helper::V3_ALLOWLIST_THEME as $type ) {
				$this->assertContains( $type, $types );
			}
		} );
	}

	public function test_is_v3_allowlisted__delegates_to_get_allowlisted_v3_types() {
		$this->with_atomic_experiment( Experiments_Manager::STATE_ACTIVE, function () {
			$this->assertTrue( Widget_Context_Helper::is_v3_allowlisted( 'nav-menu' ) );
			$this->assertFalse( Widget_Context_Helper::is_v3_allowlisted( 'unknown-v3-widget' ) );
		} );
	}

	private function with_atomic_experiment( string $state, callable $callback ): void {
		$experiments = Plugin::$instance->experiments;
		$feature_key = $experiments->get_feature_option_key( AtomicWidgetsModule::EXPERIMENT_NAME );
		$original_state = get_option( $feature_key );

		update_option( $feature_key, $state );

		try {
			$callback();
		} finally {
			if ( false === $original_state ) {
				delete_option( $feature_key );
			} else {
				update_option( $feature_key, $original_state );
			}
		}
	}
}
