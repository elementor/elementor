<?php
namespace Elementor\Core\Debug;

use Elementor\Core\Debug\Classes\Test_Base;
use Elementor\Core\Debug\Classes\Theme_Missing;
use Elementor\Core\Debug\Classes\Htaccess;

class Loading_Inspector_Manager {

	public static $_instance = null;

	public static function instance() {
		if ( null === self::$_instance ) {
			self::$_instance = new Loading_Inspector_Manager();
		}
		return self::$_instance;
	}

	/** @var Test_Base[] */
	private $tests = [];

	public function register_tests() {
		$this->tests['theme-missing'] = new Theme_Missing();
		$this->tests['htaccess'] = new Htaccess();
	}

	/**
	 * @param Test_Base $test
	 */
	public function register_test( $test ) {
		$this->tests[ $test->get_name() ] = $test;
	}

	public function run_tests() {
		$debug_data = [
			'message' => __( 'We\'re sorry, but something went wrong. Click on \'Learn more\' and follow each of the steps to quickly solve it.', 'elementor' ),
			'header' => __( 'The preview could not be loaded', 'elementor' ),
			'doc_url' => 'https://go.elementor.com/preview-not-loaded/',
		];
		foreach ( $this->tests as $test ) {
			if ( ! $test->run() ) {
				$debug_data = [
					'message' => $test->get_message(),
					'header' => $test->get_header_message(),
					'doc_url' => $test->get_help_doc_url(),
					'error' => true,
				];
				break;
			}
		}

		return $debug_data;
	}
}
