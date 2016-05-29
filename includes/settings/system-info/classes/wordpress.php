<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class WordPress_Reporter extends Base_Reporter {

	public function get_title() {
		return __( 'WordPress Environment', 'elementor' );
	}

	public function get_fields() {
		return [
			'version' => __( 'Version', 'elementor' ),
			'site_url' => __( 'Site URL', 'elementor' ),
			'home_url' => __( 'Home URL', 'elementor' ),
			'is_multisite' => __( 'WP Multisite', 'elementor' ),
			'max_upload_size' => __( 'Max Upload Size', 'elementor' ),
			'memory_limit' => __( 'Memory limit', 'elementor' ),
			'permalink_structure' => __( 'Permalink Structure', 'elementor' ),
			'language' => __( 'Language', 'elementor' ),
			'timezone' => __( 'Timezone', 'elementor' ),
			'admin_email' => __( 'Admin Email', 'elementor' ),
			'debug_mode' => __( 'Debug Mode', 'elementor' ),
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
			'value' => is_multisite()? __( 'Yes', 'elementor' ) : __( 'No', 'elementor' ),
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
			'value' => WP_DEBUG ? __( 'Active', 'elementor' ) : __( 'Inactive', 'elementor' ),
		];
	}
}
