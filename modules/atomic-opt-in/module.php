<?php

namespace Elementor\Modules\AtomicOptIn;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;

use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Utils;

class Module extends BaseModule {
	const MODULE_NAME = 'editor-v4-opt-in';
	const EXPERIMENT_NAME = 'editor_v4_opt_in';

	public function get_name() {
		return 'atomic-opt-in';
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor V4 (Opt In)', 'elementor' ),
			'description' => esc_html__( 'Enable Editor V4 Opt In.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	private function is_experiment_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function __construct() {
		if ( ! $this->is_experiment_active() || ! is_admin() ) {
			return;
		}

		$this->register_assets();
		$this->add_settings_tab();
	}

	private function add_settings_tab() {
		$page_id = Settings::PAGE_ID;

		add_action( "elementor/admin/after_create_settings/{$page_id}", function( Settings $settings ) {
			$this->add_new_tab_to( $settings );
		}, 11 );
	}

	private function add_new_tab_to( Settings $settings ) {
		$settings->add_tab( self::MODULE_NAME, [
			'label' => esc_html__( 'Editor V4', 'elementor' ),
			'sections' => [
				'opt-in' => [
					'callback' => function() {
						echo '<div id="page-editor-v4-opt-in"></div>';
					},
					'fields' => [],
				],
			],
		] );

		return $this;
	}

	private function register_assets() {
		add_action( 'elementor_page_elementor-settings', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor_page_elementor-settings', [ $this, 'enqueue_styles' ] );
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			self::MODULE_NAME,
			$this->get_css_assets_url( 'modules/editor-v4-opt-in/opt-in' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_scripts() {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			self::MODULE_NAME,
			ELEMENTOR_ASSETS_URL . 'js/editor-v4-opt-in' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			self::MODULE_NAME,
			'elementorSettingsEditor4OptIn',
			$this->prepare_data()
		);
	}

	private function prepare_data() {
		$is_editor_v4_enabled = Plugin::$instance->experiments->is_feature_active( 'editor_v4' );

		return [
			'features' => [
				'editor_v4' => $is_editor_v4_enabled,
			],
		];
	}
}
