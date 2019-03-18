<?php
namespace Elementor\Core\Debug;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Debug\Classes\Test_Base;
use Elementor\Core\Debug\Classes\Theme_Missing;
use Elementor\Core\Debug\Classes\Htaccess;

class Loading_Tests_Manager {

	public static $_instance = null;

	public static function instance() {
		if ( null === self::$_instance ) {
			self::$_instance = new Loading_Tests_Manager();
		}
		return self::$_instance;
	}

	/**
	 * singleton.
	 * Loading_Tests_Manager constructor.
	 */
	private function __construct() {
//		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'elementor_preview_loading_test', [ $this, 'run_tests' ] );
	}

	/** @var Test_Base[] */
	private $tests = [];

	public function register_tests() {
		$this->tests['theme-missing'] = new Theme_Missing();
		$this->tests['htaccess'] = new Htaccess();
	}

	public function run_tests() {
		$editor_debug_data = [
			'message' => __( 'We\'re sorry, but something went wrong. Click on \'Learn more\' and follow each of the steps to quickly solve it.', 'elementor' ),
			'header' => __( 'The preview could not be loaded', 'elementor' ),
			'doc_url' => 'https://go.elementor.com/preview-not-loaded/',
		];
		foreach ( $this->tests as $test ) {
			if ( ! $test->run() ) {
				$editor_debug_data['message'] = $test->get_message();
				$editor_debug_data['header'] = $test->get_header_message();
				$editor_debug_data['doc_url'] = $test->get_help_doc_url();
				$editor_debug_data['error'] = true;
				break;
			}
		}

		return $editor_debug_data;
	}
}
