<?php
namespace Elementor\Testing\Core\Base;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Files\Base as Files_Base;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Plugin;
use Elementor\Testing\Core\Base\Mock\Mock_Upgrades_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

require_once 'mock/mock-upgrades-manager.php';

class Test_DB_Upgrades_Manager extends Elementor_Test_Base {

	const EXPERIMENT_NAME = 'e_optimized_css_files';

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( self::EXPERIMENT_NAME )['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			self::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		foreach ( glob( Files_Base::get_base_uploads_dir() . Files_Base::DEFAULT_FILES_DIR . '*' ) ?: [] as $file_path ) {
			if ( is_file( $file_path ) ) {
				unlink( $file_path );
			}
		}

		parent::tearDown();
	}

	public function test_get_upgrade_callbacks__ensure_callback_on_each_version() {
		// Arrange.
		$upgrade_manager = new Mock_Upgrades_Manager();

		// Act.
		$callbacks = $upgrade_manager->get_upgrade_callbacks();

		// Assert.
		$this->assertCount( 1, $callbacks );
		$this->assertEquals( '_on_each_version', reset( $callbacks )[1] );
	}

	/**
	 * Elementor's own DB upgrade process purges around both `start_run()` and
	 * `on_runner_complete()`. When `e_optimized_css_files` is active, that automatic
	 * purge must invalidate meta only, so files stay on disk until they're regenerated.
	 */
	public function test_clear_cache__experiment_active__invalidates_meta_but_keeps_files_on_disk() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( self::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		$post_id = $this->factory()->post->create();
		$dir = Files_Base::get_base_uploads_dir() . Files_Base::DEFAULT_FILES_DIR;
		wp_mkdir_p( $dir );
		$path = $dir . 'post-' . $post_id . '.css';
		file_put_contents( $path, '.test{color:red}' );
		add_post_meta( $post_id, Post_CSS::META_KEY, [ 'status' => 'file' ] );

		$upgrade_manager = new Mock_Upgrades_Manager();

		// Act.
		$upgrade_manager->mock_clear_cache();

		// Assert.
		$this->assertFileExists( $path );
		$this->assertEmpty( get_post_meta( $post_id, Post_CSS::META_KEY ) );
	}

	public function test_clear_cache__experiment_inactive__still_hard_deletes_files() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( self::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		$post_id = $this->factory()->post->create();
		$dir = Files_Base::get_base_uploads_dir() . Files_Base::DEFAULT_FILES_DIR;
		wp_mkdir_p( $dir );
		$path = $dir . 'post-' . $post_id . '.css';
		file_put_contents( $path, '.test{color:red}' );
		add_post_meta( $post_id, Post_CSS::META_KEY, [ 'status' => 'file' ] );

		$upgrade_manager = new Mock_Upgrades_Manager();

		// Act.
		$upgrade_manager->mock_clear_cache();

		// Assert - no regression: today's hard-delete behaviour is preserved.
		$this->assertFileDoesNotExist( $path );
		$this->assertEmpty( get_post_meta( $post_id, Post_CSS::META_KEY ) );
	}
}
