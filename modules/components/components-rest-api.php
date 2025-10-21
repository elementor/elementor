<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Modules\Components\SaveAction\Save_Components_Action;
use Elementor\Modules\Components\SaveAction\Save_Components_DTO;
use Elementor\Modules\Components\SaveAction\Save_Components_Validator;
use Elementor\Plugin;

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
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->save_components( $request ) ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'changes' => [
						'type' => 'object',
						'required' => true,
						'properties' => [
							'added' => [
								'type' => 'array',
								'items' => [
									'type' => 'number',
								],
							],
							'deleted' => [
								'type' => 'array',
								'items' => [
									'type' => 'number',
								],
							],
							'modified' => [
								'type' => 'array',
								'items' => [
									'type' => 'number',
								],
							],
						],
					],
					'data' => [
						'type' => 'object',
						'required' => true,
						'additionalProperties' => [
							'type' => 'object',
							'properties' => [
								'title' => [
									'type' => 'string',
									'minLength' => 2,
									'maxLength' => 50,
									'sanitize_callback' => 'sanitize_text_field',
								],
								'status' => [
									'type' => 'string',
									'enum' => [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ],
								],
								'elements' => [
									'type' => 'array',
									'items' => [
										'type' => 'object',
									],
								],
							],
							'required' => [ 'title', 'status', 'elements' ],
						],
					],
				],
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

	private function save_components( \WP_REST_Request $request ) {
		// TODO: Bring all the components.
		get_posts( [

		] );
		$current = Collection::make();

		$dto = Save_Components_DTO::from_request( $request );

		$result = Save_Components_Validator::make( $current )->validate( $dto );

		if ( ! $result['success'] ) {
			return Error_Builder::make( 'components_validation_failed' )
				->set_status( 400 )
				->set_message( 'Validation failed: ' . implode( ', ', $result['messages'] ) )
				->build();
		}

		Save_Components_Action::make()->execute( $dto );

		return Response_Builder::make()->no_content()->build();
	}

	private function save_components2( \WP_REST_Request $request ) {
		$changes = $request->get_param( 'changes' ) ?? [];
		$data = $request->get_param( 'data' ) ?? [];

		$components = $this->get_repository()->all();

		$added = $changes['added'];
		$deleted = $changes['deleted'];
		$modified = $changes['modified'];

		$count = $components->count() + count( $added ) - count( $deleted );

		if ( $count > static::MAX_COMPONENTS ) {
			return Error_Builder::make( 'components_limit_exceeded' )
				->set_status( 400 )
				->set_message( sprintf(
					/* translators: %d: maximum components limit. */
					__( 'Components limit exceeded. Maximum allowed: %d', 'elementor' ),
					static::MAX_COMPONENTS
				) )
				->build();
		}

		$items_to_save = Collection::make( $data )
			->only( array_merge( $added, $modified ) );

		$components_to_save = $components
			->except( $deleted )
			->merge( $items_to_save );

		$existing_names = $components
			->except( $deleted )
			->map( fn( $component ) => $component['name'] )
			->all();

		$errors = $components_to_save->reduce( function ( $errors, $component ) use ( $existing_names ) {
			$name = trim( sanitize_text_field( $component['name'] ) );

			if ( strlen( $name ) < 2 ) {
				$errors[] = __( 'Component name too short. Minimum length is 2 characters.', 'elementor' );
			}

			if ( strlen( $name ) > 50 ) {
				$errors[] = __( 'Component name too long. Maximum length is 50 characters.', 'elementor' );
			}

			if ( in_array( $name, $existing_names, true ) ) {
				$errors[] = sprintf(
					/* translators: %s: component name. */
					__( 'Duplicated component name: %s', 'elementor' ),
					$name
				);
			}

			return $errors;
		}, [] );

		if ( ! empty( $errors ) ) {
			return Error_Builder::make( 'invalid_names' )
				->set_status( 400 )
				->set_message( 'Invalid component names: ' . implode( ', ', $errors ) )
				->build();
		}

		foreach ( $deleted as $component_id ) {
			$document = Plugin::$instance->documents->get( $component_id );

			if ( ! $document ) {
				continue;
			}

			if ( ! $document->is_built_with_elementor() ) {
				throw new \Exception( 'Not Built With Elementor' );
			}

			if ( ! ( $document instanceof Component ) ) {
				throw new \Exception( 'Invalid component document type' );
			}

			if ( ! $document->is_editable_by_current_user() ) {
				throw new \Exception( 'Not Editable By User' );
			}

			wp_delete_post( $component_id, true );
		}

		foreach ( array_merge( $added, $modified ) as $component_id ) {
			if ( ! in_array(
				$data[ $component_id ]['status'],
				[ Document::STATUS_PUBLISH, Document::STATUS_AUTOSAVE, Document::STATUS_DRAFT ],
				true
			) ) {
				throw new \Exception( 'Invalid Status' );
			}

			$status = $data[ $component_id ]['status'];

			$document = Plugin::$instance->documents->get( $component_id );

			if ( ! $document ) {
				if ( ! in_array( $status, [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT ], true ) ) {
					throw new \Exception( 'Invalid Status for new component' );
				}

				$document = Plugin::$instance->documents->create(
					Component::get_type(),
					[
						'post_status' => $status,
						'post_title' => $data[ $component_id ]['title'],
					]
				);
			}

			if ( ! $document->is_built_with_elementor() ) {
				throw new \Exception( 'Not Built With Elementor' );
			}

			if ( ! ( $document instanceof Component ) ) {
				throw new \Exception( 'Invalid component document type' );
			}

			if ( ! $document->is_editable_by_current_user() ) {
				throw new \Exception( 'Not Editable By User' );
			}

			if (
				Document::STATUS_AUTOSAVE === $status &&
				$document->get_post()->post_status === Document::STATUS_PUBLISH
			) {
				// If the post is a draft - save the `autosave` to the original draft.
				// Allow a revision only if the original post is already published.
				$document = $document->get_autosave( 0, true );
			}

			$data = [
				'settings' => [
					'post_status' => $status,
					'post_title' => $data[ $component_id ]['title'],
				],
				'elements' => $data[ $component_id ]['elements'],
			];

			$document->save( $data );
		}

		return Response_Builder::make()->no_content()->build();
	}

	private function create_component( \WP_REST_Request $request ) {
		$components = $this->get_repository()->all();

		$components_count = $components->count();

		if ( $components_count >= static::MAX_COMPONENTS ) {
			return Error_Builder::make( 'components_limit_exceeded' )
				->set_status( 400 )
				->set_message( sprintf(
					/* translators: %d: maximum components limit. */
					__( 'Components limit exceeded. Maximum allowed: %d', 'elementor' ),
					static::MAX_COMPONENTS
				) )
				->build();
		}

		$parser = Components_Parser::make();

		$name_result = $parser->parse_name( $request->get_param( 'name' ), $components->map( fn( $component ) => $component['name'] )->all() );

		if ( ! $name_result->is_valid() ) {
			return Error_Builder::make( 'invalid_name' )
				->set_status( 400 )
				->set_message( 'Invalid component name: ' . $name_result->errors()->to_string() )
				->build();
		}

		$name = $name_result->unwrap();
		// The content is validated & sanitized in the document save process.
		$content = $request->get_param( 'content' );
		$status = $request->get_param( 'status' );

		try {
			$component_id = $this->get_repository()->create( $name, $content, $status );

			return Response_Builder::make( [ 'component_id' => $component_id ] )->set_status( 201 )->build();
		} catch ( \Exception $e ) {
			$error_message = $e->getMessage();

			$invalid_elements_structure_error = str_contains( $error_message, 'Invalid data' );
			$atomic_styles_validation_error = str_contains( $error_message, 'Styles validation failed' );
			$atomic_settings_validation_error = str_contains( $error_message, 'Settings validation failed' );

			if ( $invalid_elements_structure_error || $atomic_styles_validation_error || $atomic_settings_validation_error ) {
				return Error_Builder::make( 'content_validation_failed' )
											->set_status( 400 )
											->set_message( $error_message )
											->build();
			}

			throw $e;
		}
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
