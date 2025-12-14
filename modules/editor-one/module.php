<?php

namespace Elementor\Modules\EditorOne;

use Elementor\Core\Admin\Menu\Elementor_One_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_one';

	public function get_name() {
		return 'editor-one';
	}

	public static function get_experimental_data() {
		return [
			'name'           => static::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Editor one', 'elementor' ),
			'description'    => esc_html__( 'General', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
	}

	private function is_experiment_active() {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	public function enqueue_assets() {
		if ( ! $this->is_experiment_active() ) {
			return;
		}

		$menu_manager = Plugin::$instance->elementor_one_menu_manager;

		if ( ! $menu_manager ) {
			return;
		}

		wp_enqueue_script(
			'elementor-editor-one-admin-menu',
			$this->get_js_assets_url( 'elementor-editor-one-admin-menu' ),
			[],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_style(
			'elementor-editor-one-admin-menu',
			$this->get_css_assets_url( 'admin-menu', 'modules/editor-one/' ),
			[],
			ELEMENTOR_VERSION
		);

		$menu_config = $this->get_menu_config( $menu_manager );

		wp_localize_script(
			'elementor-editor-one-admin-menu',
			'elementorAdminMenuConfig',
			$menu_config
		);
	}

	private function get_menu_config( Elementor_One_Menu_Manager $menu_manager ) {
		$config = [
			'menuItems' => [],
		];

		$editor_items = $menu_manager->get_all_editor_items();
		$flyout_items = $menu_manager->get_all_flyout_items();

		foreach ( $editor_items as $slug => $item ) {
			$children = [];

			foreach ( $flyout_items as $flyout_slug => $flyout_item ) {
				if ( $flyout_item->get_parent_slug() === $slug ) {
					$children[] = [
						'slug' => $flyout_slug,
						'label' => $flyout_item->get_label(),
						'url' => $this->get_menu_item_url( $flyout_slug, $flyout_item->get_parent_slug() ),
					];
				}
			}

			if ( ! empty( $children ) ) {
				$config['menuItems'][] = [
					'slug' => $slug,
					'label' => $item->get_label(),
					'parentSlug' => Elementor_One_Menu_Manager::ROOT_MENU_SLUG,
					'type' => 'flyout',
					'children' => $children,
				];
			}
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'Editor One Menu Config: ' . print_r( $config, true ) );
		}

		return $config;
	}

	private function get_menu_item_url( $slug, $parent_slug ) {
		if ( $this->is_url( $slug ) ) {
			return $slug;
		}

		global $submenu;

		if ( ! isset( $submenu[ $parent_slug ] ) ) {
			return admin_url( 'admin.php?page=' . $slug );
		}

		foreach ( $submenu[ $parent_slug ] as $item ) {
			if ( isset( $item[2] ) && $item[2] === $slug ) {
				if ( $this->is_url( $item[2] ) ) {
					return $item[2];
				}
				return admin_url( 'admin.php?page=' . $slug );
			}
		}

		return admin_url( 'admin.php?page=' . $slug );
	}

	private function is_url( $slug ) {
		if ( empty( $slug ) ) {
			return false;
		}

		return strpos( $slug, 'http' ) === 0 || strpos( $slug, 'admin.php' ) !== false || strpos( $slug, '#' ) !== false;
	}
}
