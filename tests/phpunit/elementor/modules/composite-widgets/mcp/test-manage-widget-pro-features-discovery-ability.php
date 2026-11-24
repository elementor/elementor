<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\CompositeWidgets\Mcp\Manage_Widget_Pro_Features_Discovery_Ability;
use Elementor\Modules\CompositeWidgets\Mcp\Site_Widgets_Pro_Features_Discovery;
use Elementor\Modules\CompositeWidgets\Module as Composite_Widgets_Module;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Plugin;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Widget_Pro_Features_Discovery_Ability extends Elementor_Test_Base {
	private string $original_experiment_state;

	public function setUp(): void {
		parent::setUp();

		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Elementor Pro registers the real elementor/manage-widget.' );
		}

		$this->original_experiment_state = Plugin::$instance->experiments->get_features( Composite_Widgets_Module::EXPERIMENT_NAME )['default'];
	}

	public function tearDown(): void {
		if ( isset( $this->original_experiment_state ) ) {
			Plugin::$instance->experiments->set_feature_default_state( Composite_Widgets_Module::EXPERIMENT_NAME, $this->original_experiment_state );
		}

		parent::tearDown();
	}

	/**
	 * @dataProvider experiment_states_provider
	 */
	public function test_get_composite_widgets_abilities__adds_the_stub_only_with_the_experiment( string $state, bool $expected_registered ) {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Composite_Widgets_Module::EXPERIMENT_NAME, $state );

		// Act.
		$abilities = Mcp_Module::get_composite_widgets_abilities();

		// Assert.
		$stubs = array_filter( $abilities, fn ( $ability ) => $ability instanceof Manage_Widget_Pro_Features_Discovery_Ability );
		$this->assertSame( $expected_registered, 1 === count( $stubs ) );
	}

	public function experiment_states_provider(): array {
		return [
			'active' => [ Experiments_Manager::STATE_ACTIVE, true ],
			'inactive' => [ Experiments_Manager::STATE_INACTIVE, false ],
		];
	}

	/**
	 * @dataProvider actions_provider
	 */
	public function test_execute__returns_the_upgrade_path_for_every_action( string $action ) {
		// Arrange.
		$ability = new Manage_Widget_Pro_Features_Discovery_Ability();

		// Act.
		$result = $ability->execute( [ 'action' => $action ] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( Pro_Features_Discovery::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( Site_Widgets_Pro_Features_Discovery::PRO_FEATURE, $result->get_error_data()['pro_feature'] );
		$this->assertSame( $action, $result->get_error_data()['action'] );
		$this->assertStringContainsString( '[Upgrade to Pro](' . Site_Widgets_Pro_Features_Discovery::UPGRADE_URL . ')', $result->get_error_message() );
	}

	public function actions_provider(): array {
		return array_map( fn ( string $action ) => [ $action ], array_combine(
			Manage_Widget_Pro_Features_Discovery_Ability::ACTIONS,
			Manage_Widget_Pro_Features_Discovery_Ability::ACTIONS
		) );
	}
}
