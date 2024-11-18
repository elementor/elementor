<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Validators\Styles_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'global-classes';

	private Global_Classes_Repository $repository;

	public function __construct( Kit $kit ) {
		$this->repository = new Global_Classes_Repository( $kit );
	}

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function all() {
		try {
			$classes = $this->repository->all();
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Getting global classes failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		return $classes->get();
	}

	private function get( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		try {
			$class = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Getting global class failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		if ( null === $class ) {
			return new \WP_Error( 'entity_not_found', __( 'Global class not found', 'elementor' ), [ 'status' => 404 ] );
		}

		return $class;
	}

	private function delete( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		try {
			$class = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Deleting global class failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		if ( null === $class ) {
			return new \WP_Error( 'entity_not_found', __( 'Global class not found', 'elementor' ), [ 'status' => 404 ] );
		}

		try {
			$this->repository->delete( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Deleting global class failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( null, 204 );
	}

	private function patch( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$values = $request->get_params();

		unset( $values['id'] );

		try {
			$class = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Updating global class failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		if ( null === $class ) {
			return new \WP_Error( 'entity_not_found', __( 'Global class not found', 'elementor' ), [ 'status' => 404 ] );
		}

		try {
			$values = $this->repository->patch( $id, $values );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Updating global class failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $values, 200 );
	}

	private function create( \WP_REST_Request $request ) {
		$class = $request->get_params();

		try {
			$new = $this->repository->create( $class );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Creating global class failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $new, 201 );
	}

	private function arrange( \WP_REST_Request $request ) {
		$order = $request->get_params();

		try {
			$classes = $this->repository->all();
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Arranging global classes failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		$differences = array_merge( $classes->get_order()->diff( $order ), array_diff( $order, $classes->get_order()->all() ) );

		if ( ! empty( $differences ) ) {
			return new \WP_Error( 'invalid_content', __( 'Global classes order invalid', 'elementor' ), [ 'status' => 422 ] );
		}

		try {
			$updated = $this->repository->arrange( $order );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', __( 'Arranging global classes failed unexpectedly', 'elementor' ), [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $updated, 200 );
	}

	// TODO: Add sanitization when implemented on prop types [EDS-574]
	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => fn() => $this->all(),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/(?P<id>[\w-]+)', [
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => fn( $request ) => $this->get( $request ),
				'args' => [
					'id' => [
						'type' => 'string',
						'required' => true,
					],
				],
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/(?P<id>[\w-]+)', [
			[
				'methods' => \WP_REST_Server::DELETABLE,
				'callback' => fn( $request ) => $this->delete( $request ),
				'args' => [
					'id' => [
						'type' => 'string',
						'required' => true,
					],
				],
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/(?P<id>[\w-]+)', [
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'callback' => fn( $request ) => $this->patch( $request ),
				'validate_callback' => function( \WP_REST_Request $request ) {
					[, , $errors ] = Styles_Validator::make( Style_Schema::get() )->validate_style( $request->get_body_params() );

					return empty( $errors ) || [ 'id' ] === $errors;
				},
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => fn( $request ) => $this->create( $request ),
				'validate_callback' => function( \WP_REST_Request $request ) {
					[ , , $errors ] = Styles_Validator::make( Style_Schema::get() )->validate_style( $request->get_body_params() );

					return empty( $errors ) || [ 'id' ] === $errors;
				},
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '-order', [
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'callback' => fn( $request ) => $this->arrange( $request ),
				'validate_callback' => function( \WP_REST_Request $request ) {
					return is_array( $request->get_params() );
				},
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );
	}
}
