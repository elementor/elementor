<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Usage\Applied_Global_Classes_Usage;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'global-classes';
	const API_BASE_USAGE = self::API_BASE . '/usage';
	const API_BASE_POST = self::API_BASE . '/post';
	const API_BASE_STYLES = self::API_BASE . '/styles';
	const MAX_ITEMS = 100;
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;
	private $repository = null;
	private ?Global_Classes_Relations $relations = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Global_Classes_Repository();
		}

		return $this->repository;
	}

	private function get_classes_relations(): Global_Classes_Relations {
		if ( ! $this->relations ) {
			$this->relations = new Global_Classes_Relations();
		}

		return $this->relations;
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->all( $request ) ),
				'permission_callback' => fn() => is_user_logged_in(),
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

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE_POST, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->styles_for_post( $request ) ),
				'permission_callback' => fn() => is_user_logged_in(),
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
					'post_id' => [
						'type' => 'integer',
						'required' => true,
					],
				],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE_STYLES, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->styles_by_ids( $request ) ),
				'permission_callback' => fn() => is_user_logged_in(),
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
					'ids' => [
						'type' => 'string',
						'required' => true,
						'description' => 'Comma-separated list of global class IDs',
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
		$items = $classes->get_items()->all();
		$order = $classes->get_order()->all();

		$list = [];

		foreach ( $order as $id ) {
			if ( isset( $items[ $id ] ) ) {
				$list[] = [
					'id' => $id,
					'label' => $items[ $id ]['label'] ?? $id,
				];
			}
		}

		return Response_Builder::make( $list )->build();
	}

	private function styles_for_post( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );
		$post_id = (int) $request->get_param( 'post_id' );

		$document_class_ids = $this->get_classes_relations()->get_styles_by_post( $post_id );

		if ( empty( $document_class_ids ) ) {
			return Response_Builder::make( (object) [] )->set_meta( [ 'order' => [] ] )->build();
		}

		$classes = $this->get_repository()->context( $context )->all();
		$items = $classes->get_items()->all();
		$order = $classes->get_order()->all();

		$filtered_order = array_values( array_intersect( $order, $document_class_ids ) );

		$result = [];

		foreach ( $document_class_ids as $id ) {
			$result[ $id ] = $items[ $id ] ?? null;
		}

		return Response_Builder::make( (object) $result )
			->set_meta( [ 'order' => $filtered_order ] )
			->build();
	}

	private function styles_by_ids( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );
		$ids_param = $request->get_param( 'ids' );

		$requested_ids = array_map( 'trim', explode( ',', $ids_param ) );
		$requested_ids = array_filter( $requested_ids );

		if ( empty( $requested_ids ) ) {
			return Response_Builder::make( (object) [] )->set_meta( [ 'order' => [] ] )->build();
		}

		$classes = $this->get_repository()->context( $context )->all();
		$items = $classes->get_items()->all();
		$order = $classes->get_order()->all();

		$filtered_order = array_values( array_intersect( $order, $requested_ids ) );

		$result = [];

		foreach ( $requested_ids as $id ) {
			$result[ $id ] = $items[ $id ] ?? null;
		}

		return Response_Builder::make( (object) $result )
			->set_meta( [ 'order' => $filtered_order ] )
			->build();
	}

	private function get_usage() {
		$classes_usage = ( new Applied_Global_Classes_Usage() )->get_detailed_usage();

		return Response_Builder::make( (object) $classes_usage )->build();
	}

	private function put( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );
		$changes = $request->get_param( 'changes' ) ?? [];
		$added_ids = $changes['added'] ?? [];
		$modified_ids = $changes['modified'] ?? [];
		$deleted_ids = $changes['deleted'] ?? [];
		$order = $request->get_param( 'order' ) ?? [];

		$repository = $this->get_repository()->context( $context );
		$existing_classes = $repository->all();
		$existing_items = $existing_classes->get_items()->all();
		$existing_labels = array_map( fn( $item ) => $item['label'], $existing_items );

		$parser = Global_Classes_Parser::make();
		$items_result = $parser->parse_items( $request->get_param( 'items' ) ?? [] );

		if ( ! $items_result->is_valid() ) {
			return Error_Builder::make( 'invalid_items' )
				->set_status( 400 )
				->set_message( 'Invalid items: ' . $items_result->errors()->to_string() )
				->build();
		}

		$touched_items = $items_result->unwrap();

		$total_count = count( $existing_items ) + count( $added_ids ) - count( $deleted_ids );

		if ( $total_count > self::MAX_ITEMS ) {
			return Error_Builder::make( 'global_classes_limit_exceeded' )
				->set_status( 400 )
				->set_meta( [
					'current_count' => $total_count,
					'max_allowed' => self::MAX_ITEMS,
				] )
				->set_message( sprintf(
					/* translators: %d: Maximum allowed items. */
					__( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ),
					self::MAX_ITEMS
				) )
				->build();
		}

		$order_error = $this->validate_order( $order, $touched_items, $existing_items, $added_ids, $deleted_ids );

		if ( $order_error ) {
			return $order_error;
		}

		$duplicated_labels = Global_Classes_Parser::check_for_duplicate_labels(
			$existing_labels,
			$touched_items,
			$added_ids
		);

		$duplicate_validation_result = null;

		if ( ! empty( $duplicated_labels ) ) {
			$modified_labels = $this->handle_duplicates( $duplicated_labels, $existing_labels );
			$duplicate_validation_result = $modified_labels;

			foreach ( $modified_labels as $item_id => $labels ) {
				$touched_items[ $item_id ]['label'] = $labels['modified'];
			}
		}

		$final_items = $this->merge_items( $existing_items, $touched_items, $deleted_ids );

		$repository->put( $final_items, $order );

		if ( $duplicate_validation_result ) {
			return Response_Builder::make( [
				'code' => 'DUPLICATED_LABEL',
				'modifiedLabels' => $duplicate_validation_result,
			] )->build();
		}

		return Response_Builder::make()->no_content()->build();
	}

	private function validate_order( array $order, array $touched_items, array $existing_items, array $added_ids, array $deleted_ids ) {
		$expected_ids = array_merge(
			array_keys( $existing_items ),
			$added_ids
		);

		$expected_ids = array_diff( $expected_ids, $deleted_ids );
		$expected_ids = array_unique( $expected_ids );

		$order_unique = array_unique( $order );

		$missing_in_order = array_diff( $expected_ids, $order_unique );
		$excess_in_order = array_diff( $order_unique, $expected_ids );

		$touched_ids = array_keys( $touched_items );
		$excess_in_order = array_diff( $excess_in_order, $touched_ids );

		if ( ! empty( $missing_in_order ) || ! empty( $excess_in_order ) ) {
			$errors = [];

			foreach ( $missing_in_order as $id ) {
				$errors[] = "$id: missing";
			}

			foreach ( $excess_in_order as $id ) {
				$errors[] = "$id: excess";
			}

			return Error_Builder::make( 'invalid_order' )
				->set_status( 400 )
				->set_message( 'Invalid order: ' . implode( ', ', $errors ) )
				->build();
		}

		return null;
	}

	private function merge_items( array $existing_items, array $touched_items, array $deleted_ids ): array {
		$result = [];

		foreach ( $existing_items as $id => $item ) {
			if ( ! in_array( $id, $deleted_ids, true ) ) {
				$result[ $id ] = $item;
			}
		}

		foreach ( $touched_items as $id => $item ) {
			$result[ $id ] = $item;
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

	private function handle_duplicates( array $duplicate_labels, array $existing_labels ) {

		$modified_labels = [];

		foreach ( $duplicate_labels as $duplicate_label ) {
			$item_id = $duplicate_label['item_id'];
			$original_label = $duplicate_label['label'];

			$modified_label = $this->generate_unique_label( $original_label, $existing_labels );

			$modified_labels[ $item_id ] = [
				'original' => $original_label,
				'modified' => $modified_label,
			];
		}

		return $modified_labels;
	}


	private function generate_unique_label( $original_label, $existing_labels ) {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		$has_prefix = strpos( $original_label, $prefix ) === 0;

		if ( $has_prefix ) {
			$base_label = substr( $original_label, strlen( $prefix ) );

			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				++$counter;
				$new_label = $prefix . $base_label . $counter;
			}

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix . $counter );
				$base_label = substr( $base_label, 0, $available_length );
				$new_label = $prefix . $base_label . $counter;
			}
		} else {
			$new_label = $prefix . $original_label;

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			$counter = 1;
			$base_label = substr( $original_label, 0, $available_length ?? strlen( $original_label ) );

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . $base_label . $counter;

				if ( strlen( $new_label ) > $max_length ) {
					$available_length = $max_length - strlen( $prefix . $counter );
					$base_label = substr( $original_label, 0, $available_length );
					$new_label = $prefix . $base_label . $counter;
				}

				++$counter;
			}
		}

		return $new_label;
	}
}
