<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agent_Ready_Settings extends Elementor_Test_Base {

	const ROUTE = '/elementor/v1/settings/' . Agent_Ready_Settings::OPTION;

	private Module $module;

	private Agent_Ready_Settings $settings;

	private string $original_request_uri;

	public function setUp(): void {
		parent::setUp();

		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? '/';

		$this->act_as_admin();

		delete_option( Agent_Ready_Settings::OPTION );

		$this->module   = new Module();
		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->settings->activate();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
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
		$this->assertFalse( $this->settings->is_activated() );
		$this->assertFalse( $this->settings->is_llms_enabled() );
		$this->assertFalse( $this->settings->is_markdown_enabled() );
		$this->assertFalse( $this->settings->is_bot_access_enabled() );
		$this->assertFalse( $this->settings->is_agent_discovery_enabled() );
		$this->assertFalse( $this->settings->is_browser_tools_enabled() );
		$this->assertFalse( $this->settings->is_llms_manually_edited() );
		$this->assertArrayNotHasKey( Agent_Ready_Settings::OPTION, wp_load_alloptions() );
	}

	public function test_activate__enables_every_module_and_marks_activated() {
		// Arrange
		delete_option( Agent_Ready_Settings::OPTION );
		$this->settings->ensure_option_exists();

		// Act
		$this->settings->activate();

		// Assert
		$this->assertTrue( $this->settings->is_activated() );
		$this->assertTrue( $this->settings->is_llms_enabled() );
		$this->assertTrue( $this->settings->is_markdown_enabled() );
		$this->assertTrue( $this->settings->is_bot_access_enabled() );
		$this->assertTrue( $this->settings->is_agent_discovery_enabled() );
		$this->assertTrue( $this->settings->is_browser_tools_enabled() );
	}

	public function test_rest_update__stays_activated_after_every_module_is_turned_off() {
		// Arrange
		$this->settings->activate();

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT         => [ 'enabled' => false ],
			Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT => [ 'enabled' => false ],
		] );

		// Assert
		$this->assertTrue( $this->settings->is_activated() );
		$this->assertFalse( $this->settings->is_llms_enabled() );
	}

	public function test_rest_update__ignores_client_activated_flag() {
		// Arrange
		delete_option( Agent_Ready_Settings::OPTION );
		$this->settings->ensure_option_exists();

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::ACTIVATED_KEY   => true,
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => true ],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_activated() );
	}

	public function test_activate__keeps_modules_an_admin_turned_off_when_already_activated() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => false ],
		] );

		// Act
		$this->settings->activate();

		// Assert
		$this->assertTrue( $this->settings->is_activated() );
		$this->assertFalse( $this->settings->is_llms_enabled() );
	}

	public function test_rest_update__first_write_without_an_existing_option_does_not_activate() {
		// Arrange
		delete_option( Agent_Ready_Settings::OPTION );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => true ],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_activated() );
	}

	public function test_set_server_value__first_write_without_an_existing_option_does_not_activate() {
		// Arrange
		delete_option( Agent_Ready_Settings::OPTION );

		// Act
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'is_manually_edited', true );

		// Assert
		$this->assertFalse( $this->settings->is_activated() );
	}

	public function test_is_activated__true_for_a_stored_option_without_the_flag() {
		// Arrange
		update_option( Agent_Ready_Settings::OPTION, [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'enabled' => false ],
		] );

		// Act & Assert
		$this->assertTrue( $this->settings->is_activated() );
		$this->assertFalse( $this->settings->is_llms_enabled() );
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

	public function test_rest_update__keeps_only_available_markdown_post_types() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_LLMS_TXT => [ 'post_types' => [ 'post' ] ],
		] );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT => [ 'post_types' => [ 'page', 'not_a_post_type' ] ],
		] );

		// Assert
		$this->assertSame( [ 'page' ], $this->settings->get_markdown_post_types() );
		$this->assertSame( [ 'post' ], $this->settings->get_llms_post_types() );
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

	public function test_rest_update__keeps_only_catalog_bots_with_boolean_permissions() {
		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL => [
				'enabled' => 'false',
				'bots' => [
					'UnknownBot' => [ 'search' => true, 'ai_input' => true, 'ai_train' => true ],
					'CCBot' => [ 'search' => 'false', 'ai_input' => 1, 'extra' => true ],
				],
			],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_bot_access_enabled() );
		$this->assertSame(
			[ 'CCBot' => [ 'search' => false, 'ai_input' => true, 'ai_train' => false ] ],
			$this->settings->get_managed_bots()
		);
	}

	public function test_is_agent_discovery_enabled__true_after_activation() {
		// Act & Assert
		$this->assertTrue( $this->settings->is_agent_discovery_enabled() );
	}

	public function test_rest_update__sanitizes_agent_discovery_and_keeps_other_modules() {
		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY => [ 'enabled' => 'false', 'extra' => true ],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_agent_discovery_enabled() );
		$this->assertSame(
			[ 'enabled' => false ],
			$this->settings->get_module_settings( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY )
		);
		$this->assertTrue( $this->settings->is_llms_enabled() );
	}

	public function test_is_browser_tools_enabled__true_after_activation() {
		// Act & Assert
		$this->assertTrue( $this->settings->is_browser_tools_enabled() );
	}

	public function test_rest_update__sanitizes_browser_tools_and_keeps_other_modules() {
		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'enabled' => 'false', 'extra' => true ],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_browser_tools_enabled() );
		$this->assertSame(
			[ 'enabled' => false, 'business_details' => '' ],
			$this->settings->get_module_settings( Agent_Ready_Settings::MODULE_BROWSER_TOOLS )
		);
		$this->assertTrue( $this->settings->is_agent_discovery_enabled() );
	}

	public function test_get_business_details__defaults_to_empty() {
		// Act & Assert
		$this->assertSame( '', $this->settings->get_business_details() );
	}

	public function test_rest_update__sanitizes_and_limits_business_details() {
		// Arrange
		$details = "<b>Open</b> daily\n" . str_repeat( 'a', Agent_Ready_Settings::MAX_BUSINESS_DETAILS_LENGTH );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'business_details' => $details ],
		] );

		// Assert
		$saved = $this->settings->get_business_details();

		$this->assertStringStartsWith( "Open daily\n", $saved );
		$this->assertSame( Agent_Ready_Settings::MAX_BUSINESS_DETAILS_LENGTH, mb_strlen( $saved ) );
	}

	public function test_rest_update__keeps_business_details_when_only_the_toggle_is_saved() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'business_details' => 'Open daily' ],
		] );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'enabled' => false ],
		] );

		// Assert
		$this->assertSame( 'Open daily', $this->settings->get_business_details() );
		$this->assertFalse( $this->settings->is_browser_tools_enabled() );
	}

	public function test_rest_update__keeps_the_toggle_when_only_business_details_are_saved() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'enabled' => false ],
		] );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'business_details' => 'Open daily' ],
		] );

		// Assert
		$this->assertFalse( $this->settings->is_browser_tools_enabled() );
		$this->assertSame( 'Open daily', $this->settings->get_business_details() );
	}

	public function test_rest_update__clears_business_details_when_saved_empty() {
		// Arrange
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'business_details' => 'Open daily' ],
		] );

		// Act
		$this->put_settings( [
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS => [ 'business_details' => '   ' ],
		] );

		// Assert
		$this->assertSame( '', $this->settings->get_business_details() );
	}

	public function test_get_managed_bots__defaults_to_popular_bots_in_catalog_order() {
		// Act
		$bots = $this->settings->get_managed_bots();

		// Assert
		$this->assertSame( 'GPTBot', array_key_first( $bots ) );
		$this->assertArrayHasKey( 'ClaudeBot', $bots );
		$this->assertArrayNotHasKey( 'CCBot', $bots );
		$this->assertSame( Agent_Ready_Settings::DEFAULT_BOT_PERMISSIONS, $bots['GPTBot'] );
	}

	private function put_settings( array $value ): \WP_REST_Response {
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_param( 'value', $value );

		return rest_get_server()->dispatch( $request );
	}
}
