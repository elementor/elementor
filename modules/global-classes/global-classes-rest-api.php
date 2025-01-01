<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\GlobalClasses\Utils\Error;
use Elementor\Modules\GlobalClasses\Utils\Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'global-classes';

	private $repository = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Global_Classes_Repository();
		}

		return $this->repository;
	}

	// TODO: Add sanitization when implemented on prop types [EDS-574]
	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn() => $this->route_wrapper( fn() => $this->all() ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/(?P<id>[\w-]+)', [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get( $request ) ),
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
				'methods' => 'DELETE',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->delete( $request ) ),
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
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->put( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->create( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '-order', [
			[
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() =>  $this->arrange( $request ) ),
				'validate_callback' => function( \WP_REST_Request $request ) {
					$order = $request->get_params();

					if ( ! is_array( $order ) ) {
						return false;
					}

					$classes = $this->get_repository()->all();

					$missing_items = Collection::make( $classes->get_items()->keys() )->diff( $order );
					$extra_items = Collection::make( $order )->diff( $classes->get_items()->keys() );

					return $missing_items->is_empty() && $extra_items->is_empty();
				},
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );
	}

	private function all() {
		$classes = $this->get_repository()->all();

		return Response::make( $classes->get_items()->all() )
			->set_meta( [ 'order' => $classes->get_order()->all() ] )
			->get();
	}

	private function get( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$class = $this->get_repository()->get( $id );

		if ( null === $class ) {
			return Error::make( 'entity_not_found' )
				->set_message( __( 'Global class not found', 'elementor' ) )
				->set_status( 404 )
				->get();
		}

		return Response::make( $class )->get();
	}

	private function delete( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$class = $this->get_repository()->get( $id );

		if ( null === $class ) {
			return Error::make( 'entity_not_found' )
				->set_message( __( 'Global class not found', 'elementor' ) )
				->set_status( 404 )
				->get();
		}

		$this->get_repository()->delete( $id );

		return Response::make()
			->set_status( 204 )
			->set_meta( [ 'order' => $this->get_repository()->all()->get_order()->all() ] )
			->get();
	}

	private function put( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		$value = $request->get_params();

		// Ignore id to simplify the patch, and allow passing the entity as it is
		unset( $value['id'] );

		$class = $this->get_repository()->get( $id );

		if ( null === $class ) {
			return Error::make( 'entity_not_found' )
				->set_message( __( 'Global class not found', 'elementor' ) )
				->set_status( 404 )
				->get();
		}

		[$is_valid, $parsed, $errors] = Style_Parser::make( Style_Schema::get() )
			->without_id()
			->parse( $value );

		if ( ! $is_valid ) {
			return Error::make( 'invalid_data' )
				->set_message( join( ', ', $errors ) )
				->get();
		}

		$updated = $this->get_repository()->put( $id, $parsed );
		$order = $this->get_repository()->all()->get_order()->all();

		return Response::make( $updated )
			->set_meta( [ 'order' => $order ] )
			->get();
	}

	private function create( \WP_REST_Request $request ) {
		$class = $request->get_params();
		[$is_valid, $parsed, $errors] = Style_Parser::make( Style_Schema::get() )
			->without_id()
			->parse( $class );

		if ( ! $is_valid ) {
			return Error::make( 'invalid_data' )
				->set_message( join( ', ', $errors ) )
				->get();
		}

		$new = $this->get_repository()->create( $parsed );
		$order = $this->get_repository()->all()->get_order()->all();

		return Response::make( $new )
			->set_status( 201 )
			->set_meta( [ 'order' => $order ] )
			->get();
	}

	private function arrange( \WP_REST_Request $request ) {
		$order = $request->get_params();
		$updated = $this->get_repository()->arrange( $order );

		return Response::make( $updated )->get();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->set_status( 500 )
				->get();
		}

		return $response;
	}
}
