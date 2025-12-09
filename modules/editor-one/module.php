<?php

namespace Elementor\Modules\EditorOne;

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

	/**
	 * Check if Editor One feature is enabled
	 *
	 * @return bool
	 */
	private function is_feature_enabled() {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	/**
	 * Check if current page is an Elementor admin page
	 *
	 * @return bool
	 */
	private function is_elementor_admin_page() {
		$current_screen = get_current_screen();

		if ( ! $current_screen ) {
			return false;
		}

		$is_elementor_page = strpos( $current_screen->id ?? '', 'elementor' ) !== false;
		$is_elementor_post_type_page = strpos( $current_screen->post_type ?? '', 'elementor' ) !== false;

		return $is_elementor_page || $is_elementor_post_type_page;
	}

	/**
	 * Enqueue admin styles
	 */
	private function enqueue_styles() {
		wp_enqueue_style( 'elementor-admin' );

		wp_enqueue_style(
			'elementor-editor-one-admin',
			$this->get_css_assets_url( 'editor-one' ),
			[ 'elementor-admin' ],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'elementor-editor-one-admin',
			$this->get_js_assets_url( 'admin' ),
			[ 'jquery' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_action( 'current_screen', function () {
			if ( ! $this->is_feature_enabled() || ! $this->is_elementor_admin_page() ) {
				return;
			}

			add_action( 'admin_enqueue_scripts', function () {
				$this->enqueue_styles();
			} );
		} );
	}
}
