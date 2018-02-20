<?php
namespace Elementor\System_Info\Classes;

use Elementor\Api;
use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor server environment report.
 *
 * Elementor system report handler class responsible for generating a report for
 * the server environment.
 *
 * @since 1.0.0
 */
class Server_Reporter extends Base_Reporter {

	/**
	 * Get server environment reporter title.
	 *
	 * Retrieve server environment reporter title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Reporter title.
	 */
	public function get_title() {
		return 'Server Environment';
	}

	/**
	 * Get server environment report fields.
	 *
	 * Retrieve the required fields for the server environment report.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Required report fields with field ID and field label.
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
	 * Get server operating system.
	 *
	 * Retrieve the server operating system.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value Server operating system.
	 * }
	 */
	public function get_os() {
		return [
			'value' => PHP_OS,
		];
	}

	/**
	 * Get server software.
	 *
	 * Retrieve the server software.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value Server software.
	 * }
	 */
	public function get_software() {
		return [
			'value' => $_SERVER['SERVER_SOFTWARE'],
		];
	}

	/**
	 * Get PHP version.
	 *
	 * Retrieve the PHP version.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value          PHP version.
	 *    @type string $recommendation Minimum PHP version recommendation.
	 *    @type bool   $warning        Whether to display a warning.
	 * }
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
	 * Get PHP `max_input_vars`.
	 *
	 * Retrieve the value of `max_input_vars` from `php.ini` configuration file.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value PHP `max_input_vars`.
	 * }
	 */
	public function get_php_max_input_vars() {
		return [
			'value' => ini_get( 'max_input_vars' ),
		];
	}

	/**
	 * Get PHP `post_max_size`.
	 *
	 * Retrieve the value of `post_max_size` from `php.ini` configuration file.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value PHP `post_max_size`.
	 * }
	 */
	public function get_php_max_post_size() {
		return [
			'value' => ini_get( 'post_max_size' ),
		];
	}

	/**
	 * Get GD installed.
	 *
	 * Whether the GD extension is installed.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value   Yes if the GD extension is installed, No otherwise.
	 *    @type bool   $warning Whether to display a warning. True if the GD extension is installed, False otherwise.
	 * }
	 */
	public function get_gd_installed() {
		$gd_installed = extension_loaded( 'gd' );

		return [
			'value' => $gd_installed ? 'Yes' : 'No',
			'warning' => ! $gd_installed,
		];
	}

	/**
	 * Get MySQL version.
	 *
	 * Retrieve the MySQL version.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value MySQL version.
	 * }
	 */
	public function get_mysql_version() {
		global $wpdb;

		return [
			'value' => $wpdb->db_version(),
		];
	}

	/**
	 * Get write permissions.
	 *
	 * Check whether the required folders has writing permissions.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value   Writing permissions status.
	 *    @type bool   $warning Whether to display a warning. True if some required
	 *                          folders don't have writing permissions, False otherwise.
	 * }
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
	 * Check for elementor library connectivity.
	 *
	 * Check whether the remote elementor library is reachable.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value   The status of elementor library connectivity.
	 *    @type bool   $warning Whether to display a warning. True if elementor
	 * *                        library is not reachable, False otherwise.
	 * }
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
