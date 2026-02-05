<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Storage\Repository;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Progress extends Endpoint_Base {

	public function get_name(): string {
		return 'user-progress';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::EDITABLE );
	}

	public function get_items( $request ) {
		$repository = Repository::instance();
		$progress = $repository->get_progress();

		return [
			'data' => $progress->to_array(),
			'meta' => [
				'had_unexpected_exit' => $progress->had_unexpected_exit(),
			],
		];
	}

	public function update_items( $request ) {
		$repository = Repository::instance();
		$params = $request->get_json_params();
		$validated = [];

		if ( ! is_array( $params ) ) {
			$params = [];
		}

		if ( array_key_exists( 'current_step', $params ) ) {
			if ( ! is_numeric( $params['current_step'] ) ) {
				return new \WP_Error( 'invalid_current_step', 'Current step must be a number.', [ 'status' => 400 ] );
			}

			$validated['current_step'] = (int) $params['current_step'];
		}

		if ( array_key_exists( 'completed_steps', $params ) ) {
			if ( ! is_array( $params['completed_steps'] ) ) {
				return new \WP_Error( 'invalid_completed_steps', 'Completed steps must be an array.', [ 'status' => 400 ] );
			}

			$validated['completed_steps'] = array_values(
				array_filter(
					array_map(
						static function ( $step ) {
							if ( is_numeric( $step ) ) {
								return (int) $step;
							}

							if ( is_string( $step ) ) {
								return sanitize_text_field( $step );
							}

							return null;
						},
						$params['completed_steps']
					),
					static function ( $step ) {
						return null !== $step;
					}
				)
			);
		}

		if ( array_key_exists( 'exit_type', $params ) ) {
			$exit_type = $params['exit_type'];
			$allowed_exit_types = [ 'user_exit', 'unexpected', null, '' ];

			if ( ! in_array( $exit_type, $allowed_exit_types, true ) ) {
				return new \WP_Error( 'invalid_exit_type', 'Exit type is invalid.', [ 'status' => 400 ] );
			}

			$validated['exit_type'] = $exit_type ?: null;
		}

		if ( array_key_exists( 'complete_step', $params ) ) {
			if ( is_numeric( $params['complete_step'] ) ) {
				$validated['complete_step'] = (int) $params['complete_step'];
			} elseif ( is_string( $params['complete_step'] ) ) {
				$validated['complete_step'] = sanitize_text_field( $params['complete_step'] );
			} else {
				return new \WP_Error( 'invalid_complete_step', 'Complete step must be a number or string.', [ 'status' => 400 ] );
			}
		}

		if ( array_key_exists( 'total_steps', $params ) ) {
			if ( ! is_numeric( $params['total_steps'] ) ) {
				return new \WP_Error( 'invalid_total_steps', 'Total steps must be a number.', [ 'status' => 400 ] );
			}

			$validated['total_steps'] = (int) $params['total_steps'];
		}

		if ( array_key_exists( 'start', $params ) ) {
			$validated['start'] = (bool) $params['start'];
		}

		if ( array_key_exists( 'complete', $params ) ) {
			$validated['complete'] = (bool) $params['complete'];
		}

		if ( array_key_exists( 'user_exit', $params ) ) {
			$validated['user_exit'] = (bool) $params['user_exit'];
		}

		$progress = $repository->update_progress( $validated );

		return [
			'data' => 'success',
			'progress' => $progress->to_array(),
		];
	}
}
