<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Modules\Components\OverridableProps\Component_Overridable_Props_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'components';
	const LOCK_DOCUMENT_TYPE_NAME = 'components';
	const STYLES_ROUTE = 'styles';
	const MAX_COMPONENTS = 100;

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

	/**
	 * @return Component_Lock_Manager instance
	 */
	private function get_component_lock_manager() {
		return Component_Lock_Manager::get_instance();
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
								'uid' => [
									'type' => 'string',
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
								'settings' => [
									'type' => 'object',
									'required' => false,
								],
							],
						],
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/create-validate', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->create_validate_components( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'items' => [
						'type' => 'array',
						'required' => true,
						'items' => [
							'type' => 'object',
							'properties' => [
								'uid' => [
									'type' => 'string',
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
								'settings' => [
									'type' => 'object',
									'required' => false,
								],
							],
						],
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/overridable-props', [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_overridable_props( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args' => [
					'componentId' => [
						'type' => 'integer',
						'required' => true,
						'description' => 'The component ID to get overridable props for',
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/status', [
			[
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->update_statuses( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'status' => [
						'type' => 'string',
						'required' => true,
						'enum' => [ Document::STATUS_PUBLISH ],
					],
					'ids' => [
						'type' => 'array',
						'required' => true,
						'items' => [
							'type' => 'number',
							'required' => true,
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

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/archive', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->archive_components( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'componentIds' => [
						'type' => 'array',
						'items' => [
							'type' => 'number',
							'required' => true,
						],
						'required' => true,
						'description' => 'The component IDs to archive',
					],
					'status' => [
						'type' => 'string',
						'enum' => [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ],
						'required' => true,
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/update-titles', [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->update_components_title( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'components' => [
						'type' => 'array',
						'required' => true,
						'items' => [
							'type' => 'object',
							'properties' => [
								'componentId' => [
									'type' => 'number',
									'required' => true,
									'description' => 'The component ID to update title',
								],
								'title' => [
									'type' => 'string',
									'required' => true,
									'description' => 'The new title for the component',
								],
							],
						],
					],
					'status' => [
						'type' => 'string',
						'enum' => [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ],
						'required' => true,
					],
				],
			],
		] );
	}

	private function get_components() {
		$components = $this->get_repository()->all();

		$components_list = array_values( $components
			->map( fn( $component ) => [
				'id' => $component['id'],
				'name' => $component['title'],
				'uid' => $component['uid'],
				'isArchived' => $component['is_archived'] ?? false,
			] )
		->all() );

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

	private function get_overridable_props( \WP_REST_Request $request ) {
		$component_id = (int) $request->get_param( 'componentId' );

		if ( ! $component_id ) {
			return Error_Builder::make( 'invalid_component_id' )
				->set_status( 400 )
				->set_message( __( 'Invalid component ID', 'elementor' ) )
				->build();
		}

		$document = $this->get_repository()->get( $component_id );

		if ( ! $document ) {
			return Error_Builder::make( 'component_not_found' )
				->set_status( 404 )
				->set_message( __( 'Component not found', 'elementor' ) )
				->build();
		}

		$overridable = $document->get_json_meta( Component::OVERRIDABLE_PROPS_META_KEY ) ?? null;

		if ( empty( $overridable ) ) {
			$overridable = null;
		}

		return Response_Builder::make( $overridable )->build();
	}

	private function create_components( \WP_REST_Request $request ) {
		$save_status = $request->get_param( 'status' );

		$items = Collection::make( $request->get_param( 'items' ) );
		$components = $this->get_repository()->all();

		$result = Save_Components_Validator::make( $components )->validate( $items );

		if ( ! $result['success'] ) {
			return Error_Builder::make( 'components_validation_failed' )
				->set_status( 422 )
				->set_message( 'Validation failed: ' . implode( ', ', $result['messages'] ) )
				->build();
		}

		$circular_result = Circular_Dependency_Validator::make()->validate_new_components( $items );

		if ( ! $circular_result['success'] ) {
			return Error_Builder::make( 'circular_dependency_detected' )
				->set_status( 422 )
				->set_message( __( "Can't add this component - components that contain each other can't be nested.", 'elementor' ) )
				->set_meta( [ 'caused_by' => $circular_result['messages'] ] )
				->build();
		}

		$non_atomic_result = Non_Atomic_Widget_Validator::make()->validate_items( $items );

		if ( ! $non_atomic_result['success'] ) {
			return Error_Builder::make( Non_Atomic_Widget_Validator::ERROR_CODE )
				->set_status( 422 )
				->set_message( __( 'Components require atomic elements only. Remove widgets to create this component.', 'elementor' ) )
				->set_meta( [ 'non_atomic_elements' => $non_atomic_result['non_atomic_elements'] ] )
				->build();
		}

		$validation_errors = [];

		$created = $items->map_with_keys( function ( $item ) use ( $save_status, &$validation_errors ) {
			$title = sanitize_text_field( $item['title'] );
			$content = $item['elements'];
			$uid = $item['uid'];

			try {
				$settings = isset( $item['settings'] ) ? $this->parse_settings( $item['settings'] ) : [];

				$status = Document::STATUS_AUTOSAVE === $save_status
					? Document::STATUS_DRAFT
					: $save_status;

				$component_id = $this->get_repository()->create( $title, $content, $status, $uid, $settings );

				return [ $uid => $component_id ];
			} catch ( \Exception $e ) {
				$validation_errors[ $uid ] = $e->getMessage();
				return [ $uid => null ];
			}
		} );

		if ( ! empty( $validation_errors ) ) {
			return Error_Builder::make( 'settings_validation_failed' )
				->set_status( 422 )
				->set_message( 'Settings validation failed: ' . json_encode( $validation_errors ) )
				->build();
		}

		return Response_Builder::make( $created->all() )
			->set_status( 201 )
			->build();
	}

	private function update_statuses( \WP_REST_Request $request ) {
		$result = Collection::make( $request->get_param( 'ids' ) )
			->reduce(
				function ( $result, int $component_id ) {
					$component = $this->get_repository()->get( $component_id );

					if ( ! $component ) {
						$result['failed'][] = $component_id;
						return $result;
					}

					$publish_result = $this->get_repository()->publish_component( $component );

					$result[ $publish_result ? 'success' : 'failed' ][] = $component_id;

					return $result;
				},
				[
					'success' => [],
					'failed' => [],
				]
			);

		return Response_Builder::make( $result )->build();
	}

	private function lock_component( \WP_REST_Request $request ) {
		$component_id = $request->get_param( 'componentId' );
		try {
			$success = $this->get_component_lock_manager()->lock( $component_id );
		} catch ( \Exception $e ) {
			error_log( 'Components REST API lock_component error: ' . $e->getMessage() );
			return Error_Builder::make( 'lock_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to lock component', 'elementor' ) )
				->build();
		}

		if ( ! $success ) {
			return Error_Builder::make( 'lock_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to lock component', 'elementor' ) )
				->build();
		}

		return Response_Builder::make( [ 'locked' => $success ] )->build();
	}

	private function unlock_component( \WP_REST_Request $request ) {
		$component_id = $request->get_param( 'componentId' );
		try {
			$success = $this->get_component_lock_manager()->unlock( $component_id );
		} catch ( \Exception $e ) {
			error_log( 'Components REST API unlock_component error: ' . $e->getMessage() );
			return Error_Builder::make( 'unlock_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to unlock component', 'elementor' ) )
				->build();
		}

		if ( ! $success ) {
			return Error_Builder::make( 'unlock_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to unlock component', 'elementor' ) )
				->build();
		}
		return Response_Builder::make( [ 'unlocked' => $success ] )->build();
	}

	private function get_lock_status( \WP_REST_Request $request ) {
		$component_id = (int) $request->get_param( 'componentId' );
		try {
			$lock_manager = $this->get_component_lock_manager();
			if ( $lock_manager->is_lock_expired( $component_id ) ) {
				$lock_manager->unlock( $component_id );
			}

			$lock_data = $lock_manager->get_lock_data( $component_id );
			$current_user_id = get_current_user_id();

			// if current  user is the lock user, return true
			if ( $lock_data['locked_by'] && $lock_data['locked_by'] === $current_user_id ) {
				return Response_Builder::make( [
					'is_current_user_allow_to_edit' => true,
					'locked_by' => get_user_by( 'id', $lock_data['locked_by'] )->display_name,
				] )->build();
			}

			// if the user is not the lock user, return false
			if ( $lock_data['locked_by'] && $lock_data['locked_by'] !== $current_user_id ) {
				return Response_Builder::make( [
					'is_current_user_allow_to_edit' => false,
					'locked_by' => get_user_by( 'id', $lock_data['locked_by'] )->display_name,
				] )->build();
			}

			// if the component is not locked, return true
			if ( ! $lock_data['locked_by'] ) {
				return Response_Builder::make( [
					'is_current_user_allow_to_edit' => true,
					'locked_by' => null,
				] )->build();
			}
		} catch ( \Exception $e ) {
			error_log( 'Components REST API get_lock_status error: ' . $e->getMessage() );
			return Error_Builder::make( 'get_lock_status_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to get lock status', 'elementor' ) )
				->build();
		}
	}

	private function archive_components( \WP_REST_Request $request ) {
		$component_ids = $request->get_param( 'componentIds' );
		$status = $request->get_param( 'status' );

		try {
			$result = $this->get_repository()->archive( $component_ids, $status );
		} catch ( \Exception $e ) {
			error_log( 'Components REST API archive_components error: ' . $e->getMessage() );
			return Error_Builder::make( 'archive_failed' )
				->set_meta( [ 'error' => $e->getMessage() ] )
				->set_status( 500 )
				->set_message( __( 'Failed to archive components', 'elementor' ) )
				->build();
		}
		return Response_Builder::make( $result )->build();
	}

	private function update_components_title( \WP_REST_Request $request ) {
		$failed_ids = [];
		$success_ids = [];
		$components = $request->get_param( 'components' );
		$status = $request->get_param( 'status' );

		foreach ( $components as $component ) {
			$is_success = $this->get_repository()->update_title( $component['componentId'], $component['title'], $status );

			if ( ! $is_success ) {
				$failed_ids[] = $component['componentId'];
				continue;
			}
			$success_ids[] = $component['componentId'];

		}
		return Response_Builder::make( [
			'failedIds' => $failed_ids,
			'successIds' => $success_ids,
		] )->build();
	}

	private function create_validate_components( \WP_REST_Request $request ) {
		$items = Collection::make( $request->get_param( 'items' ) );
		$components = $this->get_repository()->all();

		$result = Save_Components_Validator::make( $components )->validate( $items );

		if ( ! $result['success'] ) {
			return Error_Builder::make( 'components_validation_failed' )
				->set_status( 422 )
				->set_message( 'Validation failed: ' . implode( ', ', $result['messages'] ) )
				->build();
		}

		$circular_result = Circular_Dependency_Validator::make()->validate_new_components( $items );

		if ( ! $circular_result['success'] ) {
			return Error_Builder::make( 'circular_dependency_detected' )
				->set_status( 422 )
				->set_message( __( "Can't add this component - components that contain each other can't be nested.", 'elementor' ) )
				->set_meta( [ 'caused_by' => $circular_result['messages'] ] )
				->build();
		}

		$non_atomic_result = Non_Atomic_Widget_Validator::make()->validate_items( $items );

		if ( ! $non_atomic_result['success'] ) {
			return Error_Builder::make( Non_Atomic_Widget_Validator::ERROR_CODE )
				->set_status( 422 )
				->set_message( __( 'Components require atomic elements only. Remove widgets to create this component.', 'elementor' ) )
				->set_meta( [ 'non_atomic_elements' => $non_atomic_result['non_atomic_elements'] ] )
				->build();
		}

		$validation_errors = $items->map_with_keys( function ( $item ) {
			try {
				if ( isset( $item['settings'] ) ) {
					$this->parse_settings( $item['settings'] );
				}
			} catch ( \Exception $e ) {
				return [ $item['uid'] => $e->getMessage() ];
			}

			return [ $item['uid'] => null ];
		} )
		->filter( fn( $value ) => null !== $value );

		if ( ! $validation_errors->is_empty() ) {
			return Error_Builder::make( 'settings_validation_failed' )
				->set_status( 422 )
				->set_message( 'Settings validation failed: ' . json_encode( $validation_errors->all() ) )
				->build();
		}

		return Response_Builder::make()
			->set_status( 200 )
			->build();
	}

	private function parse_settings( array $settings ): array {
		$result = [];

		if ( empty( $settings ) ) {
			return $result;
		}

		if ( isset( $settings['overridable_props'] ) ) {
			$parser = Component_Overridable_Props_Parser::make();
			$overridable_props_result = $parser->parse( $settings['overridable_props'] );

			if ( ! $overridable_props_result->is_valid() ) {
				throw new \Exception(
					esc_html( 'Validation failed for overridable_props: ' . $overridable_props_result->errors()->to_string() )
				);
			}

			$result['overridable_props'] = $overridable_props_result->unwrap();
		}

		return $result;
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
