<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sidebar_Navigation_Handler {

	private const HOME_SLUG = 'elementor-home';
	private const PROMOTION_URL = 'https://go.elementor.com/wp-dash-sidebar-upgrade/';

	private Menu_Data_Provider $menu_data_provider;

	public function __construct() {
		$this->menu_data_provider = Menu_Data_Provider::instance();
		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_sidebar_assets' ] );
		add_action( 'in_admin_header', [ $this, 'render_sidebar_container' ] );
		add_filter( 'admin_body_class', [ $this, 'add_body_class' ] );
	}

	public function add_body_class( string $classes ): string {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return $classes;
		}

		return $classes . ' e-has-sidebar-navigation';
	}

	public function enqueue_sidebar_assets(): void {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-sidebar-navigation',
			ELEMENTOR_ASSETS_URL . 'css/modules/editor-one/sidebar-navigation' . $min_suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'e-sidebar-navigation',
			ELEMENTOR_ASSETS_URL . 'js/e-sidebar-navigation' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'e-sidebar-navigation',
			'elementorSidebarConfig',
			$this->get_sidebar_config()
		);

		wp_set_script_translations( 'e-sidebar-navigation', 'elementor' );
	}

	public function render_sidebar_container(): void {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return;
		}

		echo '<div id="e-editor-sidebar-navigation"></div>';
	}

	private function get_sidebar_config(): array {
		$flyout_data = $this->menu_data_provider->get_editor_flyout_data();
		$level4_groups = $this->menu_data_provider->get_level4_flyout_data();
		$promotion = $this->get_promotion_data();
		$active_state = $this->get_active_menu_state( $flyout_data['items'], $level4_groups );

		return [
			'menuItems' => $flyout_data['items'],
			'level4Groups' => $level4_groups,
			'activeMenuSlug' => $active_state['menu_slug'],
			'activeChildSlug' => $active_state['child_slug'],
			'isRTL' => is_rtl(),
			'siteTitle' => esc_html__( 'Editor', 'elementor' ),
			'hasPro' => Utils::has_pro(),
			'upgradeUrl' => $promotion['url'],
			'upgradeText' => $promotion['text'],
		];
	}

	private function get_promotion_data(): array {
		return Filtered_Promotions_Manager::get_filtered_promotion_data(
			[
				'text' => esc_html__( 'Upgrade plan', 'elementor' ),
				'url' => self::PROMOTION_URL,
			],
			'elementor/sidebar/promotion',
			'url'
		);
	}

	private function get_active_menu_state( array $menu_items, array $level4_groups ): array {
		$current_page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		if ( Menu_Config::EDITOR_MENU_SLUG === $current_page ) {
			return $this->create_active_state( self::HOME_SLUG );
		}

		$pro_post_type_match = $this->get_pro_post_type_active_state();

		if ( $pro_post_type_match ) {
			return $pro_post_type_match;
		}

		return $this->find_best_matching_menu_item( $menu_items, $level4_groups );
	}

	private function find_best_matching_menu_item( array $menu_items, array $level4_groups ): array {
		$current_uri = wp_unslash( $_SERVER['REQUEST_URI'] ?? '' );
		$best_match = $this->create_active_state( '', '', -1 );

		foreach ( $menu_items as $item ) {
			$best_match = $this->update_best_match_from_level4(
				$item,
				$level4_groups,
				$current_uri,
				$best_match
			);

			$score = $this->get_url_match_score( $item['url'], $current_uri );

			if ( $score > $best_match['score'] ) {
				$best_match = $this->create_active_state( $item['slug'], '', $score );
			}
		}

		return $this->create_active_state( $best_match['menu_slug'], $best_match['child_slug'] );
	}

	private function update_best_match_from_level4(
		array $item,
		array $level4_groups,
		string $current_uri,
		array $best_match
	): array {
		if ( empty( $item['group_id'] ) || ! isset( $level4_groups[ $item['group_id'] ] ) ) {
			return $best_match;
		}

		$group = $level4_groups[ $item['group_id'] ];

		if ( empty( $group['items'] ) ) {
			return $best_match;
		}

		foreach ( $group['items'] as $child_item ) {
			$score = $this->get_url_match_score( $child_item['url'], $current_uri );

			if ( $score > $best_match['score'] ) {
				$best_match = $this->create_active_state( $item['slug'], $child_item['slug'], $score );
			}
		}

		return $best_match;
	}

	private function create_active_state( string $menu_slug, string $child_slug = '', int $score = 0 ): array {
		return [
			'menu_slug' => $menu_slug,
			'child_slug' => $child_slug,
			'score' => $score,
		];
	}

	private function get_url_match_score( string $menu_url, string $current_uri ): int {
		$menu_parsed = wp_parse_url( $menu_url );

		if ( empty( $menu_parsed['path'] ) ) {
			return -1;
		}

		$current_parsed = wp_parse_url( $current_uri );

		if ( empty( $current_parsed['path'] ) ) {
			return -1;
		}

		if ( basename( $menu_parsed['path'] ) !== basename( $current_parsed['path'] ) ) {
			return -1;
		}

		$menu_query = $this->parse_query_string( $menu_parsed['query'] ?? '' );
		$current_query = $this->parse_query_string( $current_parsed['query'] ?? '' );

		if ( ! $this->query_params_match( $menu_query, $current_query ) ) {
			return -1;
		}

		return count( $menu_query );
	}

	private function parse_query_string( string $query ): array {
		$params = [];

		if ( '' !== $query ) {
			parse_str( $query, $params );
		}

		return $params;
	}

	private function query_params_match( array $required, array $actual ): bool {
		foreach ( $required as $key => $value ) {
			if ( ! isset( $actual[ $key ] ) || $actual[ $key ] !== $value ) {
				return false;
			}
		}

		return true;
	}

	private function get_pro_post_type_active_state(): ?array {
		$current_post_type = filter_input( INPUT_GET, 'post_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		if ( empty( $current_post_type ) ) {
			return null;
		}

		return Menu_Data_Provider::get_elementor_post_types()[ $current_post_type ] ?? null;
	}
}
