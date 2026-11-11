<?php

namespace Elementor\Modules\GuidedTours;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const AJAX_ACTION = 'elementor_guided_tours_update_progress';
	const NONCE_ACTION = 'elementor-guided-tours-progress';
	const EDITOR_SCREEN_ID = 'elementor-editor';

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

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_assets' ] );
		add_action( 'wp_ajax_' . self::AJAX_ACTION, [ $this, 'update_progress' ] );
	}

	public function get_name(): string {
		return 'guided-tours';
	}

	public function enqueue_admin_assets(): void {
		if ( ! $this->can_current_user_view_tours() ) {
			return;
		}

		$current_screen = get_current_screen();

		if ( ! $current_screen ) {
			return;
		}

		$this->maybe_enqueue_tour_assets( $current_screen->id );
	}

	public function enqueue_editor_assets(): void {
		if ( ! $this->can_current_user_view_tours() ) {
			return;
		}

		$this->maybe_enqueue_tour_assets( self::EDITOR_SCREEN_ID, 'editor' );
	}

	private function maybe_enqueue_tour_assets( string $screen_id, string $context = 'admin' ): void {
		$tour = $this->tours_repository->get_eligible_tour(
			$screen_id,
			wp_get_current_user()->roles
		);

		if ( empty( $tour ) ) {
			return;
		}

		$progress = $this->progress_manager->get_progress( $tour['id'], $tour['version'] );

		$resume_step = $this->get_resume_step_for_screen( $tour['steps'] ?? [], $progress, $screen_id );

		if ( $this->progress_manager->should_suppress_tour( $tour['id'], $tour['version'] ) || empty( $resume_step ) ) {
			return;
		}

		wp_enqueue_style(
			self::DRIVER_SCRIPT_HANDLE,
			ELEMENTOR_ASSETS_URL . 'lib/driver/driver.css',
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
			ELEMENTOR_ASSETS_URL . 'lib/driver/driver.js',
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
			'adminUrl' => admin_url(),
			'context' => $context,
			'i18n' => [
				'done' => esc_html__( 'Done', 'elementor' ),
				'next' => esc_html__( 'Next', 'elementor' ),
				'previous' => esc_html__( 'Previous', 'elementor' ),
				/* translators: 1: Current step number, 2: Total steps in the tour. */
				'progress' => esc_html__( '%1$s of %2$s', 'elementor' ),
			],
			'tour' => $tour,
			'screenId' => $screen_id,
			'progress' => $progress,
			'resumeStepId' => $resume_step['id'],
			'ajax' => [
				'url' => admin_url( 'admin-ajax.php' ),
				'action' => self::AJAX_ACTION,
				'nonce' => wp_create_nonce( self::NONCE_ACTION ),
			],
		] );
	}

	private function get_resume_step_for_screen( array $steps, array $progress, string $screen_id ): array {
		if ( empty( $steps ) || '' === $screen_id ) {
			return [];
		}

		if ( empty( $progress['step_id'] ) ) {
			$first_step = $steps[0];

			return ( $first_step['screen'] ?? '' ) === $screen_id ? $first_step : [];
		}

		$progress_index = null;

		foreach ( $steps as $index => $step ) {
			if ( ( $step['id'] ?? '' ) !== $progress['step_id'] ) {
				continue;
			}

			$progress_index = $index;

			if ( ( $step['screen'] ?? '' ) === $screen_id ) {
				return $step;
			}

			break;
		}

		if ( null === $progress_index ) {
			return [];
		}

		foreach ( array_slice( $steps, $progress_index + 1 ) as $step ) {
			if ( ( $step['screen'] ?? '' ) === $screen_id ) {
				return $step;
			}
		}

		return [];
	}

	public function update_progress(): void {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! $this->can_current_user_view_tours() ) {
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

	private function can_current_user_view_tours(): bool {
		return current_user_can( 'manage_options' );
	}
}
