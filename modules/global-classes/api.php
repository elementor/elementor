<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Validators\Styles_Validator;

class API {
	private Repository $repository;

	public function __construct( Repository $repository ) {
		$this->repository = $repository;
	}

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function all() {
		try {
			$all = $this->repository->all();
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Getting global classes failed unexpectedly', [ 'status' => 500 ] );
		}

		return $all->get();
	}

	private function get( $request ) {
		$id = $request->get_param( 'id' );

		try {
			$one = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Getting global class failed unexpectedly', [ 'status' => 500 ] );
		}

		if ( null === $one ) {
			return new \WP_Error( 'entity_not_found', 'Global class not found', [ 'status' => 404 ] );
		}

		return $one;
	}

	private function delete( $request ) {
		$id = $request->get_param( 'id' );

		try {
			$one = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Deleting global class failed unexpectedly', [ 'status' => 500 ] );
		}

		if ( null === $one ) {
			return new \WP_Error( 'entity_not_found', 'Global class not found', [ 'status' => 404 ] );
		}

		try {
			$this->repository->delete( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Deleting global class failed unexpectedly', [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( null, 204 );
	}

	private function patch( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$updated = $request->get_params();

		unset( $updated['id'] );

		try {
			$one = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Updating global class failed unexpectedly', [ 'status' => 500 ] );
		}

		if ( null === $one ) {
			return new \WP_Error( 'entity_not_found', 'Global class not found', [ 'status' => 404 ] );
		}

		try {
			$updated = $this->repository->patch( $id, $updated );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Updating global class failed unexpectedly', [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $updated, 200 );
	}

	private function create( \WP_REST_Request $request ) {
		$class = $request->get_params();

		try {
			$new = $this->repository->create( $class );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Creating global class failed unexpectedly', [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $new, 201 );
	}

	private function arrange( $request ) {
		$order = $request->get_params();

		try {
			$all = $this->repository->all();
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Arranging global classes failed unexpectedly', [ 'status' => 500 ] );
		}

		if ( ! empty( $all->get_order()->diff( $order ) ) ) {
			return new \WP_Error( 'invalid_order', 'Invalid order', [ 'status' => 400 ] );
		}

		try {
			$updated = $this->repository->arrange( $order );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Arranging global classes failed unexpectedly', [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $updated, 200 );
	}


	private function register_routes() {
		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/all', [
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => fn() => $this->all(),
			],
		] );

		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/(?P<id>[\w-]+)', [
			[
				'methods' => \WP_REST_Server::READABLE,
				'callback' => fn( $request ) => $this->get( $request ),
				'args' => [
					'id' => [
						'type' => 'string',
						'required' => true,
					],
				],
			],
		] );

		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/delete/(?P<id>[\w-]+)', [
			[
				'methods' => \WP_REST_Server::DELETABLE,
				'callback' => fn( $request ) => $this->delete( $request ),
				'args' => [
					'id' => [
						'type' => 'string',
						'required' => true,
					],
				],
			],
		] );

		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/patch/(?P<id>[\w-]+)', [
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'callback' => fn( $request ) => $this->patch( $request ),
				'validate_callback' => function( \WP_REST_Request $request ) {
					[, , $errors ] = Styles_Validator::make( Style_Schema::get() )->validate_style( $request->get_params() );

					return [ 'id' ] === $errors;
				},
			],
		] );

		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/create', [
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => fn( $request ) => $this->create( $request ),
				'validate_callback' => function( \WP_REST_Request $request ) {
					[ , , $errors ] = Styles_Validator::make( Style_Schema::get() )->validate_style( $request->get_params() );

					return [ 'id' ] === $errors;
				},
			],
		] );

		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/arrange', [
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'callback' => fn( $request ) => $this->arrange( $request ),
				'args' => [
					'type' => 'array',
					'required' => true,
				],
			],
		] );
	}
}
