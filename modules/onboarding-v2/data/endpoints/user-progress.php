<?php

namespace Elementor\Modules\OnboardingV2\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\OnboardingV2\Module as OnboardingV2_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * User Progress Endpoint
 *
 * Handles user progress tracking for onboarding v2.
 * Supports resuming unfinished flows and distinguishing between
 * user-initiated exits and unexpected exits.
 *
 * @since 3.x.x
 */
class User_Progress extends Endpoint_Base {

	/**
	 * Register endpoint routes.
	 *
	 * @since 3.x.x
	 * @access protected
	 */
	protected function register(): void {
		parent::register();

		$this->register_items_route( \WP_REST_Server::READABLE );
		$this->register_items_route( \WP_REST_Server::EDITABLE );
	}

	/**
	 * Get endpoint name.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return string Endpoint name.
	 */
	public function get_name(): string {
		return 'user-progress';
	}

	/**
	 * Get endpoint format.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return string Endpoint format.
	 */
	public function get_format(): string {
		return 'onboarding-v2';
	}

	/**
	 * Get items (user progress data).
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return array Response data.
	 */
	public function get_items( $request ): array {
		$module = OnboardingV2_Module::instance();

		return [
			'data' => $module->get_user_progress(),
			'meta' => [
				'had_unexpected_exit' => $module->had_unexpected_exit(),
			],
		];
	}

	/**
	 * Update items (user progress data).
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return array Response data.
	 */
	public function update_items( $request ): array {
		$module = OnboardingV2_Module::instance();
		$params = $request->get_json_params();

		// Handle step completion
		if ( isset( $params['complete_step'] ) ) {
			$progress = $module->get_user_progress();
			$step_id = $params['complete_step'];

			if ( ! in_array( $step_id, $progress['completed_steps'], true ) ) {
				$progress['completed_steps'][] = $step_id;
			}

			// Find the earliest uncompleted step
			$total_steps = $params['total_steps'] ?? 14;
			$current_step = $progress['current_step'];

			for ( $i = 0; $i < $total_steps; $i++ ) {
				if ( ! in_array( $i, $progress['completed_steps'], true ) ) {
					$current_step = $i;
					break;
				}
			}

			$progress['current_step'] = $current_step;
			$params['completed_steps'] = $progress['completed_steps'];
			$params['current_step'] = $current_step;

			unset( $params['complete_step'], $params['total_steps'] );
		}

		// Handle starting onboarding
		if ( isset( $params['start'] ) && $params['start'] ) {
			$params['started_at'] = time();
			$params['exit_type'] = null;
			unset( $params['start'] );
		}

		// Handle completing onboarding
		if ( isset( $params['complete'] ) && $params['complete'] ) {
			$params['completed_at'] = time();
			$params['exit_type'] = 'user_exit';
			unset( $params['complete'] );
		}

		// Handle user exit
		if ( isset( $params['user_exit'] ) && $params['user_exit'] ) {
			$params['exit_type'] = 'user_exit';
			unset( $params['user_exit'] );
		}

		$success = $module->update_user_progress( $params );

		return [
			'data' => $success ? 'success' : 'error',
			'progress' => $module->get_user_progress(),
		];
	}
}
