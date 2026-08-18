<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	private $module;

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->module = new Module();
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		$this->flush_documents_cache();

		parent::tearDown();
	}

	public function test_experiment_is_registered() {
		// Arrange
		$data = Module::get_experimental_data();

		// Act & Assert
		$this->assertSame( Module::EXPERIMENT_NAME, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
	}

	public function test_get_llms_txt_content__returns_empty_when_not_configured() {
		// Act
		$content = $this->module->get_llms_txt_content();

		// Assert
		$this->assertSame( '', $content );
	}

	public function test_get_llms_txt_content__returns_saved_content() {
		// Arrange
		$llms_content = '# llms.txt';
		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$this->flush_documents_cache();
		$kit = Plugin::$instance->documents->get( $kit_id );
		$kit->update_settings( [
			'agents' => [
				'llms' => $llms_content,
			],
		] );

		$this->flush_documents_cache();

		// Act
		$content = $this->module->get_llms_txt_content();

		// Assert
		$this->assertSame( $llms_content, $content );
	}

	public function test_is_llms_txt_request__matches_root_path() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/llms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Cleanup
		unset( $_SERVER['REQUEST_URI'] );

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

		// Cleanup
		unset( $_SERVER['REQUEST_URI'] );

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

		// Cleanup
		unset( $_SERVER['REQUEST_URI'] );

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

		// Cleanup
		unset( $_SERVER['REQUEST_URI'] );

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
		unset( $_SERVER['REQUEST_URI'] );

		// Assert
		$this->assertTrue( $result );
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

		add_action( 'elementor/agents/llms_txt/cache_invalidated', static function ( $kit_id ) use ( &$invalidated_for ) {
			$invalidated_for = $kit_id;
		} );

		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$this->flush_documents_cache();
		$kit = Plugin::$instance->documents->get( $kit_id );

		// Act
		$kit->save( [
			'settings' => [
				'agents' => [
					'llms' => '# llms.txt',
				],
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
		// Warm the cache.
		$first = $this->module->get_generated_llms_txt();
		// Publish a new page — cache must serve stale until explicitly invalidated.
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'This Should Not Appear In Cached Output',
		] );
		$second = $this->module->get_generated_llms_txt();
		// Stale cached content is served.
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

		$this->module->save_overrides( [
			'intro'    => 'My saved intro.',
			'optional' => 'My optional section.',
		] );

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

		unset( $_SERVER['REQUEST_URI'] );

		$this->assertTrue( $result );
	}

	public function test_is_request_for_llms_full_txt__does_not_match_llms_txt() {
		$_SERVER['REQUEST_URI'] = '/llms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_request_for' );
		$method->setAccessible( true );

		$result = $method->invoke( $this->module, 'llms-full.txt' );

		unset( $_SERVER['REQUEST_URI'] );

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
}
