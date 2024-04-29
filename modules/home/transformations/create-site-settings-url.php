<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Create_Site_Settings_Url extends Base\Transformations_Abstract {

	const URL_TYPE = 'site_settings';

	const SITE_SETTINGS_ITEMS = [ 'Site Settings', 'Site Logo', 'Global Colors', 'Global Fonts' ];

	public function transform( array $home_screen_data ): array {
		if ( empty( $home_screen_data['get_started'] ) ) {
			return $home_screen_data;
		}

		$site_settings_url_config = $this->get_site_settings_url_config();

		$home_screen_data['get_started']['repeater'] = array_map( function( $repeater_item ) use ( $site_settings_url_config ) {
			if ( ! in_array( $repeater_item['title'], static::SITE_SETTINGS_ITEMS, true ) ) {
				return $repeater_item;
			}

			if ( ! empty( $repeater_item['tab_id'] ) ) {
				$site_settings_url_config['url'] = add_query_arg( [ 'active-tab' => $repeater_item['tab_id'] ], $site_settings_url_config['url'] );
			}

			return array_merge( $repeater_item, $site_settings_url_config );
		}, $home_screen_data['get_started']['repeater'] );

		return $home_screen_data;
	}

	private function get_site_settings_url_config(): array {
		$existing_elementor_page = $this->get_elementor_page();
		$site_settings_url = ! empty( $existing_elementor_page )
			? $this->get_elementor_edit_url( $existing_elementor_page->ID )
			: $this->get_elementor_create_new_page_url();

		return [
			'new_page' => empty( $existing_elementor_page ),
			'url' => $site_settings_url,
			'type' => static::URL_TYPE,
		];
	}

	private function get_elementor_create_new_page_url(): string {
		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();

		if ( empty( $active_kit_id ) ) {
			return Plugin::$instance->documents->get_create_new_post_url( 'page' );
		}

		return add_query_arg( [ 'active-document' => $active_kit_id ], Plugin::$instance->documents->get_create_new_post_url( 'page' ) );
	}

	private function get_elementor_edit_url( int $post_id ): string {
		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return '';
		}

		return add_query_arg( [ 'active-document' => $active_kit_id ], $document->get_edit_url() );
	}

	private function get_elementor_page() {
		$args = [
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'sort_order' => 'asc',
			'sort_column' => 'post_date',
		];
		$pages = get_pages( $args );

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
