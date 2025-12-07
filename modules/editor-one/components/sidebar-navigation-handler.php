<?php
declare( strict_types = 1 );

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sidebar_Navigation_Handler {

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
			ELEMENTOR_URL . 'modules/editor-one/assets/css/sidebar-navigation.css',
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
				'url' => 'https://go.elementor.com/wp-dash-sidebar-upgrade/',
			],
			'elementor/sidebar/promotion',
			'url'
		);
	}

	private function get_active_menu_state( array $menu_items, array $level4_groups ): array {
		$current_url = $this->get_current_url();
		$best_match = [
			'menu_slug' => '',
			'child_slug' => '',
			'score' => -1,
		];

		foreach ( $menu_items as $item ) {
			if ( ! empty( $item['group_id'] ) && isset( $level4_groups[ $item['group_id'] ] ) ) {
				$group = $level4_groups[ $item['group_id'] ];

				if ( ! empty( $group['items'] ) ) {
					foreach ( $group['items'] as $child_item ) {
						$score = $this->get_url_match_score( $child_item['url'], $current_url );

						if ( $score > $best_match['score'] ) {
							$best_match = [
								'menu_slug' => $item['slug'],
								'child_slug' => $child_item['slug'],
								'score' => $score,
							];
						}
					}
				}
			}

			$score = $this->get_url_match_score( $item['url'], $current_url );

			if ( $score > $best_match['score'] ) {
				$best_match = [
					'menu_slug' => $item['slug'],
					'child_slug' => '',
					'score' => $score,
				];
			}
		}

		return [
			'menu_slug' => $best_match['menu_slug'],
			'child_slug' => $best_match['child_slug'],
		];
	}

	private function get_url_match_score( string $menu_url, string $current_url ): int {
		$menu_parsed = wp_parse_url( $menu_url );
		$current_parsed = wp_parse_url( $current_url );

		if ( empty( $menu_parsed['path'] ) || empty( $current_parsed['path'] ) ) {
			return -1;
		}

		$menu_path = basename( $menu_parsed['path'] );
		$current_path = basename( $current_parsed['path'] );

		if ( $menu_path !== $current_path ) {
			return -1;
		}

		$menu_query = [];
		$current_query = [];

		if ( ! empty( $menu_parsed['query'] ) ) {
			parse_str( $menu_parsed['query'], $menu_query );
		}

		if ( ! empty( $current_parsed['query'] ) ) {
			parse_str( $current_parsed['query'], $current_query );
		}

		foreach ( $menu_query as $key => $value ) {
			if ( ! isset( $current_query[ $key ] ) || $current_query[ $key ] !== $value ) {
				return -1;
			}
		}

		return count( $menu_query );
	}

	private function get_current_url(): string {
		$protocol = is_ssl() ? 'https://' : 'http://';
		$host = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

		return $protocol . $host . $uri;
	}
}
