<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Compatibility {

	public static function register_actions() {
		add_action( 'init', [ __CLASS__, 'init' ] );

		if ( is_admin() ) {
			add_filter( 'wp_import_post_meta', [ __CLASS__, 'on_wp_import_post_meta' ] );
			add_filter( 'wxr_importer.pre_process.post_meta', [ __CLASS__, 'on_wxr_importer_pre_process_post_meta' ] );
		}
	}

	public static function init() {
		// Hotfix for NextGEN Gallery plugin
		if ( defined( 'NGG_PLUGIN_VERSION' ) ) {
			add_filter( 'elementor/utils/get_edit_link', function( $edit_link ) {
				return add_query_arg( 'display_gallery_iframe', '', $edit_link );
			} );
		}

		// Hack for Ninja Forms
		if ( class_exists( '\Ninja_Forms' ) && class_exists( '\NF_Display_Render' ) ) {
			add_action( 'elementor/preview/enqueue_styles', function() {
				ob_start();

				\NF_Display_Render::localize( 0 );

				ob_clean();

				wp_add_inline_script( 'nf-front-end', 'var nfForms = nfForms || [];' );
			} );
		}

		// Exclude our Library from sitemap.xml in Yoast SEO plugin
		add_filter( 'wpseo_sitemaps_supported_post_types', function( $post_types ) {
			unset( $post_types[ TemplateLibrary\Source_Local::CPT ] );

			return $post_types;
		} );

		add_filter( 'wpseo_sitemap_exclude_post_type', function( $retval, $post_type ) {
			if ( TemplateLibrary\Source_Local::CPT === $post_type ) {
				$retval = true;
			}

			return $retval;
		}, 10, 2 );

		// Disable optimize files in Editor from Autoptimize plugin
		add_filter( 'autoptimize_filter_noptimize', function( $retval ) {
			if ( Plugin::$instance->editor->is_edit_mode() ) {
				$retval = true;
			}

			return $retval;
		} );

		// Add the description (content) tab for a new product, so it can be edited with Elementor
		add_filter( 'woocommerce_product_tabs', function( $tabs ) {
			if ( ! isset( $tabs['description'] ) && Plugin::$instance->preview->is_preview_mode() ) {
				$post = get_post();
				if ( empty( $post->post_content ) ) {
					$tabs['description'] = [
						'title' => __( 'Description', 'elementor' ),
						'priority' => 10,
						'callback' => 'woocommerce_product_description_tab',
					];
				}
			}

			return $tabs;
		} );
	}

	/**
	 * Normalize Elementor post meta on import,
	 * We need the `wp_slash` in order to avoid the unslashing during the `add_post_meta`
	 *
	 * @param array $post_meta
	 *
	 * @return array
	 */
	public static function on_wp_import_post_meta( $post_meta ) {
		foreach ( $post_meta as &$meta ) {
			if ( '_elementor_data' === $meta['key'] ) {
				$meta['value'] = wp_slash( $meta['value'] );
				break;
			}
		}

		return $post_meta;
	}

	/**
	 * Normalize Elementor post meta on import with the new WP_importer,
	 * We need the `wp_slash` in order to avoid the unslashing during the `add_post_meta`
	 *
	 * @param array $post_meta
	 *
	 * @return array
	 */

	public static function on_wxr_importer_pre_process_post_meta( $post_meta ) {
		if ( '_elementor_data' === $post_meta['key'] ) {
			$post_meta['value'] = wp_slash( $post_meta['value'] );
		}

		return $post_meta;
	}
}

Compatibility::register_actions();
