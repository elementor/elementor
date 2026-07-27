<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\OptIn\Opt_In;
use Elementor\Modules\Components\Module as ComponentsModule;
use Elementor\Modules\Interactions\Module as InteractionsModule;
use Elementor\Modules\Variables\Module as VariablesModule;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Opt_In extends Elementor_Test_Base {
	const MERGED_FEATURES = [
		VariablesModule::class,
		ComponentsModule::class,
		InteractionsModule::class,
	];

	public function test_experiment_is_registered_with_the_default_features(): void {
		// Act.
		$features = Plugin::instance()->experiments->get_features();

		// Assert - Editor V4 is registered by Experiments_Manager, before any module is constructed,
		// so that the V4 modules can rely on it while Modules_Manager is still building them.
		$this->assertArrayHasKey( Opt_In::EXPERIMENT_NAME, $features );
		$this->assertEmpty( $features[ Opt_In::EXPERIMENT_NAME ]['hidden'] );
	}

	public function test_ajax_opt_in_v4(): void {
		// Arrange.
		$this->act_as_admin();

		// Act.
		( new Opt_In )->ajax_opt_in_v4();

		// Assert.
		foreach (Opt_In::OPT_IN_FEATURES as $feature ) {
			$feature_key = Plugin::$instance->experiments->get_feature_option_key( $feature );
			$feature_state = get_option( $feature_key );
			$this->assertEquals( $feature_state, Plugin::$instance->experiments::STATE_ACTIVE );
		}
	}

	public function test_ajax_opt_out_v4(): void {
		// Arrange.
		$this->act_as_admin();

		// Act.
		( new Opt_In )->ajax_opt_out_v4();

		// Assert.
		foreach (Opt_In::OPT_OUT_FEATURES as $feature ) {
			$feature_key = Plugin::$instance->experiments->get_feature_option_key( $feature );
			$feature_state = get_option( $feature_key );

			$this->assertEquals( $feature_state, Plugin::$instance->experiments::STATE_INACTIVE );
		}
	}

	public function test_opt_in_v4__unauthorized_user(): void {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$this->expectException( \Exception::class );
		( new Opt_In )->ajax_opt_in_v4();
	}

	public function test_opt_out_v4__unauthorized_user(): void {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$this->expectException( \Exception::class );
		( new Opt_In )->ajax_opt_out_v4();
	}

	public function test_mirror_state__writes_the_new_state_to_the_mirrored_feature(): void {
		// Arrange.
		update_option( $this->atomic_option_key(), Experiments_Manager::STATE_ACTIVE );

		// Act.
		Opt_In::mirror_state( AtomicWidgetsModule::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		// Assert.
		$this->assertEquals( Experiments_Manager::STATE_INACTIVE, get_option( $this->atomic_option_key() ) );
	}

	/**
	 * Mirroring back an unchanged value must not fire update_option_, because that hook is what
	 * mirrors in the opposite direction and would otherwise recurse. Both Opt_In and WordPress
	 * itself skip the write, so this asserts the resulting contract rather than either guard.
	 */
	public function test_mirror_state__does_not_write_when_the_state_already_matches(): void {
		// Arrange.
		update_option( $this->atomic_option_key(), Experiments_Manager::STATE_ACTIVE );

		$writes = 0;
		$count_writes = function() use ( &$writes ) {
			$writes++;
		};

		add_action( 'update_option_' . $this->atomic_option_key(), $count_writes );

		// Act.
		Opt_In::mirror_state( AtomicWidgetsModule::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		remove_action( 'update_option_' . $this->atomic_option_key(), $count_writes );

		// Assert.
		$this->assertEquals( 0, $writes );
	}

	public function test_mirror_state__normalizes_a_non_string_state_to_default(): void {
		// Arrange - WordPress passes null to update_option for a registered field missing from the POST.
		update_option( $this->atomic_option_key(), Experiments_Manager::STATE_ACTIVE );

		// Act.
		Opt_In::mirror_state( AtomicWidgetsModule::EXPERIMENT_NAME, null );

		// Assert.
		$this->assertEquals( Experiments_Manager::STATE_DEFAULT, get_option( $this->atomic_option_key() ) );
	}

	public function test_opt_in_and_opt_out_keep_both_umbrella_options_aligned(): void {
		// Arrange.
		$this->act_as_admin();

		$opt_in = new Opt_In();

		// Act.
		$opt_in->ajax_opt_out_v4();

		// Assert.
		$this->assertEquals( get_option( $this->opt_in_option_key() ), get_option( $this->atomic_option_key() ) );

		// Act.
		$opt_in->ajax_opt_in_v4();

		// Assert.
		$this->assertEquals( get_option( $this->opt_in_option_key() ), get_option( $this->atomic_option_key() ) );
	}

	/**
	 * Variables, Variables Manager, Components and Interactions are merged into Editor V4: they
	 * depend on it and are immutable, so a stored state of their own must not bring them back once
	 * Editor V4 is off.
	 */
	public function test_merged_features_cannot_be_activated_while_editor_v4_is_off(): void {
		// Arrange - store an active state of their own, which must not win over Editor V4.
		update_option( $this->opt_in_option_key(), Experiments_Manager::STATE_INACTIVE );

		foreach ( self::MERGED_FEATURES as $module ) {
			$option_key = 'elementor_experiment-' . $module::get_experimental_data()['name'];

			update_option( $option_key, Experiments_Manager::STATE_ACTIVE );
		}

		// Act - Modules_Manager registers each module experiment while Editor V4 is already known.
		$experiments = new Experiments_Manager();

		foreach ( self::MERGED_FEATURES as $module ) {
			$experiments->add_feature( $module::get_experimental_data() );
		}

		// Assert.
		$this->assertFalse( $experiments->is_feature_active( Opt_In::EXPERIMENT_NAME ) );

		foreach ( self::MERGED_FEATURES as $module ) {
			$name = $module::get_experimental_data()['name'];

			$this->assertFalse( $experiments->is_feature_active( $name ), $name . ' should follow Editor V4' );
		}
	}

	private function opt_in_option_key(): string {
		return Plugin::$instance->experiments->get_feature_option_key( Opt_In::EXPERIMENT_NAME );
	}

	private function atomic_option_key(): string {
		return Plugin::$instance->experiments->get_feature_option_key( AtomicWidgetsModule::EXPERIMENT_NAME );
	}
}
