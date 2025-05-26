<?php

namespace Elementor\Modules\Variables\Classes;

use Exception;
use WP_Error;
use WP_REST_Response;
use WP_REST_Request;
use WP_REST_Server;

use Elementor\Modules\Variables\Classes\Variables_Repository;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'variables';

	const MAX_ID_LENGTH = 64;
	const MAX_LABEL_LENGTH = 50;
	const MAX_VALUE_LENGTH = 512;

	private Variables_Repository $variables_repository;

	public function __construct( Variables_Repository $variables_repository ) {
		$this->variables_repository = $variables_repository;
	}

	public function enough_permissions_to_perform_action() {
		return current_user_can( 'edit_posts' );
	}

	public function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/list', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ $this, 'get_variables' ],
			'permission_callback' => [ $this, 'enough_permissions_to_perform_action' ],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/create', [
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => [ $this, 'create_variable' ],
			'permission_callback' => [ $this, 'enough_permissions_to_perform_action' ],
			'args' => [
				'type' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_type' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
				'label' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_label' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
				'value' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_value' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/update', [
			'methods' => WP_REST_Server::EDITABLE,
			'callback' => [ $this, 'update_variable' ],
			'permission_callback' => [ $this, 'enough_permissions_to_perform_action' ],
			'args' => [
				'id' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_id' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
				'label' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_label' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
				'value' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_value' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/delete', [
			'methods' => WP_REST_Server::DELETABLE,
			'callback' => [ $this, 'delete_variable' ],
			'permission_callback' => [ $this, 'enough_permissions_to_perform_action' ],
			'args' => [
				'id' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_id' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/restore', [
			'methods' => WP_REST_Server::EDITABLE,
			'callback' => [ $this, 'restore_variable' ],
			'permission_callback' => [ $this, 'enough_permissions_to_perform_action' ],
			'args' => [
				'id' => [
					'required' => true,
					'type' => 'string',
					'validate_callback' => [ $this, 'is_valid_variable_id' ],
					'sanitize_callback' => [ $this, 'trim_and_sanitize_text_field' ],
				],
			],
		] );
	}

	public function trim_and_sanitize_text_field( $value ) {
		return trim( sanitize_text_field( $value ) );
	}

	public function is_valid_variable_id( $id ) {
		$id = trim( $id );

		if ( empty( $id ) ) {
			return new WP_Error( 'invalid_variable_id_empty', sprintf(
				__( 'ID cannot be empty', 'elementor' )
			) );
		}

		if ( self::MAX_ID_LENGTH < strlen( $id ) ) {
			return new WP_Error( 'invalid_variable_id_length', sprintf(
				__( 'ID cannot exceed %d characters', 'elementor' ),
				self::MAX_ID_LENGTH
			) );
		}

		return true;
	}

	public function is_valid_variable_type( $type ) {
		return in_array( $type, [
			Color_Variable_Prop_Type::get_key(),
			Font_Variable_Prop_Type::get_key(),
		], true );
	}

	public function is_valid_variable_label( $label ) {
		$label = trim( $label );

		if ( empty( $label ) ) {
			return new WP_Error( 'invalid_variable_value_empty', sprintf(
				__( 'Value cannot be empty', 'elementor' )
			) );
		}

		if ( self::MAX_LABEL_LENGTH < strlen( $label ) ) {
			return new WP_Error( 'invalid_variable_label_length', sprintf(
				__( 'Label cannot exceed %d characters', 'elementor' ),
				self::MAX_LABEL_LENGTH
			) );
		}

		return true;
	}

	public function is_valid_variable_value( $value ) {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return new WP_Error( 'invalid_variable_value_empty', sprintf(
				__( 'Value cannot be empty', 'elementor' )
			) );
		}

		if ( self::MAX_VALUE_LENGTH < strlen( $value ) ) {
			return new WP_Error( 'invalid_variable_value_length', sprintf(
				__( 'Value cannot exceed %d characters', 'elementor' ),
				self::MAX_VALUE_LENGTH
			) );
		}

		return true;
	}

	public function create_variable( WP_REST_Request $request ) {
		try {
			return $this->create_new_variable( $request );
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function create_new_variable( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$label = $request->get_param( 'label' );
		$value = $request->get_param( 'value' );

		$result = $this->variables_repository->create( [
			'type' => $type,
			'label' => $label,
			'value' => $value,
		] );

		return new WP_REST_Response( [
			'success' => true,
			'data' => [
				'variable' => $result['variable'],
				'watermark' => $result['watermark'],
			],
		], 201 );
	}

	public function update_variable( WP_REST_Request $request ) {
		try {
			return $this->update_existing_variable( $request );
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function update_existing_variable( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$label = $request->get_param( 'label' );
		$value = $request->get_param( 'value' );

		$result = $this->variables_repository->update( $id, [
			'label' => $label,
			'value' => $value,
		] );

		return new WP_REST_Response( [
			'success' => true,
			'data' => [
				'variable' => $result['variable'],
				'watermark' => $result['watermark'],
			],
		], 200 );
	}

	public function delete_variable( WP_REST_Request $request ) {
		try {
			return $this->delete_existing_variable( $request );
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function delete_existing_variable( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$result = $this->variables_repository->delete( $id );

		return new WP_REST_Response( [
			'success' => true,
			'data' => [
				'variable' => $result['variable'],
				'watermark' => $result['watermark'],
			],
		], 200 );
	}

	public function restore_variable( WP_REST_Request $request ) {
		try {
			return $this->restore_existing_variable( $request );
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function restore_existing_variable( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$result = $this->variables_repository->restore( $id );

		return new WP_REST_Response( [
			'success' => true,
			'data' => [
				'variable' => $result['variable'],
				'watermark' => $result['watermark'],
			],
		], 200 );
	}

	public function get_variables() {
		try {
			return $this->list_of_variables();
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function list_of_variables() {
		$response = $this->prepare_list_response();

		return new WP_REST_Response( [
			'success' => true,
			'data' => [
				'variables' => $response['list'],
				'total' => $response['total'],
				'watermark' => $response['watermark'],
			],
		], 200 );
	}

	private function prepare_list_response() {
		$db_record = $this->variables_repository->load();

		return [
			'list' => $db_record['data'],
			'total' => count( $db_record['data'] ),
			'watermark' => $db_record['watermark'],
		];
	}

	private function error_response( Exception $e ) {
		$error_code = 500;

		if ( $e->getCode() ) {
			$error_code = $e->getCode();
		}

		return new WP_REST_Response( [
			'code' => 'unexpected_server_error',
			'message' => 'Unexpected server error',
			'data' => [
				'status' => $error_code,
			],
		], $error_code );
	}
}
