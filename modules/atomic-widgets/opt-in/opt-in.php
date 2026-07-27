<?php

namespace Elementor\Modules\AtomicWidgets\OptIn;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\GlobalClasses\Module as GlobalClassesModule;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;

class Opt_In {
	const EXPERIMENT_NAME = 'e_opt_in_v4';

	// Variables, Variables Manager, Components and Interactions are merged into Editor V4: they
	// depend on it and are not settable on their own, so opting in and out only has to move the
	// features that still carry their own state.
	const OPT_OUT_FEATURES = [
		self::EXPERIMENT_NAME,
		AtomicWidgetsModule::EXPERIMENT_NAME,
		GlobalClassesModule::NAME,
	];

	// Opting in also enables Container, but opting out never disables it, as existing
	// content may already depend on it.
	const OPT_IN_FEATURES = [
		self::EXPERIMENT_NAME,
		'container',
		AtomicWidgetsModule::EXPERIMENT_NAME,
		GlobalClassesModule::NAME,
	];

	public function init() {
		add_action( 'elementor/ajax/register_actions', fn( Ajax $ajax ) => $this->add_ajax_actions( $ajax ) );
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	/**
	 * Editor V4 is the umbrella experiment for the whole V4 editor, so it has to be registered
	 * before any module that depends on it. Modules_Manager registers module experiments while it
	 * constructs each module in order, which is too late, so Experiments_Manager registers this one
	 * with the rest of the default features.
	 */
	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor V4', 'elementor' ),
			'description' => esc_html__( 'Enable Editor V4.', 'elementor' ),
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '4.0.0',
			],
			'on_state_change' => fn( $old_state, $new_state ) => self::mirror_state( AtomicWidgetsModule::EXPERIMENT_NAME, $new_state ),
		];
	}

	/**
	 * Editor V4 and the deprecated Atomic Widgets experiment are two names for the same switch, so
	 * turning either one on or off has to move the other with it. Writing an option that already
	 * holds the target value is a no-op in WordPress and fires no hook, which is what stops the two
	 * mirrors from calling each other indefinitely.
	 */
	public static function mirror_state( string $feature, $new_state ) {
		$option_key = Plugin::$instance->experiments->get_feature_option_key( $feature );
		$new_state = is_string( $new_state ) ? $new_state : Experiments_Manager::STATE_DEFAULT;

		if ( get_option( $option_key ) === $new_state ) {
			return;
		}

		update_option( $option_key, $new_state );
	}

	private function opt_out_v4() {
		foreach ( self::OPT_OUT_FEATURES as $feature ) {
			$feature_key = Plugin::$instance->experiments->get_feature_option_key( $feature );
			update_option( $feature_key, Experiments_Manager::STATE_INACTIVE );
		}
	}

	private function opt_in_v4() {
		foreach ( self::OPT_IN_FEATURES as $feature ) {
			$feature_key = Plugin::$instance->experiments->get_feature_option_key( $feature );
			update_option( $feature_key, Experiments_Manager::STATE_ACTIVE );
		}
	}

	public function ajax_opt_out_v4() {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( 'Permission denied' );
		}

		$this->opt_out_v4();
	}

	public function ajax_opt_in_v4() {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( 'Permission denied' );
		}

		$this->opt_in_v4();
	}

	private function add_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'editor_v4_opt_in', fn() => $this->ajax_opt_in_v4() );
		$ajax->register_ajax_action( 'editor_v4_opt_out', fn() => $this->ajax_opt_out_v4() );
	}

	private function handle_rest_opt_in_v4() {
		$this->ajax_opt_in_v4();
		return new \WP_REST_Response( [
			'success' => true,
		], 200 );
	}

	private function register_routes() {
		register_rest_route( 'elementor/v1', '/operations/opt-in-v4', [
			'methods' => 'POST',
			'callback' => fn() => $this->handle_rest_opt_in_v4(),
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );
	}
}
