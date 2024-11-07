<?php

namespace Elementor\Modules\GlobalClasses;

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
			return new \WP_Error( Module::NAME . '_not_found', 'Global class not found', [ 'status' => 404 ] );
		}

		try {
			$this->repository->delete( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Deleting global class failed unexpectedly', [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( [ 'message' => 'Global class deleted successfully' ], 200 );
	}

	private function patch( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$updated = $request->get_params();

		// [OPEN QUESTION] should we check if the ids match?

		try {
			$one = $this->repository->get( $id );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Updating global class failed unexpectedly', [ 'status' => 500 ] );
		}

		if ( null === $one ) {
			return new \WP_Error( Module::NAME . '_not_found', 'Global class not found', [ 'status' => 404 ] );
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
			$one = $this->repository->get( $class['id'] );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Getting global class failed unexpectedly', [ 'status' => 500 ] );
		}

		if ( null !== $one ) {
			return new \WP_Error( Module::NAME . '_exists', 'Global class already exists', [ 'status' => 409 ] );
		}

		try {
			$new = $this->repository->create( $class );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'unexpected_error', 'Creating global class failed unexpectedly', [ 'status' => 500 ] );
		}

		return new \WP_REST_Response( $new, 201 );
	}

	private function arrange( $request ) {
		$order = $request->get_params();

		// [OPEN QUESTION] Should we check if all global classes exist?
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
				'args' => [
					'type' => 'array',
					'required' => true,
				],
			],
		] );

		register_rest_route( Module::API_NAMESPACE, '/' . Module::API_BASE . '/create', [
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'callback' => fn( $request ) => $this->create( $request ),
				'args' => [
					'id' => [
						'type' => 'string',
					],
				],
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
