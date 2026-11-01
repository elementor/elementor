<?php

namespace Elementor\Modules\EditorOne;

use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Components\Sidebar_Navigation_Handler;
use Elementor\Modules\EditorOne\Components\Top_Bar_Handler;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Module extends BaseModule {

	const ADMIN_NAVIGATION_EXPERIMENT_NAME = 'e_admin_navigation';

	const CUSTOM_REACT_APP_PAGES = [
		'elementor-element-manager',
	];

	public function get_name(): string {
		return 'editor-one';
	}

	public static function get_admin_navigation_experimental_data(): array {
		return [
			'name' => self::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			'title' => esc_html__( 'Admin flow', 'elementor' ),
			'description' => esc_html__( 'Enable the admin flow.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_admin_navigation_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::ADMIN_NAVIGATION_EXPERIMENT_NAME );
	}

	private function register_admin_navigation_experiment(): void {
		Plugin::$instance->experiments->add_feature( self::get_admin_navigation_experimental_data() );
	}

	public function __construct() {
		parent::__construct();
		$this->register_admin_navigation_experiment();

		if ( is_admin() ) {
			$this->add_component( 'editor-one-menu-manager', new Elementor_One_Menu_Manager() );

			if ( ! self::is_admin_navigation_active() ) {
				$this->add_component( 'sidebar-navigation-handler', new Sidebar_Navigation_Handler() );
			}

			$this->add_component( 'top-bar-handler', new Top_Bar_Handler() );
		}

		add_action( 'current_screen', function () {
			$menu_data_provider = Menu_Data_Provider::instance();

			if ( ! $menu_data_provider->is_editor_one_admin_page() ) {
				return;
			}

			add_action( 'admin_enqueue_scripts', function () {
				$this->enqueue_styles();
			} );
		} );

		add_filter( 'elementor/admin-top-bar/is-active', function ( $_is_active ) {
			return false;
		} );
	}

	/**
	 * Check if current page has a custom React app that uses @elementor/ui
	 *
	 * @return bool
	 */
	private function is_custom_react_app_page() {
		$current_screen = get_current_screen();

		if ( ! $current_screen ) {
			return false;
		}

		foreach ( self::CUSTOM_REACT_APP_PAGES as $page_slug ) {
			if ( str_contains( $current_screen->id ?? '', $page_slug ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Enqueue admin styles
	 */
	private function enqueue_styles() {

		wp_enqueue_style( 'elementor-admin' );

		wp_enqueue_style(
			'elementor-editor-one-common',
			$this->get_css_assets_url( 'editor-one-common' ),
			[ 'elementor-admin' ],
			ELEMENTOR_VERSION
		);

		if ( ! $this->is_custom_react_app_page() ) {
			wp_enqueue_style(
				'elementor-editor-one-elements',
				$this->get_css_assets_url( 'editor-one-elements' ),
				[ 'elementor-editor-one-common' ],
				ELEMENTOR_VERSION
			);

			wp_enqueue_style(
				'elementor-editor-one-tables',
				$this->get_css_assets_url( 'editor-one-tables' ),
				[ 'elementor-editor-one-common' ],
				ELEMENTOR_VERSION
			);
		}

		wp_enqueue_script(
			'editor-one-admin',
			$this->get_js_assets_url( 'editor-one-admin' ),
			[ 'jquery' ],
			ELEMENTOR_VERSION,
			true
		);
	}
}
