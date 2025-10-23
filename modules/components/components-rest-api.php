<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Core\Utils\Collection;

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
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/' . self::STYLES_ROUTE, [
			[
				'methods' => 'GET',
				'callback' => fn() => $this->route_wrapper( fn() => $this->get_styles() ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->create_components( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'status' => [
						'type' => 'string',
						'enum' => [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ],
						'required' => true,
					],
					'items' => [
						'type' => 'array',
						'required' => true,
						'items' => [
							'type' => 'object',
							'properties' => [
								'temp_id' => [
									'type' => 'number',
									'required' => true,
								],
								'title' => [
									'type' => 'string',
									'required' => true,
									'minLength' => 2,
									'maxLength' => 200,
								],
								'elements' => [
									'type' => 'array',
									'required' => true,
									'items' => [
										'type' => 'object',
									],
								],
							],
						],
					],
				],
			],
		] );
	}

	private function get_components() {
		$components = $this->get_repository()->all();

		$components_list = $components->map( fn( $component ) => [
			'id' => $component['id'],
			'name' => $component['name'],
		])->all();

		return Response_Builder::make( $components_list )->build();
	}

	private function get_styles() {
		$components = $this->get_repository()->all();

		$styles = [];
		$components->each( function( $component ) use ( &$styles ) {
			$styles[ $component['id'] ] = $component['styles'];
		} );

		return Response_Builder::make( $styles )->build();
	}

	private function create_components( \WP_REST_Request $request ) {
		$save_status = $request->get_param( 'status' );

		$items = Collection::make( $request->get_param( 'items' ) );

		$components = $this->get_repository()->all();

		$result = Save_Components_Validator::make( $components )->validate( $items );

		if ( ! $result['success'] ) {
			return Error_Builder::make( 'components_validation_failed' )
				->set_status( 400 )
				->set_message( 'Validation failed: ' . implode( ', ', $result['messages'] ) )
				->build();
		}

		$created = $items->map_with_keys( function ( $item ) use ( $save_status ) {
			$name = sanitize_text_field( $item['title'] );
			$content = $item['elements'];

			$status = Document::STATUS_AUTOSAVE === $save_status
				? Document::STATUS_DRAFT
				: $save_status;

			$component_id = $this->get_repository()->create( $name, $content, $status );

			return [ $item['temp_id'] => $component_id ];
		} );

		return Response_Builder::make( (object) $created->all() )
			->set_status( 201 )
			->build();
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
