<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Utils\Error_Builder;
use Elementor\Modules\GlobalClasses\Utils\Response_Builder;

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

	/**
	 * TODO: Add sanitization when implemented on prop types [EDS-574]
	 */
	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn() => $this->route_wrapper( fn() => $this->all() ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->put( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'items' => [
						'required' => true,
						'type' => 'object',
						'additionalProperties' => [
							'type' => 'object',
							'properties' => [
								'id' => [
									'type' => 'string',
									'required' => true,
								],
								'variants' => [
									'type' => 'array',
									'required' => true,
								],
								'type' => [
									'type' => 'string',
									'enum' => [ 'class' ],
									'required' => true,
								],
								'label' => [
									'type' => 'string',
									'required' => true,
								],
							],
						],
					],
					'order' => [
						'required' => true,
						'type' => 'array',
						'items' => [
							'type' => 'string',
						],
					],
				],
			],
		] );
	}

	private function all() {
		$classes = $this->get_repository()->all();

		return Response_Builder::make( (object) $classes->get_items()->all() )
			->set_meta( [ 'order' => $classes->get_order()->all() ] )
			->build();
	}

	private function put( \WP_REST_Request $request ) {
		$parser = Global_Classes_Parser::make();

		$items_result = $parser->parse_items(
			$request->get_param( 'items' )
		);

		if ( ! $items_result->is_valid() ) {
			return Error_Builder::make( 'invalid_items' )
				->set_status( 400 )
				->set_message( 'Invalid items: ' . $items_result->errors()->to_string() )
				->build();
		}

		$order_result = $parser->parse_order(
			$request->get_param( 'order' ),
			$items_result->unwrap()
		);

		if ( ! $order_result->is_valid() ) {
			return Error_Builder::make( 'invalid_order' )
				->set_status( 400 )
				->set_message( 'Invalid order: ' . $order_result->errors()->to_string() )
				->build();
		}

		$this->get_repository()->put(
			$items_result->unwrap(),
			$order_result->unwrap(),
		);

		return Response_Builder::make()->no_content()->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}

		return $response;
	}
}
