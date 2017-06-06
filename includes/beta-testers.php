<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Beta_Testers {

	private $transient_key;

	private function get_beta_version() {
		$beta_version = get_site_transient( $this->transient_key );

		if ( false === $beta_version ) {
			$beta_version = 'false';

			$response = wp_remote_get( 'https://plugins.svn.wordpress.org/elementor/trunk/readme.txt' );

			if ( ! is_wp_error( $response ) && ! empty( $response['body'] ) ) {
				preg_match( '/Beta tag: (.*)/i', $response['body'], $matches );
				if ( isset( $matches[1] ) ) {
					$beta_version = $matches[1];
				}
			}

			set_site_transient( $this->transient_key, $beta_version, 6 * HOUR_IN_SECONDS );
		}

		return $beta_version;
	}

	public function check_version( $transient ) {
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		delete_site_transient( $this->transient_key );

		$plugin_slug = basename( ELEMENTOR__FILE__, '.php' );

		$beta_version = $this->get_beta_version();
		if ( 'false' !== $beta_version && version_compare( $beta_version, ELEMENTOR_VERSION, '>' ) ) {
			$response = new \stdClass();
			$response->plugin = $plugin_slug;
			$response->slug = $plugin_slug;
			$response->new_version = $beta_version;
			$response->url = 'https://elementor.com/';
			$response->package = sprintf( 'https://downloads.wordpress.org/plugin/elementor.%s.zip', $beta_version );

			$transient->response[ ELEMENTOR_PLUGIN_BASE ] = $response;
		}

		return $transient;
	}

	public function __construct() {
		if ( 'yes' !== get_option( 'elementor_beta', 'no' ) ) {
			return;
		}

		$this->transient_key = md5( 'elementor_beta_testers_response_key' );

		add_filter( 'pre_set_site_transient_update_plugins', [ $this, 'check_version' ] );
	}
}
