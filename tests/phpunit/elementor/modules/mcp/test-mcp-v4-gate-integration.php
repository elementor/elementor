<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Global_Classes_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\List_Resources_Ability;
use Elementor\Modules\Mcp\Abilities\Style_Best_Practices_Ability;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 * @group integration
 */
class Test_Mcp_V4_Gate_Integration extends Elementor_Test_Base {

	private const ATOMIC_EDITOR_REQUIRED_MESSAGE = 'This site needs the Atomic Editor turned on before this can be built. Turn it on in WP Admin → Elementor → Settings → Atomic Editor, then try again.';
	private const ATOMIC_EDITOR_DESCRIPTION_NOTICE = 'Note: needs Atomic Editor (currently off for this site).';

	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Proxy_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );

		$this->set_atomic_editor_state( Experiments_Manager::STATE_INACTIVE );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $name => $default ) {
			Plugin::$instance->experiments->set_feature_default_state( $name, $default );
			delete_option( Experiments_Manager::OPTION_PREFIX . $name );
		}

		parent::tearDown();
	}

	public function test_mcp_proxy__blocks_gated_tool_when_atomic_editor_inactive() {
		// Arrange
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-elements',
			'input' => [
				'post_id' => 1,
				'operations' => [],
			],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'elementor_v4_required', $response->get_data()['code'] );
		$this->assertSame( self::ATOMIC_EDITOR_REQUIRED_MESSAGE, $response->get_data()['message'] );
	}

	public function test_mcp_proxy__allows_ungated_tool_when_atomic_editor_inactive() {
		// Arrange
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'list-posts',
			'input' => [
				'per_page' => 1,
			],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::OK, $response->get_status() );
		$this->assertArrayHasKey( 'posts', $response->get_data() );
	}

	public function test_mcp_proxy__does_not_block_gated_tool_when_atomic_editor_active() {
		// Arrange
		$this->set_atomic_editor_state( Experiments_Manager::STATE_ACTIVE );
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-elements',
			'input' => [
				'post_id' => 1,
				'operations' => [],
			],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert — gate passed; empty operations fail validation instead of Atomic Editor gate
		$this->assertNotSame( 'elementor_v4_required', $response->get_data()['code'] ?? '' );
	}

	public function test_list_resources__includes_unavailable_notice_for_gated_resources_when_atomic_editor_inactive() {
		// Arrange
		$this->act_as_admin();
		$catalog = $this->resource_catalog_by_uri();

		// Assert
		$this->assertStringContainsString(
			self::ATOMIC_EDITOR_DESCRIPTION_NOTICE,
			$catalog[ Global_Classes_Resource_Ability::URI ]['description']
		);
		$this->assertStringNotContainsString(
			self::ATOMIC_EDITOR_DESCRIPTION_NOTICE,
			$catalog[ Style_Best_Practices_Ability::URI ]['description']
		);
	}

	public function test_list_resources__omits_unavailable_notice_when_atomic_editor_active() {
		// Arrange
		$this->set_atomic_editor_state( Experiments_Manager::STATE_ACTIVE );
		$this->act_as_admin();
		$catalog = $this->resource_catalog_by_uri();

		// Assert
		$this->assertStringNotContainsString(
			self::ATOMIC_EDITOR_DESCRIPTION_NOTICE,
			$catalog[ Global_Classes_Resource_Ability::URI ]['description']
		);
	}

	public function test_manage_elements__description_includes_unavailable_notice_when_atomic_editor_inactive() {
		// Arrange
		$ability = Mcp_Module::build_core_registry()->find_by_proxy_slug( 'manage-elements' );

		// Act
		$description = $ability->get_description_for_llm();

		// Assert
		$this->assertStringContainsString( self::ATOMIC_EDITOR_DESCRIPTION_NOTICE, $description );
	}

	private function resource_catalog_by_uri(): array {
		$catalog = ( new List_Resources_Ability( Mcp_Module::build_core_registry() ) )->execute()['resources'];

		return array_column( $catalog, null, 'uri' );
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
