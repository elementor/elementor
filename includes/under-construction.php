<?php

namespace Elementor;

use Elementor\TemplateLibrary\Source_Local;

class Under_Construction {

	const OPTION_PREFIX = 'elementor_under_construction_';

	public static function get( $option, $default = false ) {
		return get_option( self::OPTION_PREFIX . $option, $default );
	}

	public static function set( $option, $value ) {
		return update_option( self::OPTION_PREFIX . $option, $value );
	}

	public function template_redirect() {
		query_posts( [
			'post__in' => [ self::get( 'template_id' ) ],
			'post_type' => Source_Local::CPT,
		] );
	}

	public function template_include() {
		if ( 'maintenance' === self::get( 'mode' ) ) {
			$protocol = wp_get_server_protocol();
			header( "$protocol 503 Service Unavailable", true, 503 );
			header( 'Content-Type: text/html; charset=utf-8' );
			header( 'Retry-After: 600' );
		}

		return ELEMENTOR_PATH . '/includes/templates/empty.php';
	}

	public function __construct() {
		if ( self::get( 'enabled' ) ) {
			$user = wp_get_current_user();
			$exclude_roles = self::get( 'exclude_roles', [] );

			$compare_roles = array_intersect( $user->roles, $exclude_roles );
			if ( ! empty( $compare_roles ) ) {
				return;
			}

			add_action( 'template_redirect', [ $this, 'template_redirect' ] );
			add_filter( 'template_include', [ $this, 'template_include' ] );
		}
	}
}
