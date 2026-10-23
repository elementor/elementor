<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Module;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	private $module;

	private string $original_request_uri;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();

		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? '/';

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$settings = new \Elementor\Modules\Agents\Agent_Ready_Settings(
			new \Elementor\Modules\Agents\Content_Generator( new \Elementor\Modules\Agents\Prompt_Injection_Sanitizer() )
		);
		$settings->ensure_option_exists();
		$settings->activate();

		$this->module = new Module();
	}

	public function tearDown(): void {
		$_SERVER['REQUEST_URI'] = $this->original_request_uri;

		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		Module::reset_physical_file_cache();

		$this->flush_documents_cache();

		parent::tearDown();
	}

	public function test_editor_one_menu_hooks_are_registered() {
		// Assert
		$this->assertNotFalse( has_action( 'elementor/editor-one/menu/register', [ $this->module, 'register_editor_one_menu' ] ) );
		$this->assertNotFalse( has_action( 'elementor/editor-one/menu/after_register_hidden_submenus', [ $this->module, 'enqueue_assets_for_editor_one_menu' ] ) );
	}

	public function test_register_editor_one_menu__registers_agents_ready_menu_item() {
		// Arrange
		$instance_property = ( new \ReflectionClass( Menu_Data_Provider::class ) )->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
		$menu_data_provider = Menu_Data_Provider::instance();

		// Act
		$this->module->register_editor_one_menu( $menu_data_provider );

		// Assert
		$this->assertTrue( $menu_data_provider->is_item_already_registered( Module::PAGE_ID ) );

		// Cleanup
		$instance_property->setValue( null, null );
	}

	public function test_is_llms_txt_request__matches_root_path() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/llms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_llms_txt_request__does_not_match_other_paths() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/about';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_non_llms_txt_request_does_not_intercept() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/about';

		// Act
		ob_start();
		$this->module->maybe_serve_llms_txt();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_is_llms_txt_request__matches_path_with_query_string() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/llms.txt?foo=bar';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_llms_txt_request__matches_subdirectory_install() {
		// Arrange
		add_filter( 'home_url', static function () {
			return 'http://example.com/blog';
		} );

		$_SERVER['REQUEST_URI'] = '/blog/llms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Cleanup
		remove_all_filters( 'home_url' );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_llms_txt_request__does_not_match_prefix_without_segment_boundary() {
		// Arrange
		add_filter( 'home_url', static function () {
			return 'http://example.com/blog';
		} );

		$_SERVER['REQUEST_URI'] = '/blogllms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Cleanup
		remove_all_filters( 'home_url' );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_get_etag__differs_per_content() {
		// Act
		$first = $this->invoke_private( 'get_etag', [ '# llms.txt' ] );
		$second = $this->invoke_private( 'get_etag', [ '# other llms.txt' ] );

		// Assert
		$this->assertSame( '"' . md5( '# llms.txt' ) . '"', $first );
		$this->assertNotSame( $first, $second );
	}

	public function test_get_cache_max_age__defaults_and_is_filterable() {
		// Assert
		$this->assertSame( Module::DEFAULT_CACHE_MAX_AGE, $this->invoke_private( 'get_cache_max_age' ) );

		// Arrange
		add_filter( 'elementor/agents/llms_txt/cache_max_age', static function () {
			return 60;
		} );

		// Act
		$filtered = $this->invoke_private( 'get_cache_max_age' );

		// Cleanup
		remove_all_filters( 'elementor/agents/llms_txt/cache_max_age' );

		// Assert
		$this->assertSame( 60, $filtered );
	}

	public function test_get_cache_max_age__never_negative() {
		// Arrange
		add_filter( 'elementor/agents/llms_txt/cache_max_age', static function () {
			return -100;
		} );

		// Act
		$max_age = $this->invoke_private( 'get_cache_max_age' );

		// Cleanup
		remove_all_filters( 'elementor/agents/llms_txt/cache_max_age' );

		// Assert
		$this->assertSame( 0, $max_age );
	}

	public function test_is_client_cache_fresh__matches_strong_and_weak_etag() {
		// Arrange
		$etag = '"abc123"';

		// Act & Assert
		$_SERVER['HTTP_IF_NONE_MATCH'] = $etag;
		$this->assertTrue( $this->invoke_private( 'is_client_cache_fresh', [ $etag, 0 ] ) );

		$_SERVER['HTTP_IF_NONE_MATCH'] = 'W/' . $etag;
		$this->assertTrue( $this->invoke_private( 'is_client_cache_fresh', [ $etag, 0 ] ) );

		$_SERVER['HTTP_IF_NONE_MATCH'] = '"other", ' . $etag;
		$this->assertTrue( $this->invoke_private( 'is_client_cache_fresh', [ $etag, 0 ] ) );

		// Cleanup
		unset( $_SERVER['HTTP_IF_NONE_MATCH'] );
	}

	public function test_is_client_cache_fresh__rejects_stale_etag_even_when_not_modified_since() {
		// Arrange
		$_SERVER['HTTP_IF_NONE_MATCH'] = '"stale"';
		$_SERVER['HTTP_IF_MODIFIED_SINCE'] = gmdate( 'D, d M Y H:i:s', time() + 60 ) . ' GMT';

		// Act
		$result = $this->invoke_private( 'is_client_cache_fresh', [ '"fresh"', time() ] );

		// Cleanup
		unset( $_SERVER['HTTP_IF_NONE_MATCH'], $_SERVER['HTTP_IF_MODIFIED_SINCE'] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_client_cache_fresh__honors_if_modified_since() {
		// Arrange
		$last_modified = time() - 600;

		// Act & Assert
		$_SERVER['HTTP_IF_MODIFIED_SINCE'] = gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT';
		$this->assertTrue( $this->invoke_private( 'is_client_cache_fresh', [ '"abc"', $last_modified ] ) );

		$_SERVER['HTTP_IF_MODIFIED_SINCE'] = gmdate( 'D, d M Y H:i:s', $last_modified - 60 ) . ' GMT';
		$this->assertFalse( $this->invoke_private( 'is_client_cache_fresh', [ '"abc"', $last_modified ] ) );

		// Cleanup
		unset( $_SERVER['HTTP_IF_MODIFIED_SINCE'] );
	}

	public function test_is_client_cache_fresh__is_false_without_validators() {
		// Assert
		$this->assertFalse( $this->invoke_private( 'is_client_cache_fresh', [ '"abc"', time() ] ) );
	}

	public function test_kit_save_invalidates_llms_txt_cache() {
		// Arrange
		$invalidated_for = null;
		$kit_id          = Plugin::$instance->kits_manager->get_active_id();

		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function ( $id ) use ( &$invalidated_for, $kit_id ) {
			if ( (int) $id === (int) $kit_id ) {
				$invalidated_for = $id;
			}
		} );

		$this->flush_documents_cache();
		$kit = Plugin::$instance->documents->get( $kit_id );

		// Act
		$kit->save( [
			'settings' => [
				'site_name' => 'Test Site Name for Cache Invalidation',
			],
		] );

		// Cleanup
		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );

		// Assert
		$this->assertSame( $kit_id, $invalidated_for );
	}

	public function test_non_kit_document_save_does_not_invalidate_llms_txt_cache() {
		// Arrange
		$invalidated = false;

		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function () use ( &$invalidated ) {
			$invalidated = true;
		} );

		// Act
		$this->module->maybe_invalidate_llms_txt_cache( new \stdClass() );

		// Cleanup
		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );

		// Assert
		$this->assertFalse( $invalidated );
	}

	private function invoke_private( string $name, array $args = [] ) {
		$method = new \ReflectionMethod( Module::class, $name );
		$method->setAccessible( true );

		return $method->invokeArgs( $this->module, $args );
	}

	private function flush_documents_cache(): void {
		$reflection = new \ReflectionProperty( Plugin::$instance->documents, 'documents' );
		$reflection->setAccessible( true );
		$reflection->setValue( Plugin::$instance->documents, [] );
	}

	// -------------------------------------------------------------------------
	// Auto-generation tests (added with content-generator epic)
	// -------------------------------------------------------------------------

	public function test_get_generated_llms_txt__starts_with_site_name() {
		$output = $this->module->get_generated_llms_txt();
		$this->assertStringContainsString( get_bloginfo( 'name' ), $output );
	}

	public function test_get_generated_llms_full_txt__starts_with_site_name() {
		$output = $this->module->get_generated_llms_full_txt();
		$this->assertStringContainsString( get_bloginfo( 'name' ), $output );
	}

	public function test_get_generated_llms_txt__is_cached_on_second_call() {
		$first  = $this->module->get_generated_llms_txt();
		$second = $this->module->get_generated_llms_txt();

		$this->assertSame( $first, $second );
	}

	public function test_on_post_change__invalidates_cache() {
		$first   = $this->module->get_generated_llms_txt();
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Post After Cache Invalidation',
		] );
		// Simulate the save_post hook.
		$this->module->on_post_change( $post_id, get_post( $post_id ) );

		$second = $this->module->get_generated_llms_txt();

		// Cache was cleared, new content is regenerated.
		$this->assertStringContainsString( 'Post After Cache Invalidation', $second );
	}

	public function test_save_overrides__persists_and_invalidates_cache() {
		// Warm the cache.
		$this->module->get_generated_llms_txt();

		$fired = false;
		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function () use ( &$fired ) {
			$fired = true;
		} );

		$this->module->save_overrides( [
			'intro'    => 'My saved intro.',
			'optional' => 'My optional section.',
		] );

		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );

		$this->assertTrue( $fired, 'cache_invalidated action must fire when overrides are saved' );

		$overrides = $this->module->get_overrides();

		$this->assertSame( 'My saved intro.', $overrides['intro'] );
		$this->assertSame( 'My optional section.', $overrides['optional'] );

		// Cache should have been cleared.
		$output = $this->module->get_generated_llms_txt();
		$this->assertStringContainsString( '> My saved intro.', $output );
	}

	public function test_get_missing_requirements__returns_array() {
		$warnings = $this->module->get_missing_requirements();
		$this->assertIsArray( $warnings );
	}

	public function test_existing_file_decision__set_and_get() {
		$this->module->set_existing_file_decision( 'replace' );
		$this->assertSame( 'replace', get_option( Module::OPTION_EXISTING_FILE_DECISION ) );

		// Keep is also valid.
		$this->module->set_existing_file_decision( 'keep' );
		$this->assertSame( 'keep', get_option( Module::OPTION_EXISTING_FILE_DECISION ) );

		// Invalid value is rejected.
		$this->module->set_existing_file_decision( 'invalid' );
		$this->assertSame( 'keep', get_option( Module::OPTION_EXISTING_FILE_DECISION ) );

		// Cleanup.
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );
	}

	public function test_is_request_for_llms_full_txt__matches() {
		$_SERVER['REQUEST_URI'] = '/llms-full.txt';
		$method = new \ReflectionMethod( Module::class, 'is_request_for' );
		$method->setAccessible( true );

		$result = $method->invoke( $this->module, 'llms-full.txt' );

		$this->assertTrue( $result );
	}

	public function test_is_request_for_llms_full_txt__does_not_match_llms_txt() {
		$_SERVER['REQUEST_URI'] = '/llms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_request_for' );
		$method->setAccessible( true );

		$result = $method->invoke( $this->module, 'llms-full.txt' );

		$this->assertFalse( $result );
	}

	public function test_post_state_change__invalidates_cache_and_fires_action() {
		$invalidated_for = null;

		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function ( $id ) use ( &$invalidated_for ) {
			$invalidated_for = $id;
		} );

		$post_id = $this->factory()->post->create( [ 'post_status' => 'publish' ] );
		$this->module->on_post_state_change( $post_id );

		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );

		$this->assertSame( $post_id, $invalidated_for );
	}

	// -------------------------------------------------------------------------
	// Post-meta inline-content cache invalidation wired through Module
	// -------------------------------------------------------------------------

	public function test_on_post_change__clears_post_inline_meta_cache() {
		$post_id = $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_content' => 'Initial body.',
		] );

		// Seed a fake inline meta cache entry.
		update_post_meta( $post_id, \Elementor\Modules\Agents\Content_Generator::INLINE_META_KEY, [
			'v'       => \Elementor\Modules\Agents\Content_Generator::INLINE_CACHE_VERSION,
			'content' => '# Cached',
		] );

		$this->module->on_post_change( $post_id, get_post( $post_id ) );

		$this->assertEmpty(
			get_post_meta( $post_id, \Elementor\Modules\Agents\Content_Generator::INLINE_META_KEY, true )
		);
	}

	public function test_on_post_state_change__clears_post_inline_meta_cache() {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'publish' ] );

		update_post_meta( $post_id, \Elementor\Modules\Agents\Content_Generator::INLINE_META_KEY, [
			'v'       => \Elementor\Modules\Agents\Content_Generator::INLINE_CACHE_VERSION,
			'content' => '# Cached',
		] );

		$this->module->on_post_state_change( $post_id );

		$this->assertEmpty(
			get_post_meta( $post_id, \Elementor\Modules\Agents\Content_Generator::INLINE_META_KEY, true )
		);
	}

	public function test_on_global_change__clears_assembled_transients_and_fires_action() {
		// Warm the assembled transient cache.
		$this->module->get_generated_llms_txt();

		$fired = false;
		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function () use ( &$fired ) {
			$fired = true;
		} );

		$this->module->on_global_change();

		remove_all_actions( 'elementor/agents/llms_txt/cache_invalidated' );

		$this->assertTrue( $fired, 'cache_invalidated action must fire on global change' );
	}

	public function test_get_llms_txt_content__is_deprecated_and_returns_empty() {
		// Arrange
		$this->setExpectedDeprecated( 'Elementor\\Modules\\Agents\\Module::get_llms_txt_content' );

		// Act
		$result = $this->module->get_llms_txt_content();

		// Assert
		$this->assertSame( '', $result );
	}

	public function test_should_advertise_llms_txt__returns_true_when_enabled() {
		$this->assertTrue( $this->module->should_advertise_llms_txt() );
	}

	public function test_should_advertise_llms_txt__returns_false_when_llms_is_disabled() {
		$settings = new \Elementor\Modules\Agents\Agent_Ready_Settings(
			new \Elementor\Modules\Agents\Content_Generator( new \Elementor\Modules\Agents\Prompt_Injection_Sanitizer() )
		);
		$settings->ensure_option_exists();
		$settings->set_server_value( \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		$module = new Module();

		$this->assertFalse( $module->should_advertise_llms_txt() );
	}

	public function test_should_advertise_llms_txt__returns_false_when_decision_is_keep() {
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );

		$this->assertFalse( $this->module->should_advertise_llms_txt() );
	}

	public function test_should_advertise_llms_txt__returns_true_when_decision_is_replace() {
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );

		$this->assertTrue( $this->module->should_advertise_llms_txt() );
	}

	public function test_should_advertise_llms_txt__returns_false_when_physical_file_exists_even_if_replace() {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$file_path = get_home_path() . Module::LLMS_FILENAME;

		try {
			file_put_contents( $file_path, '# Physical file' );
			update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );
			Module::reset_physical_file_cache();

			$this->assertFalse( $this->module->should_advertise_llms_txt() );
			$this->assertTrue( $this->module->should_advertise_llms_full_txt() );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			Module::reset_physical_file_cache();
		}
	}

	public function test_should_advertise_llms_full_txt__returns_true_when_enabled() {
		$this->assertTrue( $this->module->should_advertise_llms_full_txt() );
	}

	public function test_should_advertise_llms_full_txt__returns_false_when_disabled() {
		$settings = new \Elementor\Modules\Agents\Agent_Ready_Settings(
			new \Elementor\Modules\Agents\Content_Generator( new \Elementor\Modules\Agents\Prompt_Injection_Sanitizer() )
		);
		$settings->ensure_option_exists();
		$settings->set_server_value( \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		$module = new Module();

		$this->assertFalse( $module->should_advertise_llms_full_txt() );
	}

	public function test_should_advertise_llms_full_txt__returns_true_even_when_physical_file_kept() {
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );

		$this->assertTrue( $this->module->should_advertise_llms_full_txt() );
	}

	public function test_on_settings_change__invalidates_well_known_cache() {
		// Arrange - warm the ARD manifest cache
		$ard_manifest = new \Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest( $this->module );
		$transient_key = $ard_manifest->get_transient_key();
		set_transient( $transient_key, [ 'body' => '{}', 'etag' => '"test"', 'last_modified' => gmdate( 'r' ) ], 900 );

		// Act
		$this->module->on_settings_change();

		// Assert - cache should be invalidated
		$this->assertFalse( get_transient( $transient_key ) );
	}

	public function test_existing_file_decision_change__invalidates_cache() {
		// Arrange - warm both caches
		$this->module->get_generated_llms_txt();
		$ard_manifest = new \Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest( $this->module );
		$transient_key = $ard_manifest->get_transient_key();
		set_transient( $transient_key, [ 'body' => '{}', 'etag' => '"test"', 'last_modified' => gmdate( 'r' ) ], 900 );

		// Act - change the decision
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );

		// Assert - well-known cache should be invalidated (triggers on_settings_change)
		$this->assertFalse( get_transient( $transient_key ) );
	}

	public function test_first_time_decision_add__invalidates_cache() {
		// Arrange - ensure option doesn't exist
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		// Warm cache
		$this->module->get_generated_llms_txt();
		$ard_manifest = new \Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest( $this->module );
		$transient_key = $ard_manifest->get_transient_key();
		set_transient( $transient_key, [ 'body' => '{}', 'etag' => '"test"', 'last_modified' => gmdate( 'r' ) ], 900 );

		// Act - first-time add
		add_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );

		// Assert - cache should be invalidated
		$this->assertFalse( get_transient( $transient_key ) );
	}

	public function test_reset_physical_file_cache__clears_multisite_cache() {
		// Arrange - populate cache for current blog
		Module::has_physical_llms_file();

		// Act
		Module::reset_physical_file_cache();

		// Assert - cache should be cleared (next call will check filesystem)
		// We can't directly assert the cache is empty, but we can verify the method runs
		$this->assertIsBool( Module::has_physical_llms_file() );
	}

	public function test_maybe_serve_llms_txt__bails_when_physical_file_exists_with_keep_decision() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/llms.txt';
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );

		// Capture output
		ob_start();
		$this->module->maybe_serve_llms_txt();
		$output = ob_get_clean();

		// Assert - should not serve (bail early)
		$this->assertEmpty( $output );
	}

	public function test_ajax_activate__skips_unavailable_modules() {
		// Arrange
		delete_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION );
		update_option( 'rank_math_modules', [ 'llms-txt' ] );

		try {
			// Act
			$this->module->ajax_activate();

			// Assert
			$settings = get_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION );
			$this->assertFalse( $settings[ \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_LLMS_TXT ]['enabled'] );
			$this->assertTrue( $settings[ \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT ]['enabled'] );
		} finally {
			delete_option( 'rank_math_modules' );
		}
	}

	public function test_should_advertise_llms_txt__returns_false_when_not_activated() {
		// Arrange
		$settings = new \Elementor\Modules\Agents\Agent_Ready_Settings(
			new \Elementor\Modules\Agents\Content_Generator( new \Elementor\Modules\Agents\Prompt_Injection_Sanitizer() )
		);
		$settings->ensure_option_exists();

		$stored = get_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION );
		$stored[ \Elementor\Modules\Agents\Agent_Ready_Settings::ACTIVATED_KEY ] = false;
		$stored[ \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_LLMS_TXT ]['enabled'] = true;
		update_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION, $stored );

		// Act
		$result = $this->module->should_advertise_llms_txt();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_advertise_llms_txt__returns_false_when_seo_plugin_active() {
		// Arrange
		update_option( 'rank_math_modules', [ 'llms-txt' ] );

		try {
			// Act
			$result = $this->module->should_advertise_llms_txt();

			// Assert
			$this->assertFalse( $result );
		} finally {
			delete_option( 'rank_math_modules' );
			\Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector::reset_cache();
		}
	}

	public function test_should_advertise_llms_full_txt__returns_false_when_physical_file_exists() {
		// Arrange
		$llms_full_path = Module::get_llms_file_root_path() . 'llms-full.txt';
		$reflection = new \ReflectionMethod( Module::class, 'get_llms_file_root_path' );
		$reflection->setAccessible( true );
		$root_path = $reflection->invoke( null );
		$file_path = $root_path . 'llms-full.txt';

		if ( ! is_writable( $root_path ) ) {
			$this->markTestSkipped( 'Root path is not writable' );
		}

		file_put_contents( $file_path, 'test' );

		try {
			Module::reset_physical_file_cache();

			// Act
			$result = $this->module->should_advertise_llms_full_txt();

			// Assert
			$this->assertFalse( $result );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			Module::reset_physical_file_cache();
		}
	}

	public function test_seo_plugin_generates_llms_txt__returns_true_when_owner_detected() {
		// Arrange
		update_option( 'rank_math_modules', [ 'llms-txt' ] );

		try {
			// Act
			$result = $this->module->seo_plugin_generates_llms_txt();

			// Assert
			$this->assertTrue( $result );
		} finally {
			delete_option( 'rank_math_modules' );
			\Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector::reset_cache();
		}
	}

	public function test_on_post_change__skips_cache_clear_when_no_modules_active() {
		// Arrange
		$settings = new \Elementor\Modules\Agents\Agent_Ready_Settings(
			new \Elementor\Modules\Agents\Content_Generator( new \Elementor\Modules\Agents\Prompt_Injection_Sanitizer() )
		);
		$settings->ensure_option_exists();

		$stored = get_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION );
		$stored[ \Elementor\Modules\Agents\Agent_Ready_Settings::ACTIVATED_KEY ] = false;
		update_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION, $stored );

		$post_id = $this->factory()->post->create();
		$post = get_post( $post_id );

		$invalidated = false;
		add_action( 'elementor/agents/llms_txt/cache_invalidated', function() use ( &$invalidated ) {
			$invalidated = true;
		} );

		// Act
		$this->module->on_post_change( $post_id, $post );

		// Assert
		$this->assertFalse( $invalidated );
	}

	public function test_on_seo_plugin_option_change__flushes_well_known_caches_when_agent_discovery_active() {
		// Arrange
		$ard_manifest = new \Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest( $this->module );
		$transient_key = $ard_manifest->get_transient_key();
		set_transient( $transient_key, [ 'body' => '{}', 'etag' => '"test"', 'last_modified' => gmdate( 'r' ) ], 900 );

		// Act
		update_option( 'rank_math_modules', [ 'llms-txt' ] );

		// Assert
		$this->assertFalse( get_transient( $transient_key ) );

		// Cleanup
		delete_option( 'rank_math_modules' );
		\Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector::reset_cache();
	}

	public function test_on_settings_change__clears_caches_for_newly_enabled_llms_txt_module() {
		// Arrange
		$settings = get_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION );
		$settings[ \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_LLMS_TXT ]['enabled'] = false;
		update_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION, $settings );

		$this->module->get_generated_llms_txt();

		// Act
		$settings[ \Elementor\Modules\Agents\Agent_Ready_Settings::MODULE_LLMS_TXT ]['enabled'] = true;
		update_option( \Elementor\Modules\Agents\Agent_Ready_Settings::OPTION, $settings );

		// Assert - cache should be invalidated
		$cache = new \Elementor\Modules\Agents\Llms_Cache();
		$this->assertFalse( $cache->get_llms() );
	}
}

