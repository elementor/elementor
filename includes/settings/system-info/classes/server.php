<?php
namespace Elementor\System_Info\Classes;

use Elementor\Api;
use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Server_Reporter extends Base_Reporter {

	public function get_title() {
		return 'Server Environment';
	}

	public function get_fields() {
		return [
			'os' => 'Operating System',
			'software' => 'Software',
			'mysql_version' => 'MySQL version',
			'php_version' => 'PHP Version',
			'php_max_input_vars' => 'PHP Max Input Vars',
			'php_max_post_size' => 'PHP Max Post Size',
			'gd_installed' => 'GD Installed',
			'elementor_library' => 'Elementor Library',
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

	public function get_elementor_library() {
		$response = wp_remote_post( Api::$api_info_url, [
			'timeout' => 25,
			'body' => [
				// Which API version is used
				'api_version' => ELEMENTOR_VERSION,
				// Which language to return
				'site_lang' => get_bloginfo( 'language' ),
			],
		] );

		if ( is_wp_error( $response ) ) {
			return [
				'value' => 'Not connected (' . $response->get_error_message() . ')',
			];
		}

		$http_response_code = wp_remote_retrieve_response_code( $response );

		if ( 200 !== (int) $http_response_code ) {
			$error_msg = 'HTTP Error (' . $http_response_code . ')';

			return [
				'value' => 'Not connected (' . $error_msg . ')',
			];
		}

		$info_data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $info_data ) ) {
			return [
				'value' => 'Not connected (Returns invalid JSON)',
			];
		}

		return [
			'value' => 'Connected',
		];
	}
}
