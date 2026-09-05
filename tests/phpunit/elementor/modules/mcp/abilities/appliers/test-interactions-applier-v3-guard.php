<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Appliers;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Mcp\Abilities\Appliers\Interactions_Applier;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Interactions_Applier_V3_Guard extends Elementor_Test_Base {

	public function test_apply__v3_node_is_skipped_with_warning_and_no_write() {
		// Arrange.
		$this->with_atomic_experiment( Experiments_Manager::STATE_INACTIVE, function () {
			$applier = new Interactions_Applier();
			$index = [
				'legacy' => [
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [],
				],
			];

			// Act.
			$result = $applier->apply( $index, [
				'legacy' => [ $this->valid_interaction() ],
			] );

			// Assert.
			$this->assertNull( $result['error'] );
			$this->assertNotEmpty( $result['warnings'] );
			$this->assertStringContainsString( 'V4-only', $result['warnings'][0] );
			$this->assertStringContainsString( 'heading', $result['warnings'][0] );
			$this->assertArrayNotHasKey( 'interactions', $index['legacy'] );
		} );
	}

	public function test_apply__non_v3_node_is_unaffected_by_guard() {
		// Arrange.
		$applier = new Interactions_Applier();
		$index = [
			'atomic' => [
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [],
			],
		];

		// Act.
		$result = $applier->apply( $index, [
			'atomic' => [ $this->valid_interaction() ],
		] );

		// Assert: no V3 warning; result may still error/succeed based on resolver,
		// but the V3 guard specifically should not fire on an atomic widget.
		foreach ( (array) $result['warnings'] as $warning ) {
			$this->assertStringNotContainsString( 'V4-only', (string) $warning );
		}
	}

	private function valid_interaction(): array {
		return [
			'trigger' => 'load',
			'animation' => [
				'effect' => 'fade',
				'type' => 'in',
				'direction' => '',
				'timing_config' => [
					'duration' => [ 'size' => 600, 'unit' => 'ms' ],
					'delay'    => [ 'size' => 0,   'unit' => 'ms' ],
				],
				'config' => [
					'easing' => 'easeIn',
				],
			],
			'breakpoints' => [
				'excluded' => [],
			],
		];
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
