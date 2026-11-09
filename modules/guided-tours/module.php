<?php

namespace Elementor\Modules\GuidedTours;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const AJAX_ACTION = 'elementor_guided_tours_update_progress';
	const NONCE_ACTION = 'elementor-guided-tours-progress';

	private const DRIVER_ASSET_VERSION = '1.10.2';
	private const DRIVER_SCRIPT_HANDLE = 'elementor-guided-tours-driver';
	private const SCRIPT_HANDLE = 'elementor-guided-tours';

	private Progress_Manager $progress_manager;
	private Tours_Repository $tours_repository;

	public function __construct(
		?Tours_Repository $tours_repository = null,
		?Progress_Manager $progress_manager = null
	) {
		parent::__construct();

		$this->tours_repository = $tours_repository ?? new Tours_Repository();
		$this->progress_manager = $progress_manager ?? new Progress_Manager();

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'wp_ajax_' . self::AJAX_ACTION, [ $this, 'update_progress' ] );
	}

	public function get_name(): string {
		return 'guided-tours';
	}

	public function enqueue_assets(): void {
		if ( ! $this->is_current_user_administrator() ) {
			return;
		}

		$current_screen = get_current_screen();

		if ( ! $current_screen ) {
			return;
		}

		$tour = $this->tours_repository->get_eligible_tour(
			$current_screen->id,
			wp_get_current_user()->roles
		);

		if (
			empty( $tour ) ||
			$this->progress_manager->is_completed( $tour['id'], $tour['version'] )
		) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			self::DRIVER_SCRIPT_HANDLE,
			ELEMENTOR_ASSETS_URL . 'lib/driver/driver' . $min_suffix . '.css',
			[],
			self::DRIVER_ASSET_VERSION
		);
		wp_enqueue_style(
			self::SCRIPT_HANDLE,
			$this->get_css_assets_url( 'modules/guided-tours/guided-tours' ),
			[ self::DRIVER_SCRIPT_HANDLE ],
			ELEMENTOR_VERSION
		);
		wp_enqueue_script(
			self::DRIVER_SCRIPT_HANDLE,
			ELEMENTOR_ASSETS_URL . 'lib/driver/driver' . $min_suffix . '.js',
			[],
			self::DRIVER_ASSET_VERSION,
			true
		);
		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			$this->get_js_assets_url( 'guided-tours' ),
			[ self::DRIVER_SCRIPT_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script( self::SCRIPT_HANDLE, 'elementorGuidedToursConfig', [
			'tour' => $tour,
			'progress' => $this->progress_manager->get_progress( $tour['id'], $tour['version'] ),
			'ajax' => [
				'url' => admin_url( 'admin-ajax.php' ),
				'action' => self::AJAX_ACTION,
				'nonce' => wp_create_nonce( self::NONCE_ACTION ),
			],
		] );
	}

	public function update_progress(): void {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! $this->is_current_user_administrator() ) {
			wp_send_json_error( null, \WP_Http::FORBIDDEN );
		}

		$tour_id = sanitize_key( wp_unslash( $_POST['tourId'] ?? '' ) );
		$version = absint( wp_unslash( $_POST['version'] ?? 0 ) );
		$status = sanitize_key( wp_unslash( $_POST['status'] ?? '' ) );
		$step_id = sanitize_key( wp_unslash( $_POST['stepId'] ?? '' ) );

		if ( ! $tour_id || ! $version || ! $step_id ) {
			wp_send_json_error( null, \WP_Http::BAD_REQUEST );
		}

		if ( ! $this->progress_manager->update( $tour_id, $version, $status, $step_id ) ) {
			wp_send_json_error( null, \WP_Http::BAD_REQUEST );
		}

		wp_send_json_success();
	}

	private function is_current_user_administrator(): bool {
		return in_array( 'administrator', wp_get_current_user()->roles, true );
	}
}
