<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Abilities\Request_Media_Upload_Ability;
use Elementor\Modules\Mcp\Abilities\Upload_Media_Ability;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Module;
use Elementor\Modules\Mcp\RestApi\Mcp_Media_Upload_REST_API;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Media_Feature_Gate extends Elementor_Test_Base {

	private const ROUTE = '/elementor/v1/mcp-media-upload';

	private const MEDIA_PROXY_SLUGS = [
		'upload-media',
		'request-media-upload',
	];

	public function setUp(): void {
		parent::setUp();

		$this->set_media_upload_experiment_state( Experiments_Manager::STATE_ACTIVE );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( Mcp_Media_Feature_Gate::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		parent::tearDown();
	}

	private function set_media_upload_experiment_state( string $state ): void {
		$experiments = Plugin::$instance->experiments;
		if ( ! $experiments->get_features( Mcp_Media_Feature_Gate::EXPERIMENT_NAME ) ) {
			$experiments->add_feature( Mcp_Media_Feature_Gate::get_experimental_data() );
		}
		$experiments->set_feature_default_state( Mcp_Media_Feature_Gate::EXPERIMENT_NAME, $state );
	}

	private function boot_rest_server(): void {
		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Media_Upload_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function test_is_enabled__is_off_by_default_and_follows_the_hidden_experiment() {
		// Arrange
		$experiments = Plugin::$instance->experiments;
		if ( ! $experiments->get_features( Mcp_Media_Feature_Gate::EXPERIMENT_NAME ) ) {
			$experiments->add_feature( Mcp_Media_Feature_Gate::get_experimental_data() );
		}
		$data = Mcp_Media_Feature_Gate::get_experimental_data();

		// Act
		$experiments->set_feature_default_state( Mcp_Media_Feature_Gate::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
		$inactive = Mcp_Media_Feature_Gate::is_enabled();
		$experiments->set_feature_default_state( Mcp_Media_Feature_Gate::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$active = Mcp_Media_Feature_Gate::is_enabled();

		// Assert
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertFalse( $inactive );
		$this->assertTrue( $active );
	}

	public function test_registry__includes_media_abilities_when_enabled() {
		// Act
		$registry = Module::build_core_registry();

		// Assert
		foreach ( self::MEDIA_PROXY_SLUGS as $slug ) {
			$this->assertNotNull( $registry->find_by_proxy_slug( $slug ) );
		}
	}

	public function test_rest_route__is_registered_when_enabled() {
		// Act
		$this->boot_rest_server();

		// Assert
		$this->assertArrayHasKey( self::ROUTE, rest_get_server()->get_routes() );
	}

	public function test_registry__excludes_media_abilities_when_disabled() {
		// Arrange
		$this->set_media_upload_experiment_state( Experiments_Manager::STATE_INACTIVE );

		// Act
		$registry = Module::build_core_registry();

		// Assert
		foreach ( self::MEDIA_PROXY_SLUGS as $slug ) {
			$this->assertNull( $registry->find_by_proxy_slug( $slug ) );
		}
	}

	public function test_rest_route__is_not_registered_when_disabled() {
		// Arrange
		$this->set_media_upload_experiment_state( Experiments_Manager::STATE_INACTIVE );

		// Act
		$this->boot_rest_server();

		// Assert
		$this->assertArrayNotHasKey( self::ROUTE, rest_get_server()->get_routes() );
	}

	private function media_abilities(): array {
		return [
			new Upload_Media_Ability(),
			new Request_Media_Upload_Ability(),
		];
	}

	public function test_is_available__is_true_when_enabled() {
		foreach ( $this->media_abilities() as $ability ) {
			// Assert
			$this->assertTrue( $ability->is_available() );
		}
	}
}
