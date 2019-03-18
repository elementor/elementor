<?php
namespace Elementor\Core\Debug\Classes;

class Htaccess extends Test_Base {

	private $message = '';

	public function __construct() {
		$this->message = __( 'Your site\'s .htaccess file appears to be missing', 'elementor' );
	}

	public function run() {
		if ( empty( $_SERVER['SERVER_SOFTWARE'] ) ) {
			$this->message = __( 'Server software unknown, please contact the hosting provider', 'elementor' );
			return false;
		}
		$server = strtoupper( $_SERVER['SERVER_SOFTWARE'] );

		if ( strstr( $server, 'APACHE' ) ) {
			$htaccess_file = get_home_path() . '.htaccess';
			return file_exists( $htaccess_file );
		}
		return true;
	}

	public function get_name() {
		return 'apache-htaccess';
	}

	public function get_message() {
		return $this->message;
	}

	public function get_help_doc_url() {
		return 'https://codex.wordpress.org/Settings_Permalinks_Screen';
	}
}
