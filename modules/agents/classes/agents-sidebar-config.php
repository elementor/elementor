<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Modules\Agents\AdminMenuItems\Editor_One_Agent_Access_Menu;
use Elementor\Modules\Agents\AdminMenuItems\Editor_One_Agents_Ready_Menu;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Agents_Sidebar_Config {

	const SIDEBAR_CONFIG_FILTER = 'elementor/editor-one/sidebar/config';

	const EXCLUDED_LEVEL3_SLUGS_FILTER = 'elementor/editor-one/menu/excluded_level3_slugs';

	const FILTER_PRIORITY = 10;

	const FILTER_ACCEPTED_ARGS = 1;

	public function register(): void {
		add_filter( self::EXCLUDED_LEVEL3_SLUGS_FILTER, [ $this, 'exclude_from_editor_sidebar' ], self::FILTER_PRIORITY, self::FILTER_ACCEPTED_ARGS );
		add_filter( self::SIDEBAR_CONFIG_FILTER, [ $this, 'filter_sidebar_config' ], self::FILTER_PRIORITY, self::FILTER_ACCEPTED_ARGS );
	}

	public function exclude_from_editor_sidebar( array $slugs ): array {
		return array_merge( $slugs, self::get_page_slugs() );
	}

	public function filter_sidebar_config( array $config ): array {
		$current_page = $this->get_current_page();

		if ( ! in_array( $current_page, self::get_page_slugs(), true ) ) {
			return $config;
		}

		$config['menuItems']       = $this->get_menu_items();
		$config['level4Groups']    = [];
		$config['activeMenuSlug']  = $current_page;
		$config['activeChildSlug'] = '';
		$config['isMinimal']       = true;

		return $config;
	}

	private static function get_page_slugs(): array {
		return [ Module::PAGE_ID, Module::AGENT_ACCESS_PAGE_ID ];
	}

	private function get_current_page(): string {
		return filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';
	}

	private function get_menu_items(): array {
		$items = [];

		foreach ( [ new Editor_One_Agents_Ready_Menu(), new Editor_One_Agent_Access_Menu() ] as $menu_item ) {
			if ( ! Menu_Data_Provider::instance()->is_item_accessible( $menu_item ) ) {
				continue;
			}

			$slug = $menu_item->get_slug();

			$items[] = [
				'slug'               => $slug,
				'label'              => $menu_item->get_label(),
				'url'                => admin_url( 'admin.php?page=' . $slug ),
				'icon'               => $menu_item->get_icon(),
				'group_id'           => '',
				'priority'           => $menu_item->get_position(),
				'has_divider_before' => false,
				'event_id'           => str_replace( '-', '_', preg_replace( '/^elementor-/', '', $slug ) ),
			];
		}

		return $items;
	}
}
