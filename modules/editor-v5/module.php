<?php

namespace Elementor\Modules\EditorV5;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Editor\Loader\Editor_Scripts_Settings;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_editor_v5';

	const PACKAGES = [
		'editor-v5-store',
		'editor-v5-agent',
		'editor-v5-runtime',
		'editor-v5',
	];

	const LIBS = [
		'env',
		'http-client',
		'store',
		'ui',
		'utils',
		'query',
	];

	const V5_SCRIPT_HANDLES = [
		'elementor-v2-editor-v5-store',
		'elementor-v2-editor-v5-agent',
		'elementor-v2-editor-v5-runtime',
		'elementor-v2-editor-v5',
		'elementor-v2-env',
		'elementor-v2-http-client',
		'elementor-v2-store',
		'elementor-v2-ui',
		'elementor-v2-utils',
		'elementor-v2-query',
		'elementor-v2-editor-environment',
	];

	const LEGACY_SCRIPTS_TO_DEQUEUE = [
		'elementor-editor',
		'elementor-editor-loader',
		'elementor-responsive-bar',
		'elementor-v2-editor',
		'elementor-atomic-widgets-editor',
		'elementor-notes',
		'elementor-styleguide',
		'elementor-styleguide-app-initiator',
	];

	public function get_name() {
		return 'editor-v5';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor V5', 'elementor' ),
			'description' => esc_html__( 'Enable the Elementor Editor V5 proof of concept.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
		];
	}

	public static function is_active() {
		if ( self::is_forced_inactive_by_request() ) {
			return false;
		}

		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public static function should_use_v5() {
		if ( ! self::is_active() ) {
			return false;
		}

		return Atomic_Widgets_Module::is_active();
	}

	public function __construct() {
		parent::__construct();

		if ( ! Atomic_Widgets_Module::is_active() ) {
			return;
		}

		add_filter( 'elementor/editor/v2/packages', [ $this, 'filter_packages' ] );
		add_filter( 'elementor/editor/templates', [ $this, 'filter_templates' ] );
		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_editor_settings' ] );
		add_action( 'elementor/editor/init', [ $this, 'on_editor_init' ], 1 );
		add_action( 'elementor/editor/v2/scripts/enqueue/after', [ $this, 'on_scripts_enqueue_after' ], 999 );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'on_after_enqueue_scripts' ], PHP_INT_MAX );
		add_action( 'elementor/editor/v2/styles/enqueue', [ $this, 'on_styles_enqueue' ] );
	}

	public function filter_packages( $packages ) {
		if ( ! self::should_use_v5() ) {
			return $packages;
		}

		return self::PACKAGES;
	}

	public function localize_editor_settings( $settings ) {
		if ( ! self::should_use_v5() ) {
			return $settings;
		}

		$settings['editorV5'] = [
			'classicEditorUrl' => self::get_classic_editor_url(),
			'experimentSettingsUrl' => self::get_experiment_settings_url(),
		];

		return $settings;
	}

	public function filter_templates( $templates ) {
		if ( ! self::should_use_v5() ) {
			return $templates;
		}

		return [];
	}

	public function on_editor_init() {
		if ( ! self::should_use_v5() ) {
			return;
		}

		remove_action( 'wp_footer', [ Plugin::$instance->editor, 'wp_footer' ] );
		add_action( 'wp_footer', [ $this, 'print_minimal_footer' ], 30 );
	}

	public function print_minimal_footer() {
		do_action( 'elementor/editor/v5/footer' );
	}

	public function on_scripts_enqueue_after() {
		if ( ! self::should_use_v5() ) {
			return;
		}

		$this->apply_v5_script_swaps();
	}

	public function on_after_enqueue_scripts() {
		if ( ! self::should_use_v5() ) {
			return;
		}

		$this->dequeue_legacy_editor_scripts();
	}

	private function apply_v5_script_swaps() {
		$this->dequeue_legacy_editor_scripts();

		wp_enqueue_script( 'elementor-common' );
		wp_enqueue_script( 'heartbeat' );
		wp_enqueue_script( 'wp-auth-check' );

		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_register_script(
			'elementor-editor-v5-loader',
			"{$assets_url}js/editor-v5-loader{$min_suffix}.js",
			[ 'elementor-v2-editor-v5' ],
			ELEMENTOR_VERSION,
			true
		);

		Utils::print_js_config(
			'elementor-v2-editor-v5',
			'ElementorConfig',
			Editor_Scripts_Settings::get()
		);

		wp_enqueue_script( 'elementor-editor-v5-loader' );
	}

	private function dequeue_legacy_editor_scripts() {
		foreach ( self::LEGACY_SCRIPTS_TO_DEQUEUE as $handle ) {
			wp_dequeue_script( $handle );
		}

		$this->dequeue_scripts_with_dependency( 'elementor-editor' );
		$this->dequeue_non_v5_extension_scripts();
		$this->dequeue_scripts_depending_on_non_v5_v2_packages();
	}

	private function dequeue_scripts_with_dependency( $dependency_handle ) {
		global $wp_scripts;

		if ( ! $wp_scripts instanceof \WP_Scripts ) {
			return;
		}

		foreach ( $wp_scripts->queue as $handle ) {
			$script = $wp_scripts->registered[ $handle ] ?? null;

			if ( ! $script || empty( $script->deps ) ) {
				continue;
			}

			if ( in_array( $dependency_handle, $script->deps, true ) ) {
				wp_dequeue_script( $handle );
			}
		}
	}

	public function on_styles_enqueue() {
		if ( ! self::should_use_v5() ) {
			return;
		}

		wp_dequeue_style( 'elementor-responsive-bar' );
	}

	public static function get_classic_editor_url( $post_id = null ) {
		$post_id = $post_id ?? Plugin::$instance->editor->get_post_id();
		$url = get_edit_post_link( $post_id, 'raw' );

		if ( ! $url ) {
			return self::get_experiment_settings_url();
		}

		return add_query_arg( self::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE, $url );
	}

	public static function get_experiment_settings_url() {
		return admin_url( 'admin.php?page=elementor-settings#tab-experiments' );
	}

	private function dequeue_non_v5_extension_scripts() {
		global $wp_scripts;

		if ( ! $wp_scripts instanceof \WP_Scripts ) {
			return;
		}

		$v5_handles = array_flip( self::V5_SCRIPT_HANDLES );

		foreach ( $wp_scripts->queue as $handle ) {
			if ( ! str_starts_with( $handle, 'elementor-v2-' ) ) {
				continue;
			}

			if ( isset( $v5_handles[ $handle ] ) ) {
				continue;
			}

			wp_dequeue_script( $handle );
		}
	}

	private function dequeue_scripts_depending_on_non_v5_v2_packages() {
		global $wp_scripts;

		if ( ! $wp_scripts instanceof \WP_Scripts ) {
			return;
		}

		$v5_handles = array_flip( self::V5_SCRIPT_HANDLES );

		foreach ( $wp_scripts->queue as $handle ) {
			$script = $wp_scripts->registered[ $handle ] ?? null;

			if ( ! $script || empty( $script->deps ) ) {
				continue;
			}

			foreach ( $script->deps as $dependency ) {
				if ( ! str_starts_with( $dependency, 'elementor-v2-' ) ) {
					continue;
				}

				if ( isset( $v5_handles[ $dependency ] ) ) {
					continue;
				}

				wp_dequeue_script( $handle );
				break;
			}
		}
	}

	private static function is_forced_inactive_by_request() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET[ self::EXPERIMENT_NAME ] ) ) {
			return false;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return Experiments_Manager::STATE_INACTIVE === $_GET[ self::EXPERIMENT_NAME ];
	}
}
