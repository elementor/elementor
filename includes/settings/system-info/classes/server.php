<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Server_Reporter extends Base_Reporter {

	public function get_title() {
		return _x( 'Server Environment', 'System Info', 'elementor' );
	}

	public function get_fields() {
		return [
			'os' => _x( 'Operating System', 'System Info', 'elementor' ),
			'software' => _x( 'Software', 'System Info', 'elementor' ),
			'mysql_version' => _x( 'MySQL version', 'System Info', 'elementor' ),
			'php_version' => _x( 'PHP Version', 'System Info', 'elementor' ),
			'php_max_input_vars' => _x( 'PHP Max Input Vars', 'System Info', 'elementor' ),
			'php_max_post_size' => _x( 'PHP Max Post Size', 'System Info', 'elementor' ),
			'gd_installed' => _x( 'GD Installed', 'System Info', 'elementor' ),
		];
	}

	public function get_os() {
		return [
			'value' => PHP_OS,
		];
	}

	public function get_software() {
		return [
			'value' => $_SERVER['SERVER_SOFTWARE'],
		];
	}

	public function get_php_version() {
		$result = [
			'value' => PHP_VERSION,
		];

		if ( version_compare( $result['value'], '5.4', '<' ) ) {
			$result['recommendation'] = _x( 'We recommend to use php 5.4 or higher', 'System Info', 'elementor' );
		}

		return $result;
	}

	public function get_php_max_input_vars() {
		return [
			'value' => ini_get( 'max_input_vars' ),
		];
	}

	public function get_php_max_post_size() {
		return [
			'value' => ini_get( 'post_max_size' ),
		];
	}

	public function get_gd_installed() {
		return [
			'value' => extension_loaded( 'gd' ) ? 'Yes' : 'No',
		];
	}

	public function get_mysql_version() {
		global $wpdb;

		return [
			'value' => $wpdb->db_version(),
		];
	}
}
