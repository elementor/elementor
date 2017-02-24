<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class WordPress_Reporter extends Base_Reporter {

	public function get_title() {
		return 'WordPress Environment';
	}

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

	public function get_memory_limit() {
		$result = [
			'value' => WP_MEMORY_LIMIT,
		];

		$min_recommended_memory = '64M';

		$memory_limit_bytes = wp_convert_hr_to_bytes( WP_MEMORY_LIMIT );

		$min_recommended_bytes = wp_convert_hr_to_bytes( $min_recommended_memory );

		if ( $memory_limit_bytes < $min_recommended_bytes ) {
			$result['recommendation'] = sprintf(
				_x( 'We recommend setting memory to at least %1$s. For more information, read about <a href="%2$s">how to Increase memory allocated to PHP</a>.', 'System Info', 'elementor' ),
				$min_recommended_memory,
				'https://codex.wordpress.org/Editing_wp-config.php#Increasing_memory_allocated_to_PHP'
			);
		}

		return $result;
	}

	public function get_version() {
		return [
			'value' => get_bloginfo( 'version' ),
		];
	}

	public function get_is_multisite() {
		return [
			'value' => is_multisite() ? 'Yes' : 'No',
		];
	}

	public function get_site_url() {
		return [
			'value' => get_site_url(),
		];
	}

	public function get_home_url() {
		return [
			'value' => get_home_url(),
		];
	}

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

	public function get_language() {
		return [
			'value' => get_bloginfo( 'language' ),
		];
	}

	public function get_max_upload_size() {
		return [
			'value' => size_format( wp_max_upload_size() ),
		];
	}

	public function get_timezone() {
		$timezone = get_option( 'timezone_string' );
		if ( ! $timezone ) {
			$timezone = get_option( 'gmt_offset' );
		}

		return [
			'value' => $timezone,
		];
	}

	public function get_admin_email() {
		return [
			'value' => get_option( 'admin_email' ),
		];
	}

	public function get_debug_mode() {
		return [
			'value' => WP_DEBUG ? 'Active' : 'Inactive',
		];
	}
}
