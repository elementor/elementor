<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A minimal concrete subclass of `Core\Files\Base`, used to exercise the abstract base
 * class's versioning (`get_url()` / `ver`) and content-hashing behavior in isolation,
 * without depending on posts, documents or CSS parsing.
 */
class Stable_Url_Test_File extends \Elementor\Core\Files\Base {

	const META_KEY = 'elementor_test_stable_url_file_meta';

	public $content_to_write = 'content';

	protected function parse_content() {
		return $this->content_to_write;
	}
}

class Test_Base extends Elementor_Test_Base {

	/**
	 * @var Stable_Url_Test_File
	 */
	private $file;

	public function setUp(): void {
		parent::setUp();

		delete_option( Stable_Url_Test_File::META_KEY );

		$this->file = new Stable_Url_Test_File( 'test-stable-url-file.css' );
	}

	public function tearDown(): void {
		$this->file->delete();

		delete_option( Stable_Url_Test_File::META_KEY );

		Plugin::$instance->experiments->set_feature_default_state( 'e_optimized_css_files', Experiments_Manager::STATE_INACTIVE );

		parent::tearDown();
	}

	private function activate_experiment() {
		Plugin::$instance->experiments->set_feature_default_state( 'e_optimized_css_files', Experiments_Manager::STATE_ACTIVE );
	}

	private function get_ver_from_url( $url ) {
		$query = [];

		wp_parse_str( wp_parse_url( $url, PHP_URL_QUERY ), $query );

		return $query['ver'] ?? null;
	}

	public function test_get_url__experiment_active__regenerating_unchanged_content_keeps_same_ver() {
		// Arrange.
		$this->activate_experiment();

		$this->file->content_to_write = 'a{color:red}';

		// Act.
		$this->file->update();
		$first_ver = $this->get_ver_from_url( $this->file->get_url() );

		// Regenerate again, content unchanged.
		$this->file->update();
		$second_ver = $this->get_ver_from_url( $this->file->get_url() );

		// Assert.
		$this->assertNotEmpty( $first_ver );
		$this->assertSame( $first_ver, $second_ver );
	}

	public function test_get_url__experiment_active__changed_content_changes_ver() {
		// Arrange.
		$this->activate_experiment();

		$this->file->content_to_write = 'a{color:red}';

		// Act.
		$this->file->update();
		$first_ver = $this->get_ver_from_url( $this->file->get_url() );

		$this->file->content_to_write = 'a{color:blue}';
		$this->file->update();
		$second_ver = $this->get_ver_from_url( $this->file->get_url() );

		// Assert.
		$this->assertNotEmpty( $first_ver );
		$this->assertNotEmpty( $second_ver );
		$this->assertNotSame( $first_ver, $second_ver );
	}

	public function test_get_url__experiment_inactive__ver_still_comes_from_time_meta() {
		// Arrange. Experiment stays inactive (default).
		$this->file->content_to_write = 'a{color:red}';

		// Act.
		$this->file->update();
		$ver = $this->get_ver_from_url( $this->file->get_url() );

		// Assert.
		$this->assertSame( (string) $this->file->get_meta( 'time' ), $ver );
	}

	public function test_get_url__experiment_inactive__ver_unaffected_by_content_changes() {
		// Arrange. Experiment stays inactive (default).
		$this->file->content_to_write = 'a{color:red}';
		$this->file->update();

		$first_time = $this->file->get_meta( 'time' );

		// Force a distinguishable "time" for the second regeneration.
		sleep( 1 );

		$this->file->content_to_write = 'a{color:red}'; // Unchanged content.
		$this->file->update();

		$second_time = $this->file->get_meta( 'time' );

		// Assert. Legacy behavior: `ver` tracks `time`, regardless of content, and therefore
		// still changes on every regeneration even when nothing changed.
		$this->assertNotSame( $first_time, $second_time );
		$this->assertSame( (string) $second_time, $this->get_ver_from_url( $this->file->get_url() ) );
	}

	public function test_get_url__experiment_active__falls_back_to_time_when_hash_meta_absent() {
		// Arrange. Simulate old-style meta written before the hash key existed / by old code.
		$this->activate_experiment();

		update_option( Stable_Url_Test_File::META_KEY, [
			'time' => 12345,
		] );

		// Act.
		$ver = $this->get_ver_from_url( $this->file->get_url() );

		// Assert. No errors, and the version gracefully falls back to `time`.
		$this->assertSame( '12345', $ver );
		$this->assertSame( '', $this->file->get_meta( 'hash' ) );

		// Once the file goes through update() again, the hash key becomes populated and used.
		$this->file->content_to_write = 'a{color:green}';
		$this->file->update();

		$hash = $this->file->get_meta( 'hash' );
		$new_ver = $this->get_ver_from_url( $this->file->get_url() );

		$this->assertNotEmpty( $hash );
		$this->assertSame( $hash, $new_ver );
		$this->assertNotSame( 12345, $new_ver );
	}
}
