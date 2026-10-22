<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
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
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Webmcp_Core_Tools extends Elementor_Test_Base {

	private Agent_Ready_Settings $settings;

	private Content_Generator $generator;

	private Prompt_Injection_Sanitizer $sanitizer;

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		delete_option( Agent_Ready_Settings::OPTION );

		$this->sanitizer = new Prompt_Injection_Sanitizer();
		$this->generator = new Content_Generator( $this->sanitizer );
		$this->settings  = new Agent_Ready_Settings( $this->generator );
		$this->settings->ensure_option_exists();

		wp_clear_scheduled_hook( Business_Info_Extractor::CRON_HOOK );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		delete_option( Agent_Ready_Settings::OPTION );
		delete_transient( Business_Info_Extractor::TRANSIENT );
		delete_transient( Business_Info_Extractor::FRESH_TRANSIENT );
		wp_clear_scheduled_hook( Business_Info_Extractor::CRON_HOOK );
		remove_theme_mod( 'nav_menu_locations' );

		parent::tearDown();
	}

	public function test_get_ability_name__uses_the_webmcp_category() {
		// Act & Assert
		$this->assertSame( 'elementor-webmcp/search-site-content', $this->create_search_tool()->get_ability_name() );
	}

	public function test_search_site_content__returns_no_results_when_query_sanitizes_to_empty() {
		// Arrange
		$this->factory()->post->create( [ 'post_status' => 'publish', 'post_title' => 'Any post' ] );

		// Act
		$result = $this->create_search_tool()->execute( [ 'query' => '<>' ] );

		// Assert
		$this->assertSame( [ 'results' => [] ], $result );
	}

	public function test_search_site_content__returns_structured_public_results_only() {
		// Arrange
		$published = $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title' => 'Blue running shoes',
			'post_excerpt' => '',
			'post_content' => 'Lightweight shoes for every trail.',
		] );
		$this->factory()->post->create( [ 'post_status' => 'draft', 'post_title' => 'Secret shoes draft' ] );
		$this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title' => 'Protected shoes',
			'post_password' => 'secret',
		] );

		// Act
		$result = $this->create_search_tool()->execute( [ 'query' => 'shoes' ] );

		// Assert
		$this->assertCount( 1, $result['results'] );
		$this->assertSame( $published, $result['results'][0]['id'] );
		$this->assertSame( get_permalink( $published ), $result['results'][0]['url'] );
		$this->assertStringContainsString( 'Lightweight shoes', $result['results'][0]['excerpt'] );
		$this->assertArrayHasKey( 'date', $result['results'][0] );
	}

	public function test_search_site_content__respects_the_limit_and_post_type() {
		// Arrange
		$this->factory()->post->create_many( 3, [ 'post_status' => 'publish', 'post_title' => 'Gadget post' ] );
		$this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Gadget page' ] );

		// Act
		$limited = $this->create_search_tool()->execute( [ 'query' => 'gadget', 'limit' => 2 ] );
		$pages   = $this->create_search_tool()->execute( [ 'query' => 'gadget', 'post_type' => 'page' ] );

		// Assert
		$this->assertCount( 2, $limited['results'] );
		$this->assertCount( 1, $pages['results'] );
		$this->assertSame( 'page', $pages['results'][0]['type'] );
	}

	public function test_search_site_content__is_relevant_only_when_published_content_exists() {
		// Arrange
		$tool = $this->create_search_tool();
		$this->delete_all_content();

		// Act
		$without_content = $tool->is_relevant();
		$this->factory()->post->create( [ 'post_status' => 'publish' ] );
		$with_content = $tool->is_relevant();

		// Assert
		$this->assertFalse( $without_content );
		$this->assertTrue( $with_content );
	}

	public function test_read_page_content__returns_markdown_for_public_pages() {
		// Arrange
		$page_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_title' => 'About us',
			'post_content' => '<p>We bake fresh bread every single morning.</p>',
		] );

		// Act
		$result = $this->create_read_tool()->execute( [ 'id' => $page_id ] );

		// Assert
		$this->assertSame( 'markdown', $result['format'] );
		$this->assertStringContainsString( 'We bake fresh bread every single morning.', $result['content'] );
	}

	public function test_read_page_content__renders_in_the_requested_post_context_and_restores_the_previous_one() {
		// Arrange
		$shortcode = 'elementor_test_current_post_id';
		add_shortcode( $shortcode, fn() => 'This content belongs to post ' . get_the_ID() );

		$requested_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_content' => '[' . $shortcode . ']',
		] );
		$previous_post = get_post( $this->factory()->post->create( [ 'post_status' => 'publish' ] ) );
		$GLOBALS['post'] = $previous_post;

		// Act
		$result = $this->create_read_tool()->execute( [ 'id' => $requested_id ] );
		$restored_post = $GLOBALS['post'];
		remove_shortcode( $shortcode );
		unset( $GLOBALS['post'] );

		// Assert
		$this->assertStringContainsString( 'This content belongs to post ' . $requested_id, $result['content'] );
		$this->assertSame( $previous_post->ID, $restored_post->ID );
	}

	public function test_read_page_content__rejects_drafts_and_unknown_ids() {
		// Arrange
		$draft_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
		$tool     = $this->create_read_tool();

		// Act
		$draft   = $tool->execute( [ 'id' => $draft_id ] );
		$unknown = $tool->execute( [ 'id' => PHP_INT_MAX ] );

		// Assert
		$this->assertWPError( $draft );
		$this->assertSame( Abstract_Webmcp_Tool::ERROR_NOT_FOUND, $draft->get_error_code() );
		$this->assertWPError( $unknown );
	}

	public function test_read_page_content__is_relevant_only_when_markdown_is_enabled() {
		// Arrange
		$tool = $this->create_read_tool();

		// Act
		$enabled = $tool->is_relevant();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );
		$disabled = $tool->is_relevant();

		// Assert
		$this->assertTrue( $enabled );
		$this->assertFalse( $disabled );
	}

	public function test_get_site_structure__lists_public_menu_items_and_content_types() {
		// Arrange
		$public_page = $this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Services' ] );
		$draft_page  = $this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'draft', 'post_title' => 'Upcoming' ] );
		$menu_id     = $this->create_assigned_menu( 'Primary' );

		foreach ( [ $public_page, $draft_page ] as $page_id ) {
			wp_update_nav_menu_item( $menu_id, 0, [
				'menu-item-object-id' => $page_id,
				'menu-item-object' => 'page',
				'menu-item-type' => 'post_type',
				'menu-item-status' => 'publish',
			] );
		}

		// Act
		$structure = ( new Get_Site_Structure( $this->generator, $this->sanitizer ) )->execute( [] );

		// Assert
		$menu = $structure['navigation'][0];
		$this->assertSame( 'Primary', $menu['name'] );
		$this->assertSame( [ 'Services' ], array_column( $menu['items'], 'title' ) );
		$this->assertSame( home_url( '/' ), $structure['key_pages']['home']['url'] );
		$this->assertContains( 'page', array_column( $structure['content_types'], 'name' ) );
	}

	public function test_get_site_structure__falls_back_to_top_level_pages_without_menus() {
		// Arrange
		$this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Contact' ] );

		// Act
		$structure = ( new Get_Site_Structure( $this->generator, $this->sanitizer ) )->execute( [] );

		// Assert
		$this->assertContains( 'Contact', array_column( $structure['navigation'][0]['items'], 'title' ) );
	}

	public function test_get_site_structure__drops_menu_items_with_unsafe_urls() {
		// Arrange
		$menu_id = $this->create_assigned_menu( 'Footer' );

		foreach ( [ 'Docs' => 'https://example.com/docs', 'Script' => 'javascript:alert(1)' ] as $title => $url ) {
			wp_update_nav_menu_item( $menu_id, 0, [
				'menu-item-title' => $title,
				'menu-item-url' => $url,
				'menu-item-type' => 'custom',
				'menu-item-status' => 'publish',
			] );
		}

		// Act
		$structure = ( new Get_Site_Structure( $this->generator, $this->sanitizer ) )->execute( [] );

		// Assert
		$this->assertSame( [ 'Docs' ], array_column( $structure['navigation'][0]['items'], 'title' ) );
	}

	public function test_get_site_structure__ignores_menus_without_a_theme_location() {
		// Arrange
		$this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About' ] );
		$menu_id = wp_create_nav_menu( 'Unused draft menu' );
		wp_update_nav_menu_item( $menu_id, 0, [
			'menu-item-title' => 'Hidden',
			'menu-item-url' => 'https://example.com/hidden',
			'menu-item-type' => 'custom',
			'menu-item-status' => 'publish',
		] );

		// Act
		$navigation = ( new Get_Site_Structure( $this->generator, $this->sanitizer ) )->execute( [] )['navigation'];

		// Assert
		$this->assertSame( '', $navigation[0]['name'] );
		$this->assertNotContains( 'Hidden', array_column( $navigation[0]['items'], 'title' ) );
	}

	public function test_get_site_structure__skips_noindex_pages() {
		// Arrange
		$noindex_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_title' => 'Contact',
			'post_name' => 'contact',
		] );
		update_post_meta( $noindex_id, '_yoast_wpseo_meta-robots-noindex', '1' );

		// Act
		$structure = ( new Get_Site_Structure( $this->generator, $this->sanitizer ) )->execute( [] );

		// Assert
		$this->assertArrayNotHasKey( 'contact', $structure['key_pages'] );
		$this->assertNotContains( 'Contact', array_column( $structure['navigation'][0]['items'], 'title' ) );
	}

	public function test_get_site_structure__adds_public_terms_and_contact_pages() {
		// Arrange
		$terms_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_title' => 'Terms of Service',
			'post_name' => 'terms-of-service',
		] );
		$this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_title' => 'Contact us',
			'post_name' => 'contact',
			'post_password' => 'secret',
		] );

		// Act
		$key_pages = ( new Get_Site_Structure( $this->generator, $this->sanitizer ) )->execute( [] )['key_pages'];

		// Assert
		$this->assertSame( [ 'title' => 'Terms of Service', 'url' => get_permalink( $terms_id ) ], $key_pages['terms'] );
		$this->assertArrayNotHasKey( 'contact', $key_pages );
	}

	public function test_query_business_info__flags_missing_structured_data() {
		// Arrange
		$tool = $this->create_business_info_tool();
		set_transient( Business_Info_Extractor::TRANSIENT, [] );

		// Act
		$without_data = $tool->execute();
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'telephone' => '+1 555 0100' ] );
		$with_data = $tool->execute();

		// Assert
		$this->assertTrue( $tool->is_relevant() );
		$this->assertFalse( $without_data['has_structured_data'] );
		$this->assertSame( home_url( '/' ), $without_data['url'] );
		$this->assertArrayNotHasKey( 'telephone', $without_data );
		$this->assertTrue( $with_data['has_structured_data'] );
		$this->assertSame( '+1 555 0100', $with_data['telephone'] );
	}

	public function test_query_business_info__counts_social_profiles_as_structured_data() {
		// Arrange
		$tool = $this->create_business_info_tool();
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'social_profiles' => [ 'https://facebook.com/bakery' ] ] );

		// Act
		$result = $tool->execute();

		// Assert
		$this->assertTrue( $result['has_structured_data'] );
		$this->assertSame( [ 'https://facebook.com/bakery' ], $result['social_profiles'] );
	}

	public function test_query_business_info__schedules_a_refresh_without_fetching_on_cold_cache() {
		// Arrange
		$requests = $this->stub_home_page( '' );

		// Act
		$result = $this->create_business_info_tool()->execute();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Abstract_Webmcp_Tool::ERROR_UNAVAILABLE, $result->get_error_code() );
		$this->assertSame( 0, $requests->count );
		$this->assertNotFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	public function test_query_business_info__serves_stale_data_while_scheduling_a_refresh() {
		// Arrange
		$requests = $this->stub_home_page( '' );
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'telephone' => '+1 555 0100' ] );

		// Act
		$result = $this->create_business_info_tool()->execute();

		// Assert
		$this->assertSame( '+1 555 0100', $result['telephone'] );
		$this->assertSame( 0, $requests->count );
		$this->assertNotFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	public function test_query_business_info__does_not_schedule_a_refresh_while_fresh() {
		// Arrange
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'telephone' => '+1 555 0100' ] );
		set_transient( Business_Info_Extractor::FRESH_TRANSIENT, true );

		// Act
		$this->create_business_info_tool()->execute();

		// Assert
		$this->assertFalse( wp_next_scheduled( Business_Info_Extractor::CRON_HOOK ) );
	}

	public function test_business_info_refresh__fetches_once_and_marks_the_data_fresh() {
		// Arrange
		$requests  = $this->stub_home_page( '<script type="application/ld+json">{"@type":"LocalBusiness","telephone":"+1 555 0100"}</script>' );
		$extractor = new Business_Info_Extractor( new Business_Schema_Parser( $this->sanitizer ) );

		// Act
		$extractor->refresh();
		$cached = $extractor->get_or_refresh();

		// Assert
		$this->assertSame( '+1 555 0100', $cached['telephone'] );
		$this->assertSame( 1, $requests->count );
		$this->assertTrue( get_transient( Business_Info_Extractor::FRESH_TRANSIENT ) );
	}

	public function test_business_info_refresh__keeps_stale_data_when_the_fetch_fails() {
		// Arrange
		$this->stub_home_page_failure();
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'telephone' => '+1 555 0100' ] );
		$extractor = new Business_Info_Extractor( new Business_Schema_Parser( $this->sanitizer ) );

		// Act
		$extractor->refresh();

		// Assert
		$this->assertSame( [ 'telephone' => '+1 555 0100' ], get_transient( Business_Info_Extractor::TRANSIENT ) );
		$this->assertTrue( get_transient( Business_Info_Extractor::FRESH_TRANSIENT ) );
	}

	public function test_business_info_refresh__stays_unavailable_when_the_first_fetch_fails() {
		// Arrange
		$this->stub_home_page_failure();
		$extractor = new Business_Info_Extractor( new Business_Schema_Parser( $this->sanitizer ) );

		// Act
		$extractor->refresh();

		// Assert
		$this->assertFalse( get_transient( Business_Info_Extractor::TRANSIENT ) );
		$this->assertNull( $extractor->get_or_refresh() );
	}

	public function test_business_info_refresh__replaces_stale_data_with_an_empty_result_for_a_page_without_schema() {
		// Arrange
		$this->stub_home_page( '<html></html>' );
		set_transient( Business_Info_Extractor::TRANSIENT, [ 'telephone' => '+1 555 0100' ] );
		$extractor = new Business_Info_Extractor( new Business_Schema_Parser( $this->sanitizer ) );

		// Act
		$extractor->refresh();

		// Assert
		$this->assertSame( [], get_transient( Business_Info_Extractor::TRANSIENT ) );
	}

	private function stub_home_page_failure(): void {
		add_filter( 'pre_http_request', fn() => new \WP_Error( 'http_request_failed', 'Timed out' ) );
	}

	private function stub_home_page( string $body ): \stdClass {
		$requests        = new \stdClass();
		$requests->count = 0;

		add_filter( 'pre_http_request', function () use ( $requests, $body ) {
			$requests->count++;

			return [
				'headers' => [],
				'body' => $body,
				'response' => [ 'code' => 200, 'message' => 'OK' ],
				'cookies' => [],
			];
		} );

		return $requests;
	}

	private function create_assigned_menu( string $name ): int {
		$menu_id = wp_create_nav_menu( $name );

		set_theme_mod( 'nav_menu_locations', array_merge( (array) get_nav_menu_locations(), [ sanitize_key( $name ) => $menu_id ] ) );

		return $menu_id;
	}

	private function create_business_info_tool(): Query_Business_Info {
		return new Query_Business_Info( new Business_Info_Extractor( new Business_Schema_Parser( $this->sanitizer ) ), $this->sanitizer );
	}

	private function create_search_tool(): Search_Site_Content {
		return new Search_Site_Content( $this->settings, new Markdown_Content_Catalog(), $this->generator, $this->sanitizer );
	}

	private function create_read_tool(): Read_Page_Content {
		return new Read_Page_Content( $this->settings, new Markdown_Endpoint( $this->settings ) );
	}

	private function delete_all_content(): void {
		$posts = get_posts( [ 'post_type' => 'any', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids' ] );

		foreach ( $posts as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}
}
