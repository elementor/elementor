<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\OptIn\Opt_In;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Opt_In extends Elementor_Test_Base {
	private array $original_states = [];

	public function setUp(): void {
		parent::setUp();

		$this->original_states = array_column( Plugin::$instance->experiments->get_features(), 'state', 'name' );
	}

	public function tearDown(): void {
		$experiments = Plugin::$instance->experiments;

		foreach ( $this->original_states as $name => $state ) {
			if ( $experiments->get_features( $name )['state'] !== $state ) {
				$experiments->set_feature_state( $name, $state );
			}
		}

		parent::tearDown();
	}

	public function test_init__registers_feature(): void {
		// Act.
		( new Opt_In )->init();

		// Assert.
		$feature = Plugin::instance()->experiments->get_features();

		$this->assertArrayHasKey( Opt_In::EXPERIMENT_NAME, $feature );
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
}
