<?php

namespace Elementor\Modules\EditorOne;

use Elementor\Core\Admin\Admin;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Components\Elementor_One_Menu_Manager;
use Elementor\Modules\EditorOne\Components\Sidebar_Navigation_Handler;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_one';

	const CUSTOM_REACT_APP_PAGES = [
		'elementor-element-manager',
	];

	public function get_name(): string {
		return 'editor-one';
	}

	public static function get_experimental_data(): array {
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

		if ( is_admin() ) {
			$this->add_component( 'editor-one-menu-manager', new Elementor_One_Menu_Manager() );
			$this->add_component( 'sidebar-navigation-handler', new Sidebar_Navigation_Handler() );
		}

		add_action( 'current_screen', function () {
			if ( ! $this->is_feature_enabled() || ! Admin::is_elementor_admin_page() ) {
				return;
			}

			add_action( 'admin_enqueue_scripts', function () {
				$this->enqueue_styles();
			} );
		} );
	}

	/**
	 * Check if Editor One feature is enabled
	 *
	 * @return bool
	 */
	private function is_feature_enabled() {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
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
