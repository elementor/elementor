<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
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

	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();
		$this->deactivate_atomic_editor();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/mcp/gated_ability_ids' );

		foreach ( $this->original_experiment_states as $name => $default ) {
			Plugin::$instance->experiments->set_feature_default_state( $name, $default );
			delete_option( Experiments_Manager::OPTION_PREFIX . $name );
		}

		parent::tearDown();
	}

	// ---------- gate helper ----------

	public function test_is_gated__returns_true_for_all_default_gated_ids() {
		foreach ( Mcp_V4_Gate::GATED_IDS as $id ) {
			$this->assertTrue( Mcp_V4_Gate::is_gated( $id ), "Expected {$id} to be gated" );
		}
	}

	public function test_is_gated__returns_false_for_well_known_ungated_ids() {
		$ungated = [
			'elementor/get-page-structure',
			'elementor/update-page-settings',
			'elementor/create-page',
			'elementor/publish-document',
			'elementor/list-posts',
			'elementor/list-assets',
			'elementor/list-resources',
			'elementor/read-resource',
			'elementor/style-best-practices',
			'elementor/wordpress-best-practices',
		];

		foreach ( $ungated as $id ) {
			$this->assertFalse( Mcp_V4_Gate::is_gated( $id ), "Expected {$id} to be ungated" );
		}
	}

	public function test_is_available__returns_wp_error_for_gated_id_when_v4_off() {
		foreach ( Mcp_V4_Gate::GATED_IDS as $id ) {
			$result = Mcp_V4_Gate::is_available( $id );
			$this->assertWPError( $result, "Expected {$id} to be unavailable when V4 is off" );
			$this->assertSame( 'elementor_v4_required', $result->get_error_code() );
		}
	}

	public function test_is_available__returns_true_for_gated_id_when_v4_on() {
		$this->activate_atomic_editor();

		foreach ( Mcp_V4_Gate::GATED_IDS as $id ) {
			$this->assertTrue( Mcp_V4_Gate::is_available( $id ), "Expected {$id} to be available when V4 is on" );
		}
	}

	public function test_is_available__returns_true_for_ungated_id_regardless_of_v4() {
		$ungated_id = 'elementor/get-page-structure';

		$this->assertTrue( Mcp_V4_Gate::is_available( $ungated_id ) );

		$this->activate_atomic_editor();
		$this->assertTrue( Mcp_V4_Gate::is_available( $ungated_id ) );
	}

	public function test_is_available__error_carries_description_notice_for_llm_hint() {
		$result = Mcp_V4_Gate::is_available( 'elementor/manage-elements' );

		$this->assertWPError( $result );
		$data = $result->get_error_data();
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'description_notice', $data );
		$this->assertStringContainsString( 'Editor V4', $data['description_notice'] );
	}

	// ---------- extensibility (Pro / third-party) ----------

	public function test_gated_ids_filter__allows_third_party_plugins_to_add_ids() {
		$custom_id = 'elementor-pro/some-v4-only-ability';

		$this->assertFalse( Mcp_V4_Gate::is_gated( $custom_id ), 'Sanity: custom ID is not gated before filter' );

		add_filter( 'elementor/mcp/gated_ability_ids', function ( array $ids ) use ( $custom_id ) {
			$ids[] = $custom_id;
			return $ids;
		} );

		$this->assertTrue( Mcp_V4_Gate::is_gated( $custom_id ), 'Filter should let third parties gate their abilities' );
		$this->assertWPError( Mcp_V4_Gate::is_available( $custom_id ), 'Filtered-in ID should be blocked when V4 is off' );

		$this->activate_atomic_editor();
		$this->assertTrue( Mcp_V4_Gate::is_available( $custom_id ), 'Filtered-in ID should be available when V4 is on' );
	}

	public function test_gated_ids_filter__ignores_non_array_return() {
		add_filter( 'elementor/mcp/gated_ability_ids', fn() => 'not-an-array' );

		foreach ( Mcp_V4_Gate::GATED_IDS as $id ) {
			$this->assertTrue( Mcp_V4_Gate::is_gated( $id ), "Default gated ID {$id} must survive a malformed filter return" );
		}
	}

	// ---------- execute_guarded behavior ----------

	public function test_execute_guarded__returns_wp_error_for_gated_ability_when_v4_off() {
		// Arrange
		$ability = $this->make_ability( 'elementor/manage-elements' );

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_v4_required', $result->get_error_code() );
		$this->assertStringContainsString( 'Atomic Editor', $result->get_error_message() );
		$this->assertStringContainsString( 'admin.php', $result->get_error_message() );
		$this->assertStringContainsString( 'reconnect', $result->get_error_message() );
	}

	public function test_execute_guarded__calls_execute_for_gated_ability_when_v4_on() {
		// Arrange
		$this->activate_atomic_editor();
		$ability = $this->make_ability( 'elementor/manage-elements' );

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertSame( [ 'ok' => true ], $result, 'Gated ability should execute normally when V4 is on' );
	}

	public function test_execute_guarded__calls_execute_for_ungated_ability_when_v4_off() {
		// Arrange
		$ability = $this->make_ability( 'elementor/get-page-structure' );

		// Act
		$result = $ability->execute_guarded( [] );

		// Assert
		$this->assertSame( [ 'ok' => true ], $result, 'Ungated ability should execute normally regardless of V4' );
	}

	// ---------- description carries the V4-inactive notice ----------

	public function test_description_for_llm__appends_v4_notice_when_gated_and_v4_off() {
		$ability = $this->make_ability( 'elementor/manage-elements', 'Bulk edit atomic elements.' );

		$description = $ability->get_description_for_llm();

		$this->assertStringContainsString( 'Bulk edit atomic elements.', $description, 'Original description must be preserved' );
		$this->assertStringContainsString( 'Editor V4', $description );
		$this->assertStringContainsString( 'INACTIVE', $description );
	}

	public function test_description_for_llm__omits_v4_notice_when_gated_and_v4_on() {
		$this->activate_atomic_editor();
		$ability = $this->make_ability( 'elementor/manage-elements', 'Bulk edit atomic elements.' );

		$description = $ability->get_description_for_llm();

		$this->assertSame( 'Bulk edit atomic elements.', $description );
	}

	public function test_description_for_llm__never_appends_notice_for_ungated_ability() {
		$ability = $this->make_ability( 'elementor/get-page-structure', 'Return the element tree.' );

		$this->assertSame( 'Return the element tree.', $ability->get_description_for_llm() );

		$this->activate_atomic_editor();
		$this->assertSame( 'Return the element tree.', $ability->get_description_for_llm() );
	}

	public function test_get_resource_description__appends_v4_notice_for_gated_resource_when_v4_off() {
		$ability = $this->make_ability( 'elementor/global-classes-resource', 'Reusable CSS classes.' );

		$description = $ability->get_resource_description();

		$this->assertStringContainsString( 'Reusable CSS classes.', $description );
		$this->assertStringContainsString( 'Editor V4', $description );
	}

	// ---------- subclass may add its own unavailability reasons ----------

	public function test_subclass_may_override_is_available_with_custom_error() {
		$ability = new class() extends Abstract_Ability {
			protected function get_ability_id(): string {
				return 'elementor/custom-ungated';
			}

			public function is_available() {
				return new \WP_Error(
					'my_dep_missing',
					'Requires Plugin X',
					[ 'description_notice' => 'NOTE: Requires Plugin X.' ]
				);
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Custom',
					'Does a thing.',
					'elementor',
					[ 'type' => 'object' ],
					[ 'annotations' => [ 'destructive' => false ] ],
					fn() => true
				);
			}

			public function execute( $input = [] ) {
				return [ 'ok' => true ];
			}
		};

		$result = $ability->execute_guarded( [] );
		$this->assertWPError( $result );
		$this->assertSame( 'my_dep_missing', $result->get_error_code() );

		$this->assertSame(
			'Does a thing. NOTE: Requires Plugin X.',
			$ability->get_description_for_llm()
		);
	}

	// ---------- exposure stays on for the LLM ----------

	public function test_gated_ability_stays_exposed_on_server_when_v4_off() {
		$ability = $this->make_ability( 'elementor/manage-elements' );

		$this->assertTrue( $ability->is_exposed_on_server(), 'Gated abilities must remain visible in tools/list so the LLM can discover the V4 requirement via the error response.' );
		$this->assertTrue( $ability->is_exposed_via_proxy() );
	}

	// ---------- helpers ----------

	private function activate_atomic_editor(): void {
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
	}

	private function deactivate_atomic_editor(): void {
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}

	private function set_experiment_state( string $name, string $state ): void {
		if ( ! array_key_exists( $name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $name );
			$this->original_experiment_states[ $name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $name );
	}

	private function make_ability( string $ability_id, string $description = 'Test ability' ): Abstract_Ability {
		return new class( $ability_id, $description ) extends Abstract_Ability {
			private string $id;
			private string $description;

			public function __construct( string $id, string $description ) {
				$this->id = $id;
				$this->description = $description;
			}

			protected function get_ability_id(): string {
				return $this->id;
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test',
					$this->description,
					'elementor',
					[ 'type' => 'object' ],
					[ 'annotations' => [ 'destructive' => false ] ],
					fn() => true
				);
			}

			public function execute( $input = [] ) {
				return [ 'ok' => true ];
			}
		};
	}
}
