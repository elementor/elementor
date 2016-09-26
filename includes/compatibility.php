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

		// Hack for Ninja Forms
		if ( class_exists( '\Ninja_Forms' ) ) {
			add_action( 'elementor/preview/enqueue_styles', function() {
				ob_start();

				\NF_Display_Render::localize( 0 );

				ob_clean();

				wp_add_inline_script( 'nf-front-end', 'var nfForms = nfForms || [];' );
			} );
		}
	}
}

Compatibility::register_actions();
