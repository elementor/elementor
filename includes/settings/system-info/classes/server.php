<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Server_Reporter extends Base_Reporter {

	public function get_title() {
		return __( 'Server Environment', 'elementor' );
	}

	public function get_fields() {
		return [
			'os' => __( 'Operating System', 'elementor' ),
			'software' => __( 'Software', 'elementor' ),
			'mysql_version' => __( 'MySQL version', 'elementor' ),
			'php_version' => __( 'PHP Version', 'elementor' ),
			'php_max_input_vars' => __( 'PHP Max Input Vars', 'elementor' ),
			'php_max_post_size' => __( 'PHP Max Post Size', 'elementor' ),
			'gd_installed' => __( 'GD Installed', 'elementor' ),
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
			$result['recommendation'] = __( 'We recommend to use php 5.4 or higher', 'elementor' );
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
			'value' => extension_loaded( 'gd' ) ? __( 'Yes', 'elementor' ) : __( 'No', 'elementor' ),
		];
	}

	public function get_mysql_version() {
		global $wpdb;

		return [
			'value' => $wpdb->db_version(),
		];
	}
}
