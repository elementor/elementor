<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Usage\Applied_Global_Classes_Usage;
use Elementor\Modules\GlobalClasses\Utils\Error_Builder;
use Elementor\Modules\GlobalClasses\Utils\Response_Builder;
use Elementor\Modules\GlobalClasses\Services\Global_Classes_Validation_Service;
use Elementor\Modules\GlobalClasses\Services\Global_Classes_Changes_Service;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'global-classes';
	const API_BASE_USAGE = self::API_BASE . '/usage';
	const MAX_ITEMS = 50;

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

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->all( $request ) ),
				'permission_callback' => fn() => true,
				'args' => [
					'context' => [
						'type' => 'string',
						'required' => false,
						'default' => Global_Classes_Repository::CONTEXT_FRONTEND,
						'enum' => [
							Global_Classes_Repository::CONTEXT_FRONTEND,
							Global_Classes_Repository::CONTEXT_PREVIEW,
						],
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE_USAGE, [
			[
				'callback' => fn() => $this->route_wrapper( fn() => $this->get_usage() ),
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'context' => [
						'type' => 'string',
						'required' => false,
						'default' => Global_Classes_Repository::CONTEXT_FRONTEND,
						'enum' => [
							Global_Classes_Repository::CONTEXT_FRONTEND,
							Global_Classes_Repository::CONTEXT_PREVIEW,
						],
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'PUT',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->put( $request ) ),
				'permission_callback' => fn() => current_user_can( Add_Capabilities::UPDATE_CLASS ),
				'args' => [
					'context' => [
						'type' => 'string',
						'required' => false,
						'default' => Global_Classes_Repository::CONTEXT_FRONTEND,
						'enum' => [
							Global_Classes_Repository::CONTEXT_FRONTEND,
							Global_Classes_Repository::CONTEXT_PREVIEW,
						],
					],
					'changes' => [
						'type' => 'object',
						'required' => true,
						'additionalProperties' => false,
						'properties' => [
							'added' => [
								'type' => 'array',
								'required' => true,
								'items' => [ 'type' => 'string' ],
							],
							'deleted' => [
								'type' => 'array',
								'required' => true,
								'items' => [ 'type' => 'string' ],
							],
							'modified' => [
								'type' => 'array',
								'required' => true,
								'items' => [ 'type' => 'string' ],
							],
						],
					],
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

	private function all( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );

		$classes = $this->get_repository()->context( $context )->all();

		return Response_Builder::make( (object) $classes->get_items()->all() )
								->set_meta( [ 'order' => $classes->get_order()->all() ] )
													->build();
	}

	private function get_usage() {
		$classes_usage = ( new Applied_Global_Classes_Usage() )->get_detailed_usage();

		return Response_Builder::make( (object) $classes_usage )->build();
	}

	private function put( \WP_REST_Request $request ) {
		// Log debug information

		$context = $request->get_param( 'context' );
		$changes = $request->get_param( 'changes' ) ?? [];

		// Initialize services
		$validation_service = new Global_Classes_Validation_Service();
		$changes_service = new Global_Classes_Changes_Service();

		// Check if there are actual changes
		$has_changes = $changes_service->has_changes( $changes );

		$parser = Global_Classes_Parser::make();
		$existing_items = Global_Classes_Repository::make()
			->context( $context )
			->all()
			->get_items()
			->map( function ( $item ) {
				return [
					'id' => $item['id'],
					'label' => $item['label'],
				];
			} )
			->all();

		// Validate and modify duplicate labels for added items (only when there are changes)
		$validation_result = null;
		if ( $has_changes ) {
			$validation_result = $validation_service->validate_new_items_labels(
				$request->get_param( 'items' ),
				$existing_items,
				$changes
			);

			// Update request items if labels were modified
			if ( ! empty( $validation_result['items'] ) ) {
				$request->set_param( 'items', $validation_result['items'] );
			}

			// Log if any labels were modified
		}

		$items_result = $parser->parse_items(
			$request->get_param( 'items' ),
		);

		// Validate items count
		$items_count_error = $validation_service->validate_items_count( $items_result->unwrap() );
		if ( $items_count_error ) {
			return $items_count_error;
		}

		if ( ! $items_result->is_valid() ) {
			$first_error = $items_result->errors()->first_one();
			$code = $first_error['error'] ?? Global_Classes_Errors::INVALID_ITEMS;

			// Log validation errors

			return Error_Builder::make( $code )
				->set_status( 400 )
				->set_meta( [
					'validation_errors' => $items_result->errors()->all(),
					'required_fields' => [ 'id', 'variants', 'type', 'label' ],
					'valid_types' => [ 'class' ],
				] )
				->set_message( 'Invalid items: ' . $items_result->errors()->to_string() )
				->build();
		}

		$order_result = $parser->parse_order(
			$request->get_param( 'order' ),
			$items_result->unwrap()
		);

		if ( ! $order_result->is_valid() ) {
			$first_error = $order_result->errors()->first_one();
			$code = $first_error['error'] ?? Global_Classes_Errors::INVALID_ORDER;

			// Log order validation errors

			return Error_Builder::make( $code )
				->set_status( 400 )
				->set_meta( [
					'validation_errors' => $order_result->errors()->all(),
					'items_count' => count( $items_result->unwrap() ),
					'order_count' => count( $request->get_param( 'order' ) ?? [] ),
					'expected_count' => count( $items_result->unwrap() ),
				] )
				->set_message( 'Invalid order: ' . $order_result->errors()->to_string() )
				->build();
		}

		$repository = $this->get_repository()
			->context( $request->get_param( 'context' ) );

		$changes_resolver = Global_Classes_Changes_Resolver::make(
			$repository,
			$changes,
		);

		// Final validation check to handle concurrency issues
		$final_validation = $validation_service->perform_final_validation(
			$items_result->unwrap(),
			$existing_items,
			$changes
		);

		if ( $final_validation['has_changes'] ) {
			// Update the items with final validation results
			$final_items = $final_validation['items'];
			$final_validation_result = $final_validation['validation_result'];
		} else {
			$final_items = $items_result->unwrap();
			$final_validation_result = $validation_result;
		}

		$repository->put(
			$changes_resolver->resolve_items( $final_items ),
			$changes_resolver->resolve_order( $order_result ? $order_result->unwrap() : [] ),
		);

		// Build response data using the changes service
		$response_data = $changes_service->build_response_data( $changes, $final_validation_result );
		$response_meta = $changes_service->build_response_meta( $changes );

		return Response_Builder::make( $response_data )
			->set_meta( $response_meta )
			->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( Global_Classes_Errors::UNEXPECTED_ERROR )
				->set_status( 500 )
				->set_meta( [
					'exception_class' => get_class( $e ),
					'exception_file' => $e->getFile(),
					'exception_line' => $e->getLine(),
				] )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}

		return $response;
	}
}
