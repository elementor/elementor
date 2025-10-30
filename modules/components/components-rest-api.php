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
	const LOCK_DOCUMENT_TYPE_NAME = 'components';
	const STYLES_ROUTE = 'styles';
	const MAX_COMPONENTS = 50;

	private $repository = null;
	private $lock_component_manager_instance = null;
	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Components_Repository();
		}

		return $this->repository;
	}

	/**
	 * @return Lock_Component_Manager instance
	 */
	private function get_lock_component_manager() {
		return Lock_Component_Manager::get_instance();
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

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/lock', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->lock_component( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'componentId' => [
						'type' => 'number',
						'required' => true,
						'description' => 'The component ID to unlock',
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/unlock', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->unlock_component( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'componentId' => [
						'type' => 'number',
						'required' => true,
						'description' => 'The component ID to unlock',
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/lock-status', [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_lock_status( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'componentId' => [
						'type' => 'string',
						'required' => true,
						'description' => 'The component ID to check lock status',
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

	private function lock_component( \WP_REST_Request $request ) {
		$component_id = $request->get_param( 'componentId' );
		$success = $this->get_lock_component_manager()->lock( $component_id );

		if ( ! $success ) {
			return Error_Builder::make( 'lock_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to lock component', 'elementor' ) )
				->build();
		}

		return Response_Builder::make( [ 'locked' => true ] )->build();
	}

	private function unlock_component( \WP_REST_Request $request ) {
		$component_id = $request->get_param( 'componentId' );
		$success = $this->get_lock_component_manager()->unlock( $component_id );

		if ( ! $success ) {
			return Error_Builder::make( 'unlock_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to unlock component', 'elementor' ) )
				->build();
		}
		return Response_Builder::make( [ 'unlocked' => $success ] )->build();
	}

	private function get_lock_status( \WP_REST_Request $request ) {
		$component_id = $request->get_param( 'componentId' );
		$lock_data = $this->get_lock_component_manager()->is_locked( $component_id );
		$is_current_user_allow_to_edit = $this->is_current_user_allow_to_edit( $component_id );

		$locked_by = '';
		if ( $lock_data['is_locked'] ) {
			$locked_user = get_user_by( 'id', $lock_data['lock_user'] );
			$locked_by = $locked_user ? $locked_user->display_name : '';
		}

		return Response_Builder::make( [
			'is_current_user_allow_to_edit' => $is_current_user_allow_to_edit,
			'locked_by' => $locked_by,
		] )->build();
	}

	private function is_current_user_allow_to_edit( $component_id ) {
		$current_user_id = get_current_user_id();
		$lock_data = $this->get_lock_component_manager()->is_locked( $component_id );

		return ! $lock_data['is_locked'] || (int) $lock_data['lock_user'] === (int) $current_user_id;
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
