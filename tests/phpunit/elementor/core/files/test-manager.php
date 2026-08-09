<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
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
		parent::tearDown();

		Plugin::$instance->experiments->set_feature_default_state(
			self::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);
	}

	private function set_experiment_state( $state ) {
		Plugin::$instance->experiments->set_feature_default_state( self::EXPERIMENT_NAME, $state );
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

	public function test_clear_cache__does_not_emit_warnings_when_nothing_to_delete() {
		// Arrange.
		$purge_count = $this->track_purge_count();

		// Act.
		$this->files_manager->clear_cache();

		// Assert - `convertWarningsToExceptions` in phpunit.xml means a PHP warning from an
		// unguarded `glob()`/`unlink()` would have already failed this test.
		$this->assertSame( 1, $purge_count->count );
	}

	/**
	 * @dataProvider genuine_update_hook_extra_data_provider
	 */
	public function test_upgrader_process_complete__experiment_active__genuine_update_purges( array $hook_extra ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$purge_count = $this->track_purge_count();

		// Act.
		$this->files_manager->on_upgrader_process_complete( false, [ 'hook_extra' => $hook_extra ] );

		// Assert.
		$this->assertSame( 1, $purge_count->count );
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
	public function test_upgrader_process_complete__experiment_active__false_alarm_skips_purge( $options ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$purge_count = $this->track_purge_count();

		// Act.
		$this->files_manager->on_upgrader_process_complete( false, $options );

		// Assert.
		$this->assertSame( 0, $purge_count->count );
	}

	public function false_alarm_hook_extra_data_provider() {
		return [
			'empty options array' => [ [] ],
			'missing hook_extra key' => [ [ 'foo' => 'bar' ] ],
			'empty hook_extra' => [ [ 'hook_extra' => [] ] ],
			'non-array hook_extra' => [ [ 'hook_extra' => 'not-an-array' ] ],
			'translation update (type)' => [
				[ 'hook_extra' => [ 'action' => 'update', 'type' => 'translation', 'bulk' => true, 'translations' => [ [ 'language' => 'de_DE' ] ] ] ],
			],
			'bulk plugin update with empty queue' => [
				[ 'hook_extra' => [ 'action' => 'update', 'type' => 'plugin', 'bulk' => true, 'plugins' => [] ] ],
			],
			'bulk theme update with empty queue' => [
				[ 'hook_extra' => [ 'action' => 'update', 'type' => 'theme', 'bulk' => true, 'themes' => [] ] ],
			],
		];
	}

	/**
	 * @dataProvider false_alarm_hook_extra_data_provider
	 */
	public function test_upgrader_process_complete__experiment_inactive__always_purges( $options ) {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_INACTIVE );
		$purge_count = $this->track_purge_count();

		// Act.
		$this->files_manager->on_upgrader_process_complete( false, $options );

		// Assert - today's behaviour is preserved: purge on every call, regardless of payload shape.
		$this->assertSame( 1, $purge_count->count );
	}

	public function test_clear_cache__experiment_active__dedupes_within_a_single_request() {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );
		$purge_count = $this->track_purge_count();

		// Act.
		$this->files_manager->clear_cache();
		$this->files_manager->clear_cache();
		$this->files_manager->clear_cache();

		// Assert.
		$this->assertSame( 1, $purge_count->count );
	}

	public function test_clear_cache__experiment_inactive__purges_every_call() {
		// Arrange.
		$this->set_experiment_state( Experiments_Manager::STATE_INACTIVE );
		$purge_count = $this->track_purge_count();

		// Act.
		$this->files_manager->clear_cache();
		$this->files_manager->clear_cache();
		$this->files_manager->clear_cache();

		// Assert - today's behaviour is preserved: every call purges.
		$this->assertSame( 3, $purge_count->count );
	}

	public function test_register_site_changed_hooks__are_registered_ungated() {
		// Assert - relocated from the element-cache module; must be registered regardless of the experiment.
		$this->assertNotFalse( has_action( 'activated_plugin', [ $this->files_manager, 'clear_cache' ] ) );
		$this->assertNotFalse( has_action( 'deactivated_plugin', [ $this->files_manager, 'clear_cache' ] ) );
		$this->assertNotFalse( has_action( 'switch_theme', [ $this->files_manager, 'clear_cache' ] ) );
		$this->assertNotFalse( has_action( 'upgrader_process_complete', [ $this->files_manager, 'on_upgrader_process_complete' ] ) );
		$this->assertNotFalse( has_action( 'update_option_elementor_element_cache_ttl', [ $this->files_manager, 'clear_cache' ] ) );
	}

	/**
	 * Registers a listener on `elementor/core/files/clear_cache` and returns an
	 * object whose `count` property tracks how many times it fired.
	 *
	 * @return object
	 */
	private function track_purge_count() {
		$tracker = new class {
			public $count = 0;
		};

		add_action( 'elementor/core/files/clear_cache', function () use ( $tracker ) {
			++$tracker->count;
		} );

		return $tracker;
	}
}
