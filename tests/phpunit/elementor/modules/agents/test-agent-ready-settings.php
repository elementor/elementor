<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agent_Ready_Settings extends Elementor_Test_Base {

	const ROUTE = '/elementor/v1/settings/' . Agent_Ready_Settings::OPTION;

	private Module $module;

	private Agent_Ready_Settings $settings;

	private $original_experiment_default_state;

	private string $original_request_uri;

	public function setUp(): void {
		parent::setUp();

		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? '/';

		$this->act_as_admin();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		delete_option( Agent_Ready_Settings::OPTION );

		$this->module   = new Module();
		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		$_SERVER['REQUEST_URI'] = $this->original_request_uri;

		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_ensure_option_exists__creates_defaults_without_autoload() {
		// Arrange
		delete_option( Agent_Ready_Settings::OPTION );
		wp_cache_delete( 'alloptions', 'options' );

		// Act
		$this->settings->ensure_option_exists();

		// Assert
		$this->assertTrue( $this->settings->is_llms_enabled() );
		$this->assertFalse( $this->settings->is_llms_manually_edited() );
		$this->assertArrayNotHasKey( Agent_Ready_Settings::OPTION, wp_load_alloptions() );
	}

	public function test_rest_update__merges_module_keys_and_keeps_other_modules() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', true );

		// Act
		$response = $this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => false ],
		] );

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$this->assertFalse( $this->settings->is_llms_enabled() );
		$this->assertSame(
			[ 'enabled' => true ],
			$this->settings->get_module_settings( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT )
		);
	}

	public function test_rest_update__ignores_client_manually_edited_flag() {
		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [
				'enabled'            => false,
				'is_manually_edited' => true,
			],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_llms_manually_edited() );
	}

	public function test_rest_update__keeps_server_set_manually_edited_flag() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'is_manually_edited', true );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [
				'enabled'            => false,
				'is_manually_edited' => false,
			],
		] );

		// Assert
		$this->assertTrue( $this->settings->is_llms_manually_edited() );
	}

	public function test_rest_update__keeps_only_available_post_types() {
		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'post_types' => [ 'page', 'not_a_post_type' ] ],
		] );

		// Assert
		$this->assertSame( [ 'page' ], $this->settings->get_llms_post_types() );
	}

	public function test_rest_update__invalidates_llms_cache() {
		// Arrange
		$fired = false;
		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function () use ( &$fired ) {
			$fired = true;
		} );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'post_types' => [ 'page' ] ],
		] );

		// Assert
		$this->assertTrue( $fired );
	}

	public function test_get_generated_llms_txt__uses_selected_post_types() {
		// Arrange
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Kept Page From Settings',
		] );
		$this->factory()->post->create( [
			'post_type'   => 'post',
			'post_status' => 'publish',
			'post_title'  => 'Dropped Post From Settings',
		] );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'post_types' => [ 'page' ] ],
		] );
		$output = $this->module->get_generated_llms_txt();

		// Assert
		$this->assertStringContainsString( 'Kept Page From Settings', $output );
		$this->assertStringNotContainsString( 'Dropped Post From Settings', $output );
	}

	public function test_maybe_serve_llms_txt__does_not_serve_when_disabled() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => false ],
		] );
		$_SERVER['REQUEST_URI'] = '/llms.txt';

		// Act
		ob_start();
		$this->module->maybe_serve_llms_txt();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_maybe_serve_llms_full_txt__does_not_serve_when_disabled() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => false ],
		] );
		$_SERVER['REQUEST_URI'] = '/llms-full.txt';

		// Act
		ob_start();
		$this->module->maybe_serve_llms_full_txt();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	private function put_settings( array $value ): \WP_REST_Response {
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_param( 'value', $value );

		return rest_get_server()->dispatch( $request );
	}
}
