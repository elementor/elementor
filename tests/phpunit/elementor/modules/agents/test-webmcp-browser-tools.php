<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Components\Webmcp\Business_Info_Extractor;
use Elementor\Modules\Agents\Components\Webmcp\Business_Schema_Parser;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Abstract_Webmcp_Tool;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Get_Site_Structure;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Query_Business_Info;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Read_Page_Content;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Search_Site_Content;
use Elementor\Modules\Agents\Components\Webmcp\Webmcp_Browser_Tools;
use Elementor\Modules\Agents\Components\Webmcp\Webmcp_Run_Route;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Webmcp_Browser_Tools extends Elementor_Test_Base {

	const THIRD_PARTY_TOOL = 'elementor-webmcp/find-store';

	const CORE_TOOL_COUNT = 4;

	const CRON_DISABLED_FILTER = 'elementor/agents/webmcp/is_cron_disabled';

	private Agent_Ready_Settings $settings;

	private Business_Info_Extractor $extractor;

	private Webmcp_Browser_Tools $browser_tools;

	public function setUp(): void {
		parent::setUp();

		delete_option( Agent_Ready_Settings::OPTION );
		delete_transient( Business_Info_Extractor::TRANSIENT );
		delete_transient( Webmcp_Browser_Tools::RELEVANT_TOOLS_TRANSIENT );
		add_filter( self::CRON_DISABLED_FILTER, '__return_false' );

		wp_get_ability_categories();
		wp_get_abilities();
		$this->unregister_webmcp_abilities();

		remove_all_filters( 'elementor/agents/webmcp/is_applicable' );
		remove_all_filters( 'elementor/agents/webmcp_manifest' );
		remove_all_actions( 'wp_abilities_api_categories_init' );
		remove_all_actions( 'wp_abilities_api_init' );
		add_filter( 'pre_http_request', fn() => [
			'headers' => [],
			'body' => '',
			'response' => [ 'code' => 200, 'message' => 'OK' ],
			'cookies' => [],
		] );

		$sanitizer = new Prompt_Injection_Sanitizer();
		$generator = new Content_Generator( $sanitizer );

		$this->settings  = new Agent_Ready_Settings( $generator );
		$this->extractor = new Business_Info_Extractor( new Business_Schema_Parser( $sanitizer ) );

		$this->settings->ensure_option_exists();
		$this->settings->activate();

		$this->browser_tools = new Webmcp_Browser_Tools( $this->settings, $this->extractor, [
			new Search_Site_Content( $this->settings, new Markdown_Content_Catalog(), $generator, $sanitizer ),
			new Get_Site_Structure( $generator, $sanitizer ),
			new Read_Page_Content( $this->settings, new Markdown_Endpoint( $this->settings ), $sanitizer ),
			new Query_Business_Info( $this->settings, $this->extractor, $sanitizer ),
		] );

		wp_clear_scheduled_hook( Business_Info_Extractor::CRON_HOOK );
	}

	public function tearDown(): void {
		$this->unregister_webmcp_abilities();

		delete_option( Agent_Ready_Settings::OPTION );
		delete_transient( Business_Info_Extractor::TRANSIENT );
		delete_transient( Business_Info_Extractor::FRESH_TRANSIENT );
		wp_clear_scheduled_hook( Business_Info_Extractor::CRON_HOOK );
		delete_transient( Webmcp_Browser_Tools::RELEVANT_TOOLS_TRANSIENT );

		parent::tearDown();
	}

	public function test_get_tools__keeps_only_core_tools() {
		// Arrange
		$this->register_all_abilities();

		// Act
		$names = array_map( fn( $ability ) => $ability->get_name(), $this->browser_tools->get_tools() );

		// Assert
		$this->assertCount( self::CORE_TOOL_COUNT, $names );
		$this->assertContains( 'elementor-webmcp/search-site-content', $names );
		$this->assertNotContains( self::THIRD_PARTY_TOOL, $names );
	}

	public function test_to_tool_name__strips_core_prefix() {
		// Act & Assert
		$this->assertSame( 'search_site_content', Webmcp_Browser_Tools::to_tool_name( 'elementor-webmcp/search-site-content' ) );
	}

	public function test_get_relevant_tools__applies_the_relevance_filter() {
		// Arrange
		$this->register_all_abilities();
		add_filter( 'elementor/agents/webmcp/is_tool_relevant', fn( $relevant, $name ) => 'elementor-webmcp/get-site-structure' === $name ? false : $relevant, 10, 2 );

		// Act
		$tools = $this->browser_tools->get_relevant_tools();

		// Assert
		$this->assertArrayNotHasKey( 'get_site_structure', $tools );
		$this->assertArrayHasKey( 'read_page_content', $tools );
	}

	public function test_get_relevant_tools__keeps_business_info_without_contact_data() {
		// Arrange
		$this->register_all_abilities();
		set_transient( Business_Info_Extractor::TRANSIENT, [] );

		// Act
		$tools = $this->browser_tools->get_relevant_tools();

		// Assert
		$this->assertArrayHasKey( 'query_business_info', $tools );
	}

	public function test_get_admin_tools__lists_every_core_tool_even_when_irrelevant() {
		// Arrange
		$this->register_all_abilities();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );

		// Act
		$tools = array_column( $this->browser_tools->get_admin_tools(), null, 'name' );

		// Assert
		$this->assertCount( self::CORE_TOOL_COUNT, $tools );
		$this->assertArrayHasKey( 'read_page_content', $tools );
	}

	public function test_get_cached_tool_descriptors__is_refreshed_after_flush() {
		// Arrange
		$this->register_all_abilities();
		$this->browser_tools->get_cached_tool_descriptors();
		add_filter( 'elementor/agents/webmcp/is_tool_relevant', fn( $relevant, $name ) => 'elementor-webmcp/get-site-structure' === $name ? false : $relevant, 10, 2 );

		// Act
		$stale = array_column( $this->browser_tools->get_cached_tool_descriptors(), 'name' );
		$this->browser_tools->flush_relevant_tools_cache();
		$fresh = array_column( $this->browser_tools->get_cached_tool_descriptors(), 'name' );

		// Assert
		$this->assertContains( 'get_site_structure', $stale );
		$this->assertNotContains( 'get_site_structure', $fresh );
	}

	public function test_register__exposes_manifest_tools_only_when_enabled() {
		// Arrange
		$this->register_all_abilities();
		$this->browser_tools->register();

		// Act
		$manifest = apply_filters( 'elementor/agents/webmcp_manifest', [ 'tools' => [] ], home_url() );

		// Assert
		$names = array_column( $manifest['tools'], 'name' );
		$this->assertContains( 'get_site_structure', $names );
		$this->assertContains( 'query_business_info', $names );
		$this->assertTrue( apply_filters( 'elementor/agents/webmcp/is_applicable', false ) );
	}

	public function test_register__skips_manifest_and_route_when_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_BROWSER_TOOLS, 'enabled', false );

		// Act
		$this->browser_tools->register();

		// Assert
		$this->assertFalse( apply_filters( 'elementor/agents/webmcp/is_applicable', false ) );
		$this->assertSame( [ 'tools' => [] ], apply_filters( 'elementor/agents/webmcp_manifest', [ 'tools' => [] ], home_url() ) );
	}

	public function test_run_route__returns_tool_result() {
		// Arrange
		$this->register_route();

		// Act
		$response = $this->run_tool( 'get_site_structure', [] );

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'site', $response->get_data() );
	}

	public function test_run_route__returns_404_for_unknown_tools() {
		// Arrange
		$this->register_route();

		// Act
		$response = $this->run_tool( 'does_not_exist', [] );

		// Assert
		$this->assertSame( Webmcp_Run_Route::STATUS_NOT_FOUND, $response->get_status() );
	}

	public function test_run_route__returns_404_for_third_party_and_irrelevant_tools() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );
		$this->register_route();

		// Act
		$third_party = $this->run_tool( Webmcp_Browser_Tools::to_tool_name( self::THIRD_PARTY_TOOL ), [] );
		$irrelevant  = $this->run_tool( 'read_page_content', [ 'id' => 1 ] );

		// Assert
		$this->assertSame( Webmcp_Run_Route::STATUS_NOT_FOUND, $third_party->get_status() );
		$this->assertSame( Webmcp_Run_Route::STATUS_NOT_FOUND, $irrelevant->get_status() );
	}

	public function test_run_route__returns_400_for_invalid_input() {
		// Arrange
		$this->factory()->post->create( [ 'post_status' => 'publish' ] );
		$this->register_route();

		// Act
		$response = $this->run_tool( 'search_site_content', [] );

		// Assert
		$this->assertSame( Webmcp_Run_Route::STATUS_BAD_REQUEST, $response->get_status() );
	}

	public function test_run_route__returns_503_while_business_info_was_never_fetched() {
		// Arrange
		$this->register_route();

		// Act
		$response = $this->run_tool( 'query_business_info', [] );

		// Assert
		$this->assertSame( Webmcp_Run_Route::STATUS_SERVICE_UNAVAILABLE, $response->get_status() );
	}

	public function test_run_route__accepts_null_input() {
		// Arrange
		$this->register_route();

		// Act
		$response = $this->run_tool( 'get_site_structure', null );

		// Assert
		$this->assertSame( 200, $response->get_status() );
	}

	public function test_run_route__returns_400_for_non_object_input() {
		// Arrange
		$this->register_route();

		// Act
		$response = $this->run_tool( 'get_site_structure', 'not-an-object' );

		// Assert
		$this->assertSame( Webmcp_Run_Route::STATUS_BAD_REQUEST, $response->get_status() );
	}

	public function test_warm_business_info__schedules_an_immediate_refresh_for_admins_on_cold_cache() {
		// Arrange
		$this->act_as_admin();

		// Act
		$this->browser_tools->warm_business_info();

		// Assert
		$scheduled = wp_next_scheduled( Business_Info_Extractor::CRON_HOOK );
		$this->assertNotFalse( $scheduled );
		$this->assertLessThanOrEqual( time(), $scheduled );
	}

	public function test_warm_business_info__skips_fresh_data_and_non_admins() {
		// Arrange
		$this->act_as_editor();

		// Act
		$this->browser_tools->warm_business_info();
		$skipped_for_editor = wp_next_scheduled( Business_Info_Extractor::CRON_HOOK );
		$this->act_as_admin();
		set_transient( Business_Info_Extractor::FRESH_TRANSIENT, true );
		$this->browser_tools->warm_business_info();

		// Assert
		$this->assertFalse( $skipped_for_editor );
		$this->assertFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	public function test_register__warms_business_info_when_settings_are_saved() {
		// Arrange
		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );
		remove_all_actions( 'update_option_' . Agent_Ready_Settings::OPTION );
		$this->browser_tools->register();

		// Act
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		// Assert
		$this->assertNotFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	public function test_register__warms_business_info_when_the_settings_option_is_first_created() {
		// Arrange
		delete_option( Agent_Ready_Settings::OPTION );
		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );
		remove_all_actions( 'add_option_' . Agent_Ready_Settings::OPTION );
		remove_all_actions( 'update_option_' . Agent_Ready_Settings::OPTION );
		$this->browser_tools->register();

		// Act
		$this->settings->ensure_option_exists();
		$this->settings->activate();

		// Assert
		$this->assertNotFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	public function test_register__clears_business_info_when_browser_tools_are_turned_off() {
		// Arrange
		remove_all_actions( 'update_option_' . Agent_Ready_Settings::OPTION );
		$this->browser_tools->register();
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'telephone' => '+1 555 0100' ] );
		set_transient( Business_Info_Extractor::FRESH_TRANSIENT, true );
		set_transient( Webmcp_Browser_Tools::RELEVANT_TOOLS_TRANSIENT, [ 'query_business_info' ] );
		wp_schedule_single_event( time(), Business_Info_Extractor::CRON_HOOK );

		// Act
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_BROWSER_TOOLS, 'enabled', false );

		// Assert
		$this->assertFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
		$this->assertFalse( get_transient( Business_Info_Extractor::TRANSIENT ) );
		$this->assertFalse( get_transient( Business_Info_Extractor::FRESH_TRANSIENT ) );
		$this->assertFalse( get_transient( Webmcp_Browser_Tools::RELEVANT_TOOLS_TRANSIENT ) );
	}

	public function test_warm__fills_an_empty_cache_without_scheduling_when_cron_is_disabled() {
		// Arrange
		add_filter( self::CRON_DISABLED_FILTER, '__return_true' );

		// Act
		$this->extractor->warm();

		// Assert
		$this->assertSame( [], $this->extractor->get_or_refresh() );
		$this->assertFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	private function unregister_webmcp_abilities(): void {
		foreach ( wp_get_abilities() as $ability ) {
			if ( 0 === strpos( $ability->get_name(), Abstract_Webmcp_Tool::CATEGORY . '/' ) ) {
				wp_unregister_ability( $ability->get_name() );
			}
		}

		if ( wp_has_ability_category( Abstract_Webmcp_Tool::CATEGORY ) ) {
			wp_unregister_ability_category( Abstract_Webmcp_Tool::CATEGORY );
		}
	}

	private function register_route(): void {
		$this->register_all_abilities();
		$this->browser_tools->register();

		do_action( 'rest_api_init' );
	}

	private function run_tool( string $tool, $input ): \WP_REST_Response {
		$request = new \WP_REST_Request( 'POST', '/' . Webmcp_Run_Route::ROUTE );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( [ 'tool' => $tool, 'input' => $input ] ) );

		return rest_get_server()->dispatch( $request );
	}

	private function register_all_abilities(): void {
		add_action( 'wp_abilities_api_categories_init', [ $this->browser_tools, 'register_category' ] );

		add_action( 'wp_abilities_api_init', function () {
			$this->browser_tools->register_core_abilities();

			wp_register_ability( self::THIRD_PARTY_TOOL, [
				'label' => self::THIRD_PARTY_TOOL,
				'description' => 'Test ability',
				'category' => Abstract_Webmcp_Tool::CATEGORY,
				'execute_callback' => fn() => [ 'ok' => true ],
				'permission_callback' => '__return_true',
				'meta' => [
					'webmcp' => true,
					'annotations' => [ 'readonly' => true ],
				],
			] );
		} );

		do_action( 'wp_abilities_api_categories_init' );
		do_action( 'wp_abilities_api_init' );
	}
}
