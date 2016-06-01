<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class WordPress_Reporter extends Base_Reporter {

	public function get_title() {
		return _x( 'WordPress Environment', 'System Info', 'elementor' );
	}

	public function get_fields() {
		return [
			'version' => _x( 'Version', 'System Info', 'elementor' ),
			'site_url' => _x( 'Site URL', 'System Info', 'elementor' ),
			'home_url' => _x( 'Home URL', 'System Info', 'elementor' ),
			'is_multisite' => _x( 'WP Multisite', 'System Info', 'elementor' ),
			'max_upload_size' => _x( 'Max Upload Size', 'System Info', 'elementor' ),
			'memory_limit' => _x( 'Memory limit', 'System Info', 'elementor' ),
			'permalink_structure' => _x( 'Permalink Structure', 'System Info', 'elementor' ),
			'language' => _x( 'Language', 'System Info', 'elementor' ),
			'timezone' => _x( 'Timezone', 'System Info', 'elementor' ),
			'admin_email' => _x( 'Admin Email', 'System Info', 'elementor' ),
			'debug_mode' => _x( 'Debug Mode', 'System Info', 'elementor' ),
		];
	}

	public function get_memory_limit() {
		return [
			'value' => WP_MEMORY_LIMIT,
		];
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

		return [
			'value' => $wp_rewrite->permalink_structure,
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
