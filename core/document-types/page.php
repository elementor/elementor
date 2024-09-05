<?php
namespace Elementor\Core\DocumentTypes;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Page extends PageBase {

	const URL_TYPE = 'site_settings';

	const SITE_IDENTITY_TAB = 'settings-site-identity';

	/**
	 * Get Properties
	 *
	 * Return the page document configuration properties.
	 *
	 * @access public
	 * @static
	 *
	 * @return array
	 */
	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['cpt'] = [ 'page' ];
		$properties['support_kit'] = true;

		return $properties;
	}

	/**
	 * Get Type
	 *
	 * Return the page document type.
	 *
	 * @return string
	 */
	public static function get_type() {
		return 'wp-page';
	}

	/**
	 * Get Title
	 *
	 * Return the page document title.
	 *
	 * @access public
	 * @static
	 *
	 * @return string
	 */
	public static function get_title() {
		return esc_html__( 'Page', 'elementor' );
	}

	/**
	 * Get Plural Title
	 *
	 * Return the page document plural title.
	 *
	 * @access public
	 * @static
	 *
	 * @return string
	 */
	public static function get_plural_title() {
		return esc_html__( 'Pages', 'elementor' );
	}

	public static function get_site_settings_url_config( $return_string ) {
		$existing_elementor_page = self::get_elementor_page();
		$site_settings_url = ! empty( $existing_elementor_page )
			? self::get_elementor_edit_url( $existing_elementor_page->ID )
			: self::get_elementor_create_new_page_url( $return_string ? self::SITE_IDENTITY_TAB : null);

		if  ( $return_string ) {
			return $site_settings_url;
		}

		return [
			'new_page' => empty( $existing_elementor_page ),
			'url' => $site_settings_url,
			'type' => static::URL_TYPE,
		];
	}

	public static function get_elementor_create_new_page_url( $active_tab = null ): string {
		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();

		if ( empty( $active_kit_id ) ) {
			return Plugin::$instance->documents->get_create_new_post_url( 'page' );
		}

		$args = [
			'active-document' => $active_kit_id,
			'active-tab' => $active_tab,
		];

		return add_query_arg( $args, Plugin::$instance->documents->get_create_new_post_url( 'page' ) );
	}

	private static function get_elementor_edit_url( int $post_id ): string {
		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();
		$document = Plugin::$instance->documents->get( $post_id ) ?? null;

		if ( ! $document ) {
			return '';
		}

		return add_query_arg( [ 'active-document' => $active_kit_id ], $document->get_edit_url() );
	}

	private static function get_elementor_page() {
		$args = [
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'sort_order' => 'asc',
			'sort_column' => 'post_date',
		];
		$query_string = http_build_query( $args );
		$pages = get_pages( $query_string );

		if ( empty( $pages ) ) {
			return null;
		}

		$show_page_on_front = 'page' === get_option( 'show_on_front' );

		if ( ! $show_page_on_front ) {
			return $pages[0];
		}

		$home_page_id = get_option( 'page_on_front' );

		foreach ( $pages as $page ) {
			if ( (string) $page->ID === $home_page_id ) {
				return $page;
			}
		}

		return $pages[0];
	}
}
