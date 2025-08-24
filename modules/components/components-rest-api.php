<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'components';
	const STYLES_ROUTE = 'styles';
	const MAX_COMPONENTS = 50;

	private $repository = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Components_Repository();
		}

		return $this->repository;
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn() => $this->route_wrapper( fn() => $this->get_components() ),
				'permission_callback' => fn() => is_user_logged_in(),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/' . self::STYLES_ROUTE, [
			[
				'methods' => 'GET',
				'callback' => fn() => $this->route_wrapper( fn() => $this->get_styles() ),
				'permission_callback' => fn() => is_user_logged_in(),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->create_component( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'name' => [
						'type' => 'string',
						'required' => true,
					],
					'content' => [
						'type' => 'array',
						'required' => true,
						'items' => [
							'type' => 'object',
						],
					],
				],
			],
		] );
	}

	private function get_components() {
		$components = $this->get_repository()->all();

		$components_list = $components->get_components()->map( fn( $component ) => [
			'id' => $component->get_id(),
			'name' => $component->get_post()->post_title,
		])->all();

		return Response_Builder::make( $components_list )->build();
	}

	private function get_styles() {
		$styles = $this->get_repository()->all()->get_styles();

		return Response_Builder::make( $styles->all() )->build();
	}
	private function create_component( \WP_REST_Request $request ) {
		$components = $this->get_repository()->all();
		$components_count = $components->get_components()->count();

		if ( $components_count >= static::MAX_COMPONENTS ) {
			return Error_Builder::make( 'components_limit_exceeded' )
				->set_status( 400 )
				->set_message( sprintf(
					__( 'Components limit exceeded. Maximum allowed: %d', 'elementor' ),
					static::MAX_COMPONENTS
				) )
				->build();
		}

		$parser = Components_Parser::make();

		$name_result = $parser->parse_name( $request->get_param( 'name' ), $components->get_components()->map( fn( $component ) => $component->get_post()->post_title )->all() );

		if ( ! $name_result->is_valid() ) {
			return Error_Builder::make( 'invalid_name' )
				->set_status( 400 )
				->set_message( __( 'Invalid component name: ' . $name_result->errors()->to_string(), 'elementor' ) )
				->build();
		}

		$name = $name_result->unwrap();
		// The content is validated & sanitized in the document save process.
		$content = $request->get_param( 'content' );

		$result = $this->get_repository()->create( $name, $content );

		if ( isset( $result['error'] ) ) {
			return $result['error'];
		}

		return Response_Builder::make( $result['component_id'] )->build();
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
