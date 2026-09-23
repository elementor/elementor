<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Files\Base;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Files\Manager;
use Elementor\Core\Page_Assets\Data_Managers\Base as Page_Assets_Data_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

class Test_Files_Manager extends Elementor_Test_Base {

	const EXPERIMENT_NAME = 'e_optimized_css_files';

     /** @var Manager */
     private $files_manager;

	private $original_experiment_default_state;

     public function setUp(): void {
         parent::setUp();
         $this->files_manager = new Manager();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( self::EXPERIMENT_NAME )['default'];
     }

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			self::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		foreach ( glob( Base::get_base_uploads_dir() . Base::DEFAULT_FILES_DIR . '*' ) ?: [] as $file_path ) {
			if ( is_file( $file_path ) ) {
				unlink( $file_path );
			}
		}

		parent::tearDown();
	}

	private function set_experiment_state( $state ) {
		Plugin::$instance->experiments->set_feature_default_state( self::EXPERIMENT_NAME, $state );
	}

	/**
	 * Create a fake, already-generated CSS file on disk and matching post meta, as
	 * if a normal render had already produced it.
	 *
	 * @return array{post_id: int, path: string}
	 */
	private function create_fake_css_file() {
		$post_id = $this->factory()->post->create();

		$dir = Base::get_base_uploads_dir() . Base::DEFAULT_FILES_DIR;
		wp_mkdir_p( $dir );

		$path = $dir . 'post-' . $post_id . '.css';
		file_put_contents( $path, '.test{color:red}' );

		add_post_meta( $post_id, Post_CSS::META_KEY, [
			'time' => time(),
			'status' => 'file',
			'css' => '',
			'fonts' => [],
			'icons' => [],
			'dynamic_elements_ids' => [],
		] );

		return [
			'post_id' => $post_id,
			'path' => $path,
		];
	}

	public function test_invalidate_cache__clears_meta_but_keeps_files_on_disk() {
		// Arrange.
		$fake_file = $this->create_fake_css_file();

		// Act.
		$this->files_manager->invalidate_cache();

		// Assert.
		$this->assertFileExists( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	public function test_invalidate_cache__fires_invalidate_action_not_clear_action() {
		// Arrange.
		$invalidate_fired = false;
		$clear_fired = false;

		add_action( 'elementor/core/files/invalidate_cache', function () use ( &$invalidate_fired ) {
			$invalidate_fired = true;
		} );
		add_action( 'elementor/core/files/clear_cache', function () use ( &$clear_fired ) {
			$clear_fired = true;
		} );

		// Act.
		$this->files_manager->invalidate_cache();

		// Assert.
		$this->assertTrue( $invalidate_fired );
		$this->assertFalse( $clear_fired );
	}

	public function test_clear_cache__deletes_meta_and_files_from_disk() {
		// Arrange.
		$fake_file = $this->create_fake_css_file();

		// Act.
		$this->files_manager->clear_cache();

		// Assert.
		$this->assertFileDoesNotExist( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	public function test_clear_cache__still_fires_both_invalidate_and_clear_actions() {
		// Arrange.
		$invalidate_fired = false;
		$clear_fired = false;

		add_action( 'elementor/core/files/invalidate_cache', function () use ( &$invalidate_fired ) {
			$invalidate_fired = true;
		} );
		add_action( 'elementor/core/files/clear_cache', function () use ( &$clear_fired ) {
			$clear_fired = true;
		} );

		// Act.
		$this->files_manager->clear_cache();

		// Assert: clear_cache() calls invalidate_cache() internally for the meta part,
		// so both actions must fire, in order.
		$this->assertTrue( $invalidate_fired );
		$this->assertTrue( $clear_fired );
	}

	/**
	 * @dataProvider site_url_change_hook_data_provider
	 *
	 * @return void
	 */
	public function test_register_actions__change_site_url( $type ) {
		// Arrange.
		remove_all_actions( "update_option_{$type}" );
		update_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY, 'test-value' );

		$manager = new Manager();

		// Act.
		do_action( "update_option_{$type}" );

		// Assert.
		$this->assertFalse( get_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY ) );
	}

	public function site_url_change_hook_data_provider() {
		return [
			[ 'siteurl' ],
			[ 'home' ],
		];
	}

    public function test_rest_clear_cache_unauthorized() {
        // Arrange
        do_action( 'rest_api_init' );

        $request = new WP_REST_Request('DELETE', '/elementor/v1/cache');

        // Act
        $response = rest_do_request($request);

        // Assert
        $this->assertEquals(401, $response->get_status());
    }


    public function test_rest_clear_cache_forbidden() {
        // Arrange
        do_action( 'rest_api_init' );

        $this->act_as_editor();

        $request = new WP_REST_Request('DELETE', '/elementor/v1/cache');

        // Act
        $response = rest_do_request($request);

        // Assert
        $this->assertEquals(403, $response->get_status());
    }

    public function test_rest_clear_cache_authorized() {
        // Arrange
        do_action( 'rest_api_init' );

        $this->act_as_admin();

        $request = new WP_REST_Request('DELETE', '/elementor/v1/cache');

        // Act
        $response = rest_do_request($request);

        // Assert
        $this->assertEquals(200, $response->get_status());
    }

	// region Step 1 — guard purge triggers (`e_optimized_css_files`).

	public function test_register_site_changed_hooks__are_registered_ungated() {
		// Assert - relocated from the element-cache module; must be registered regardless
		// of the experiment, since the registration itself is behaviour-neutral.
		$this->assertNotFalse( has_action( 'activated_plugin', [ $this->files_manager, 'on_site_changed' ] ) );
		$this->assertNotFalse( has_action( 'deactivated_plugin', [ $this->files_manager, 'on_site_changed' ] ) );
		$this->assertNotFalse( has_action( 'switch_theme', [ $this->files_manager, 'on_site_changed' ] ) );
		$this->assertNotFalse( has_action( 'upgrader_process_complete', [ $this->files_manager, 'on_upgrader_process_complete' ] ) );
		$this->assertNotFalse( has_action( 'update_option_elementor_element_cache_ttl', [ $this->files_manager, 'on_site_changed' ] ) );
	}

	/**
	 * WordPress fires `upgrader_process_complete` with the `hook_extra` array passed
	 * directly as the action's second argument (see `WP_Upgrader::run()` and e.g.
	 * `Plugin_Upgrader::bulk_upgrade()`), NOT nested under a `hook_extra` key. These
	 * fixtures mirror real payloads.
	 *
	 * @dataProvider genuine_update_hook_extra_data_provider
	 */
	public function test_upgrader_process_complete__experiment_active__genuine_update_invalidates_meta_but_keeps_files( array $hook_extra ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act.
		$this->files_manager->on_upgrader_process_complete( false, $hook_extra );

		// Assert - Step 4: a genuine automatic update invalidates meta, it does not
		// hard-delete files, so there's no window where page-cached HTML 404s.
		$this->assertFileExists( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	public function genuine_update_hook_extra_data_provider() {
		return [
			'single plugin update' => [ [ 'plugin' => 'foo/foo.php', 'type' => 'plugin', 'action' => 'update' ] ],
			'bulk plugin update' => [ [ 'plugins' => [ 'foo/foo.php' ], 'type' => 'plugin', 'action' => 'update', 'bulk' => true ] ],
			'single theme update' => [ [ 'theme' => 'foo', 'type' => 'theme', 'action' => 'update' ] ],
			'bulk theme update' => [ [ 'themes' => [ 'foo' ], 'type' => 'theme', 'action' => 'update', 'bulk' => true ] ],
			'core update' => [ [ 'type' => 'core', 'action' => 'update' ] ],
			'plugin install' => [ [ 'type' => 'plugin', 'action' => 'install' ] ],
		];
	}

	/**
	 * @dataProvider false_alarm_hook_extra_data_provider
	 */
	public function test_upgrader_process_complete__experiment_active__false_alarm_skips_purge_entirely( $hook_extra ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act.
		$this->files_manager->on_upgrader_process_complete( false, $hook_extra );

		// Assert - neither the file nor the meta is touched at all.
		$this->assertFileExists( $fake_file['path'] );
		$this->assertNotEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	public function false_alarm_hook_extra_data_provider() {
		return [
			'null (false-y hook_extra)' => [ null ],
			'empty array' => [ [] ],
			'non-array' => [ 'not-an-array' ],
			'translation update (type)' => [
				[ 'action' => 'update', 'type' => 'translation', 'bulk' => true, 'translations' => [ [ 'language' => 'de_DE' ] ] ],
			],
			'bulk plugin update with empty queue' => [
				[ 'action' => 'update', 'type' => 'plugin', 'bulk' => true, 'plugins' => [] ],
			],
			'bulk theme update with empty queue' => [
				[ 'action' => 'update', 'type' => 'theme', 'bulk' => true, 'themes' => [] ],
			],
			'single plugin update missing plugin key' => [
				[ 'action' => 'update', 'type' => 'plugin' ],
			],
		];
	}

	/**
	 * @dataProvider false_alarm_hook_extra_data_provider
	 */
	public function test_upgrader_process_complete__experiment_inactive__always_hard_deletes( $hook_extra ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_INACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act.
		$this->files_manager->on_upgrader_process_complete( false, $hook_extra );

		// Assert - today's behaviour is preserved: hard-delete on every call, regardless
		// of payload shape, when the experiment is off.
		$this->assertFileDoesNotExist( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	/**
	 * Integration-style check that a real `do_action( 'upgrader_process_complete', ... )`
	 * call - as WordPress itself fires it, with the hook_extra array as arg 2 - still
	 * reaches the registered callback and invalidates for a genuine update.
	 */
	public function test_upgrader_process_complete__real_do_action__genuine_bulk_plugin_update_invalidates() {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act - mirrors Plugin_Upgrader::bulk_upgrade()'s do_action() call exactly.
		do_action(
			'upgrader_process_complete',
			false,
			[
				'action' => 'update',
				'type' => 'plugin',
				'bulk' => true,
				'plugins' => [ 'foo/foo.php' ],
			]
		);

		// Assert.
		$this->assertFileExists( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	/**
	 * Same real `do_action()` shape as above, but for the false-alarm case WP fires on
	 * a routine `wp_version_check()` / `wp_maybe_auto_update()` no-op pass.
	 */
	public function test_upgrader_process_complete__real_do_action__update_check_does_not_purge() {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act.
		do_action( 'upgrader_process_complete', null, [] );

		// Assert.
		$this->assertFileExists( $fake_file['path'] );
		$this->assertNotEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	// endregion

	// region Step 4 — invalidate vs. delete on automatic site-change hooks.

	/**
	 * @dataProvider automatic_site_change_hook_data_provider
	 */
	public function test_on_site_changed__experiment_active__invalidates_meta_but_keeps_files( $hook ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act.
		do_action( $hook );

		// Assert.
		$this->assertFileExists( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	/**
	 * @dataProvider automatic_site_change_hook_data_provider
	 */
	public function test_on_site_changed__experiment_inactive__still_hard_deletes( $hook ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_INACTIVE );
		$fake_file = $this->create_fake_css_file();

		// Act.
		do_action( $hook );

		// Assert - no regression: today's hard-delete behaviour is preserved.
		$this->assertFileDoesNotExist( $fake_file['path'] );
		$this->assertEmpty( get_post_meta( $fake_file['post_id'], Post_CSS::META_KEY ) );
	}

	public function automatic_site_change_hook_data_provider() {
		return [
			'activated_plugin' => [ 'activated_plugin' ],
			'deactivated_plugin' => [ 'deactivated_plugin' ],
			'switch_theme' => [ 'switch_theme' ],
			'update_option_elementor_element_cache_ttl' => [ 'update_option_elementor_element_cache_ttl' ],
		];
	}

	/**
	 * Elementor's own DB upgrade path and the `upgrader_process_complete` hook can
	 * both fire an automatic purge within a single request. When the experiment is
	 * active, repeated automatic purges on the same manager instance must collapse
	 * into a single invalidation rather than each re-triggering
	 * `elementor/core/files/invalidate_cache` listeners (e.g. the atomic-widgets
	 * cache-validity trees) redundantly.
	 *
	 * Calls the manager's methods directly (rather than firing the real WP hooks via
	 * `do_action()`) so this only exercises `$this->files_manager` - the process-wide
	 * `Plugin::$instance->files_manager` singleton is also subscribed to those hooks
	 * and would otherwise contribute its own, separately-deduped, invalidation.
	 */
	public function test_automatic_purge__experiment_active__dedupes_across_invalidate_and_clear_within_a_request() {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$invalidate_count = 0;
		add_action( 'elementor/core/files/invalidate_cache', function () use ( &$invalidate_count ) {
			++$invalidate_count;
		} );

		// Act - simulates activation firing, then Elementor's own DB-upgrade purging again.
		$this->files_manager->on_site_changed();
		$this->files_manager->on_site_changed();
		$this->files_manager->invalidate_cache();

		// Assert.
		$this->assertSame( 1, $invalidate_count );
	}

	public function test_automatic_purge__experiment_inactive__does_not_dedupe() {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_INACTIVE );
		$clear_count = 0;
		add_action( 'elementor/core/files/clear_cache', function () use ( &$clear_count ) {
			++$clear_count;
		} );

		// Act.
		$this->files_manager->on_site_changed();
		$this->files_manager->on_site_changed();

		// Assert - today's behaviour is preserved: every call purges when the
		// experiment is off.
		$this->assertSame( 2, $clear_count );
	}

	// endregion
}
