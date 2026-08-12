<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Styles_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'default-styles';

	private ?Default_Styles_Repository $repository = null;
	private ?Kit $kit = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_kit(): ?Kit {
		if ( ! $this->kit ) {
			$this->kit = Plugin::$instance->kits_manager->get_active_kit();
		}

		return $this->kit;
	}

	private function get_repository(): Default_Styles_Repository {
		if ( ! $this->repository ) {
			$this->repository = new Default_Styles_Repository( $this->get_kit() );
		}

		return $this->repository;
	}

	private function register_routes() {
		$this->repository = null;
		$this->kit = null;

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->all( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/(?P<tag>[a-z0-9]+)', [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_one( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'tag' => [
						'type' => 'string',
						'required' => true,
					],
				],
			],
			[
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->put( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'tag' => [
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
						'required' => false,
					],
				],
			],
			[
				'methods' => 'DELETE',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->delete( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'tag' => [
						'type' => 'string',
						'required' => true,
					],
				],
			],
		] );
	}

	private function all( \WP_REST_Request $request ) {
		$items = $this->get_repository()->all();

		return Response_Builder::make( (object) $items )->build();
	}

	private function get_one( \WP_REST_Request $request ) {
		$tag = $request->get_param( 'tag' );

		if ( ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
			return Error_Builder::make( 'invalid_tag' )
				->set_status( 400 )
				->set_message( 'Invalid HTML tag.' )
				->build();
		}

		$item = $this->get_repository()->get( $tag );

		if ( ! $item ) {
			return Error_Builder::make( 'not_found' )
				->set_status( 404 )
				->set_message( 'Default style not found.' )
				->build();
		}

		return Response_Builder::make( $item )->build();
	}

	private function put( \WP_REST_Request $request ) {
		$tag = $request->get_param( 'tag' );

		if ( ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
			return Error_Builder::make( 'invalid_tag' )
				->set_status( 400 )
				->set_message( 'Invalid HTML tag.' )
				->build();
		}

		if ( ! $this->get_repository()->put(
			$tag,
			[
				'type' => 'class',
				'variants' => $request->get_param( 'variants' ),
			]
		) ) {
			return Error_Builder::make( 'persist_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to save default style.', 'elementor' ) )
				->build();
		}

		$item = $this->get_repository()->get( $tag );

		return Response_Builder::make( $item )->build();
	}

	private function delete( \WP_REST_Request $request ) {
		$tag = $request->get_param( 'tag' );

		if ( ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
			return Error_Builder::make( 'invalid_tag' )
				->set_status( 400 )
				->set_message( 'Invalid HTML tag.' )
				->build();
		}

		$this->get_repository()->delete( $tag );

		return Response_Builder::make( [ 'deleted' => true ] )->build();
	}

	private function route_wrapper( callable $callback ) {
		try {
			return $callback();
		} catch ( \Throwable $e ) {
			return Error_Builder::make( 'default_styles_error' )
				->set_status( 500 )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
