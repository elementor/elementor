<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Compatibility {

	public static function register_actions() {
		add_action( 'init', [ __CLASS__, 'init' ] );
	}

	public static function init() {
		// Hotfix for NextGEN Gallery plugin
		if ( defined( 'NGG_PLUGIN_VERSION' ) ) {
			add_filter( 'elementor/utils/get_edit_link', function( $edit_link ) {
				return add_query_arg( 'display_gallery_iframe', '', $edit_link );
			} );
		}
	}
}

Compatibility::register_actions();
