<?php
namespace Elementor\Modules\System_Info\Reporters;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor WordPress environment report.
 *
 * Elementor system report handler class responsible for generating a report for
 * the WordPress environment.
 *
 * @since 1.0.0
 */
class WordPress extends Base {

	/**
	 * Get WordPress environment reporter title.
	 *
	 * Retrieve WordPress environment reporter title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Reporter title.
	 */
	public function get_title() {
		return 'WordPress Environment';
	}

	/**
	 * Get WordPress environment report fields.
	 *
	 * Retrieve the required fields for the WordPress environment report.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Required report fields with field ID and field label.
	 */
	public function get_fields() {
		return [
			'version' => 'Version',
			'site_url' => 'Site URL',
			'home_url' => 'Home URL',
			'is_multisite' => 'WP Multisite',
			'max_upload_size' => 'Max Upload Size',
			'memory_limit' => 'Memory limit',
			'permalink_structure' => 'Permalink Structure',
			'language' => 'Language',
			'timezone' => 'Timezone',
			'admin_email' => 'Admin Email',
			'debug_mode' => 'Debug Mode',
		];
	}

	/**
	 * Get WordPress memory limit.
	 *
	 * Retrieve the WordPress memory limit.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value          WordPress memory limit.
	 *    @type string $recommendation Recommendation memory limit.
	 *    @type bool   $warning        Whether to display a warning. True if the limit
	 *                                 is below the recommended 64M, False otherwise.
	 * }
	 */
	public function get_memory_limit() {
		$result = [
			'value' => ini_get( 'memory_limit' ),
		];

		$min_recommended_memory = '64M';

		$memory_limit_bytes = wp_convert_hr_to_bytes( $result['value'] );

		$min_recommended_bytes = wp_convert_hr_to_bytes( $min_recommended_memory );

		if ( $memory_limit_bytes < $min_recommended_bytes ) {
			$result['recommendation'] = sprintf(
				/* translators: 1: Minimum recommended_memory, 2: Codex URL */
				_x( 'We recommend setting memory to at least %1$s. For more information, read about <a href="%2$s">how to Increase memory allocated to PHP</a>.', 'System Info', 'elementor' ),
				$min_recommended_memory,
				'https://codex.wordpress.org/Editing_wp-config.php#Increasing_memory_allocated_to_PHP'
			);

			$result['warning'] = true;
		}

		return $result;
	}

	/**
	 * Get WordPress version.
	 *
	 * Retrieve the WordPress version.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress version.
	 * }
	 */
	public function get_version() {
		return [
			'value' => get_bloginfo( 'version' ),
		];
	}

	/**
	 * Is multisite.
	 *
	 * Whether multisite is enabled or not.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value Yes if multisite is enabled, No otherwise.
	 * }
	 */
	public function get_is_multisite() {
		return [
			'value' => is_multisite() ? 'Yes' : 'No',
		];
	}

	/**
	 * Get site URL.
	 *
	 * Retrieve WordPress site URL.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress site URL.
	 * }
	 */
	public function get_site_url() {
		return [
			'value' => get_site_url(),
		];
	}

	/**
	 * Get home URL.
	 *
	 * Retrieve WordPress home URL.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress home URL.
	 * }
	 */
	public function get_home_url() {
		return [
			'value' => get_home_url(),
		];
	}

	/**
	 * Get permalink structure.
	 *
	 * Retrieve the permalink structure
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress permalink structure.
	 * }
	 */
	public function get_permalink_structure() {
		global $wp_rewrite;

		$structure = $wp_rewrite->permalink_structure;

		if ( ! $structure ) {
			$structure = 'Plain';
		}

		return [
			'value' => $structure,
		];
	}

	/**
	 * Get site language.
	 *
	 * Retrieve the site language.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress site language.
	 * }
	 */
	public function get_language() {
		return [
			'value' => get_bloginfo( 'language' ),
		];
	}

	/**
	 * Get PHP `max_upload_size`.
	 *
	 * Retrieve the value of maximum upload file size defined in `php.ini` configuration file.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value Maximum upload file size allowed.
	 * }
	 */
	public function get_max_upload_size() {
		return [
			'value' => size_format( wp_max_upload_size() ),
		];
	}

	/**
	 * Get WordPress timezone.
	 *
	 * Retrieve WordPress timezone.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress timezone.
	 * }
	 */
	public function get_timezone() {
		$timezone = get_option( 'timezone_string' );
		if ( ! $timezone ) {
			$timezone = get_option( 'gmt_offset' );
		}

		return [
			'value' => $timezone,
		];
	}

	/**
	 * Get WordPress administrator email.
	 *
	 * Retrieve WordPress administrator email.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value WordPress administrator email.
	 * }
	 */
	public function get_admin_email() {
		return [
			'value' => get_option( 'admin_email' ),
		];
	}

	/**
	 * Get debug mode.
	 *
	 * Whether WordPress debug mode is enabled or not.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array {
	 *    Report data.
	 *
	 *    @type string $value Active if debug mode is enabled, Inactive otherwise.
	 * }
	 */
	public function get_debug_mode() {
		return [
			'value' => WP_DEBUG ? 'Active' : 'Inactive',
		];
	}
}
