<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Files\Base;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Base_Path_Filters extends Elementor_Test_Base {

	private $custom_base_dir;

	private $custom_base_url;

	public function setUp(): void {
		parent::setUp();

		// Remove any residual filters from prior tests before running.
		remove_all_filters( 'elementor/files/base_dir' );
		remove_all_filters( 'elementor/files/base_url' );

		$upload_dir = wp_upload_dir();
		$this->custom_base_dir = trailingslashit( WP_CONTENT_DIR ) . 'elementor-custom/';
		$this->custom_base_url = trailingslashit( $upload_dir['baseurl'] ) . 'elementor-custom/';
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/files/base_dir' );
		remove_all_filters( 'elementor/files/base_url' );

		Plugin::$instance->experiments->set_feature_default_state( 'e_optimized_css_files', Experiments_Manager::STATE_INACTIVE );

		parent::tearDown();
	}

	private function activate_experiment() {
		Plugin::$instance->experiments->set_feature_default_state( 'e_optimized_css_files', Experiments_Manager::STATE_ACTIVE );
	}

	private function deactivate_experiment() {
		Plugin::$instance->experiments->set_feature_default_state( 'e_optimized_css_files', Experiments_Manager::STATE_INACTIVE );
	}

	private function get_default_base_dir() {
		$upload_dir = wp_upload_dir();

		return $upload_dir['basedir'] . '/' . Base::UPLOADS_DIR;
	}

	private function get_default_base_url() {
		$upload_dir = wp_upload_dir();

		return $upload_dir['baseurl'] . '/' . Base::UPLOADS_DIR;
	}

	public function test_get_base_uploads_dir__experiment_inactive__ignores_filters() {
		$this->deactivate_experiment();

		add_filter( 'elementor/files/base_dir', function () {
			return $this->custom_base_dir;
		} );

		$this->assertSame( $this->get_default_base_dir(), Base::get_base_uploads_dir() );
	}

	public function test_get_base_uploads_url__experiment_inactive__ignores_filters() {
		$this->deactivate_experiment();

		add_filter( 'elementor/files/base_url', function () {
			return $this->custom_base_url;
		} );

		$this->assertSame( $this->get_default_base_url(), Base::get_base_uploads_url() );
	}

	public function test_get_base_uploads_dir__experiment_active__applies_valid_filter() {
		$this->activate_experiment();

		add_filter( 'elementor/files/base_dir', function () {
			return $this->custom_base_dir;
		} );

		$this->assertSame( trailingslashit( wp_normalize_path( $this->custom_base_dir ) ), Base::get_base_uploads_dir() );
	}

	public function test_get_base_uploads_url__experiment_active__applies_valid_filter() {
		$this->activate_experiment();

		add_filter( 'elementor/files/base_url', function () {
			return $this->custom_base_url;
		} );

		$this->assertSame( trailingslashit( $this->custom_base_url ), Base::get_base_uploads_url() );
	}

	public function test_get_base_uploads_dir__experiment_active__rejects_path_traversal() {
		$this->activate_experiment();
		$this->expect_doing_it_wrong( 'Elementor\Core\Files\Base::validate_base_dir' );

		add_filter( 'elementor/files/base_dir', function () {
			return trailingslashit( WP_CONTENT_DIR ) . '../outside/';
		} );

		$this->assertSame( $this->get_default_base_dir(), Base::get_base_uploads_dir() );
	}

	public function test_get_base_uploads_dir__experiment_active__rejects_path_outside_allowed_roots() {
		$this->activate_experiment();
		$this->expect_doing_it_wrong( 'Elementor\Core\Files\Base::validate_base_dir' );

		add_filter( 'elementor/files/base_dir', function () {
			return '/etc/elementor/';
		} );

		$this->assertSame( $this->get_default_base_dir(), Base::get_base_uploads_dir() );
	}

	public function test_get_base_uploads_url__experiment_active__rejects_invalid_url() {
		$this->activate_experiment();
		$this->expect_doing_it_wrong( 'Elementor\Core\Files\Base::validate_base_url' );

		add_filter( 'elementor/files/base_url', function () {
			return 'not-a-valid-url';
		} );

		$this->assertSame( $this->get_default_base_url(), Base::get_base_uploads_url() );
	}
}
