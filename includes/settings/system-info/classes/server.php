<?php
namespace Elementor\System_Info\Classes;

use Elementor\Api;
use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Server_Reporter extends Base_Reporter {

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_title() {
		return 'Server Environment';
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_fields() {
		return [
			'os' => 'Operating System',
			'software' => 'Software',
			'mysql_version' => 'MySQL version',
			'php_version' => 'PHP Version',
			'php_max_input_vars' => 'PHP Max Input Vars',
			'php_max_post_size' => 'PHP Max Post Size',
			'gd_installed' => 'GD Installed',
			'write_permissions' => 'Write Permissions',
			'elementor_library' => 'Elementor Library',
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_os() {
		return [
			'value' => PHP_OS,
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_software() {
		return [
			'value' => $_SERVER['SERVER_SOFTWARE'],
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_php_version() {
		$result = [
			'value' => PHP_VERSION,
		];

		if ( version_compare( $result['value'], '5.4', '<' ) ) {
			$result['recommendation'] = _x( 'We recommend to use php 5.4 or higher', 'System Info', 'elementor' );

			$result['warning'] = true;
		}

		return $result;
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_php_max_input_vars() {
		return [
			'value' => ini_get( 'max_input_vars' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_php_max_post_size() {
		return [
			'value' => ini_get( 'post_max_size' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_gd_installed() {
		$gd_installed = extension_loaded( 'gd' );

		return [
			'value' => $gd_installed ? 'Yes' : 'No',
			'warning' => ! $gd_installed,
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_mysql_version() {
		global $wpdb;

		return [
			'value' => $wpdb->db_version(),
		];
	}

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function get_write_permissions() {
		$paths_to_check = [
			ABSPATH => 'WordPress root directory',
		];

		$write_problems = [];

		$wp_upload_dir = wp_upload_dir();

		if ( $wp_upload_dir['error'] ) {
			$write_problems[] = 'WordPress root uploads directory';
		}

		$elementor_uploads_path = $wp_upload_dir['basedir'] . '/elementor';

		if ( is_dir( $elementor_uploads_path ) ) {
			$paths_to_check[ $elementor_uploads_path ] = 'Elementor uploads directory';
		}

		$htaccess_file = ABSPATH . '/.htaccess';

		if ( file_exists( $htaccess_file ) ) {
			$paths_to_check[ $htaccess_file ] = '.htaccess file';
		}

		foreach ( $paths_to_check as $dir => $description ) {
			if ( ! is_writable( $dir ) ) {
				$write_problems[] = $description;
			}
		}

		if ( $write_problems ) {
			$value = 'There are some writing permissions issues with the following directories/files:' . "\n\t\t - ";

			$value .= implode( "\n\t\t - ", $write_problems );
		} else {
			$value = 'All right';
		}

		return [
			'value' => $value,
			'warning' => !! $write_problems,
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_elementor_library() {
		$response = wp_remote_post(
			Api::$api_info_url, [
				'timeout' => 5,
				'body' => [
					// Which API version is used
					'api_version' => ELEMENTOR_VERSION,
					// Which language to return
					'site_lang' => get_bloginfo( 'language' ),
				],
			]
		);

		if ( is_wp_error( $response ) ) {
			return [
				'value' => 'Not connected (' . $response->get_error_message() . ')',
				'warning' => true,
			];
		}

		$http_response_code = wp_remote_retrieve_response_code( $response );

		if ( 200 !== (int) $http_response_code ) {
			$error_msg = 'HTTP Error (' . $http_response_code . ')';

			return [
				'value' => 'Not connected (' . $error_msg . ')',
				'warning' => true,
			];
		}

		$info_data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $info_data ) ) {
			return [
				'value' => 'Not connected (Returns invalid JSON)',
				'warning' => true,
			];
		}

		return [
			'value' => 'Connected',
		];
	}
}
