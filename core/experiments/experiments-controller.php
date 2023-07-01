<?php

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

function register_feature_routes() {
	register_rest_route('elementor/v1', '/experiments', [
		[
			'methods' => WP_REST_Server::READABLE,
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'sanitize_callback' => function () {
				return '';
			},
			'validate_callback' => function ( $request ) {
				/** @var WP_REST_Request $request */
				$params = $request->get_params();
				unset( $params['rest_route'] );

				return empty( $params );
			},
			'callback' => function () {
				$experiments_manager = Plugin::instance()->experiments;
				$feature = $experiments_manager->get_features();
				$experiments = array();

				foreach ( $feature as $experiment_id => $experiment ) {
					if ( ( ! empty( $experiment['hidden'] ) && true === $experiment['hidden'] ) || false === $experiment['mutable'] ) {
						continue;
					}

					$experiments[ $experiment_id ] = [
						'title' => $experiment['title'],
						'status' => $experiments_manager->is_feature_active( $experiment_id )
							? Experiments_Manager::STATE_ACTIVE
							: Experiments_Manager::STATE_INACTIVE,
					];
				}

				return $experiments;
			},
		],
	]);

	register_rest_route('elementor/v1', '/experiments', [
		[
			'methods' => WP_REST_Server::CREATABLE,
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'sanitize_callback' => function ( $param ) {
				return sanitize_key( $param );
			},
			'validate_callback' => function ( $request ) {
				return in_array( $request->get_param( 'status' ), [ Experiments_Manager::STATE_ACTIVE, Experiments_Manager::STATE_INACTIVE ], true )
					&& null != $request->get_param( 'experimentId' );
			},
			'callback' => function ( $request ) {
				$experiment_id = $request->get_param( 'experimentId' );
				$new_status = $request->get_param( 'status' );
				$experiments_manager = Plugin::instance()->experiments;
				$feature = $experiments_manager->get_features( $experiment_id );

				if ( ! $feature ) {
					wp_send_json_error( [
						'errorMessage' => 'Invalid experiment: ' . $experiment_id,
					] );
				}

				// set status
				$option_key = $experiments_manager->get_feature_option_key( $experiment_id );
				$success = false;
				$current_status = $experiments_manager->is_feature_active( $experiment_id );
				if ( ( Experiments_Manager::STATE_ACTIVE == $new_status ) == $current_status ) {
					$success = true;
				} else {
					$success = update_option( $option_key, $new_status );
				}

				if ( ! $success ) {
					wp_send_json_error( [
						'errorMessage' => 'Failed to set experiment status.',
					] );
				}
			},
		],
	]);
}

add_action( 'rest_api_init', __NAMESPACE__ . '\register_feature_routes' );
