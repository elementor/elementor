<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_V4_Gate extends Elementor_Test_Base {

	private const GATED_ID = 'elementor/manage-elements';
	private const UNGATED_ID = 'elementor/list-posts';

	private const ATOMIC_EDITOR_REQUIRED_MESSAGE = 'This site needs the Atomic Editor turned on before this can be built. Turn it on in WP Admin → Elementor → Settings → Atomic Editor, then try again.';
	private const ATOMIC_EDITOR_DESCRIPTION_NOTICE = 'Note: needs Atomic Editor (currently off for this site).';

	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();
		$this->set_atomic_editor_state( Experiments_Manager::STATE_INACTIVE );
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/mcp/gated_ability_ids' );

		foreach ( $this->original_experiment_states as $name => $default ) {
			Plugin::$instance->experiments->set_feature_default_state( $name, $default );
			delete_option( Experiments_Manager::OPTION_PREFIX . $name );
		}

		parent::tearDown();
	}

	public function test_is_gated__distinguishes_default_gated_and_ungated_ids() {
		$this->assertTrue( Mcp_V4_Gate::is_gated( self::GATED_ID ) );
		$this->assertFalse( Mcp_V4_Gate::is_gated( self::UNGATED_ID ) );
	}

	public function test_is_available__returns_atomic_editor_error_when_inactive() {
		$result = Mcp_V4_Gate::is_available( self::GATED_ID );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_v4_required', $result->get_error_code() );
		$this->assertSame( self::ATOMIC_EDITOR_REQUIRED_MESSAGE, $result->get_error_message() );

		$data = $result->get_error_data();
		$this->assertSame( self::ATOMIC_EDITOR_DESCRIPTION_NOTICE, $data['description_notice'] );
	}

	public function test_is_available__returns_true_for_gated_id_when_atomic_editor_active() {
		$this->set_atomic_editor_state( Experiments_Manager::STATE_ACTIVE );

		$this->assertTrue( Mcp_V4_Gate::is_available( self::GATED_ID ) );
	}

	public function test_gated_ids_filter__allows_third_party_plugins_to_add_ids() {
		$custom_id = 'elementor-pro/some-v4-only-ability';

		add_filter( 'elementor/mcp/gated_ability_ids', function ( array $ids ) use ( $custom_id ) {
			$ids[] = $custom_id;
			return $ids;
		} );

		$this->assertTrue( Mcp_V4_Gate::is_gated( $custom_id ) );
		$this->assertWPError( Mcp_V4_Gate::is_available( $custom_id ) );
	}

	private function set_atomic_editor_state( string $state ): void {
		$name = Atomic_Widgets_Module::EXPERIMENT_NAME;

		if ( ! array_key_exists( $name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $name );
			$this->original_experiment_states[ $name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $name );
	}
}
