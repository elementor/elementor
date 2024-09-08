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

	public static function get_site_settings_url_config( $should_return_string_format ) {
		$existing_elementor_page = self::get_elementor_page();
		$site_settings_url = ! empty( $existing_elementor_page )
			? self::get_elementor_edit_url( $existing_elementor_page->ID )
			: self::get_elementor_create_new_page_url( $should_return_string_format ? self::SITE_IDENTITY_TAB : null );

		if ( $should_return_string_format ) {
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
		$args = [
			'active-document' => $active_kit_id,
			'action' => 'elementor',
			'post' => $post_id,
		];

		return add_query_arg( $args, get_admin_url() . 'post.php' );
	}

	private static function get_elementor_page() {
		if ( 'page' === get_option( 'show_on_front' ) ) {
			$home_page_id = get_option( 'page_on_front' );

			return get_post( $home_page_id ) ?? null;
		}

		$pages = get_pages( [
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'sort_order' => 'asc',
			'sort_column' => 'post_date',
			'number' => 1,
		] );

		return $pages[0] ?? null;
	}
}
