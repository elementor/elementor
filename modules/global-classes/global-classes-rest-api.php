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
	const MAX_ITEMS = 50;
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;
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
		$context = $request->get_param( 'context' );
		$changes = $request->get_param( 'changes' ) ?? [];

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

		// Skip initial duplicate check - we'll do it once at the end with fresh data
		$validation_result = null;

		$items_result = $parser->parse_items(
			$request->get_param( 'items' )
		);

		$items_count = count( $items_result->unwrap() );

		// Validate items count
		if ( $items_count >= self::MAX_ITEMS ) {
			return Error_Builder::make( 'global_classes_limit_exceeded' )
				->set_status( 400 )
				->set_meta([
					'current_count' => $items_count,
					'max_allowed' => self::MAX_ITEMS,
				])
				->set_message(sprintf(
					/* translators: %d: Maximum allowed items. */
					__( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ),
					self::MAX_ITEMS
				))
				->build();
		}

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

		$repository = $this->get_repository()
			->context( $request->get_param( 'context' ) );

		$changes_resolver = Global_Classes_Changes_Resolver::make(
			$repository,
			$changes,
		);

		// Single duplicate check with fresh data - handles both initial and final validation
		$duplicate_validation = $this->check_for_duplicate_labels(
			$existing_items,
			$items_result->unwrap(),
			$changes,
			true // Handle duplicates
		);

		// Use the validation result if duplicates were found and handled
		if ( false !== $duplicate_validation ) {
			$final_items = $duplicate_validation['items'];
			$final_validation_result = $duplicate_validation;
		} else {
			$final_items = $items_result->unwrap();
			$final_validation_result = null;
		}

		if ( false !== $duplicate_validation ) {
			$repository->put(
				$changes_resolver->resolve_items( $final_items ),
				$changes_resolver->resolve_order( $order_result ? $order_result->unwrap() : [] ),
			);

			// Build response data using the changes service
			$response_data = $this->build_response_data( $changes, $final_validation_result );
			$response_meta = $this->build_response_meta( $changes );

			// Get the final state after saving
			$final_classes = $this->get_repository()->context( $context )->all();

			// Add items and order to response data
			$response_data['items'] = $final_classes->get_items()->all();
			$response_data['order'] = $final_classes->get_order()->all();

			return Response_Builder::make( $response_data )
			->set_meta( $response_meta )
			->build();
		} else {

			$repository = $this->get_repository()
				->context( $request->get_param( 'context' ) );

			$changes_resolver = Global_Classes_Changes_Resolver::make(
				$repository,
				$request->get_param( 'changes' ) ?? [],
			);

			$repository->put(
				$changes_resolver->resolve_items( $items_result->unwrap() ),
				$changes_resolver->resolve_order( $order_result->unwrap() ),
			);

			return Response_Builder::make()->no_content()->build();
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

	/**
	 * Check for duplicate labels and optionally handle them
	 *
	 * @param array $existing_items The existing items from database
	 * @param array $request_items The items being requested
	 * @param array $changes The changes being made
	 * @param bool $handle_duplicates Whether to handle duplicates by generating unique labels
	 * @return array|false Array containing duplicate information or false if no duplicates
	 */
	private function check_for_duplicate_labels( $existing_items, $request_items, $changes, $handle_duplicates = false ) {
		// If no changes are being made, no duplicates to check
		if ( empty( $changes['added'] ) ) {
			return false;
		}

		// Get existing labels from database
		$existing_labels = array_column( $existing_items, 'label' );

		// Get all current labels (including existing and new items)
		$all_current_labels = [];
		foreach ( $request_items as $item_id => $item ) {
			$label = $item['label'] ?? '';
			if ( ! empty( $label ) ) {
				$all_current_labels[ $item_id ] = $label;
			}
		}

		// Get new items that are being added
		$added_item_ids = $changes['added'] ?? [];
		$duplicates = [];

		foreach ( $added_item_ids as $item_id ) {
			if ( ! isset( $request_items[ $item_id ] ) ) {
				continue;
			}

			$new_item = $request_items[ $item_id ];
			$new_label = $new_item['label'] ?? '';

			// Skip empty labels
			if ( empty( $new_label ) ) {
				continue;
			}

			// Check if label already exists in database OR in current request
			$is_duplicate = false;

			// Check against existing database labels
			if ( in_array( $new_label, $existing_labels, true ) ) {
				$is_duplicate = true;
			}

			// Check against other items in the current request
			foreach ( $all_current_labels as $other_item_id => $other_label ) {
				if ( $other_item_id !== $item_id && $other_label === $new_label ) {
					$is_duplicate = true;
					break;
				}
			}

			if ( $is_duplicate ) {
				$duplicates[] = [
					'item_id' => $item_id,
					'label' => $new_label,
				];
			}
		}

		// If no duplicates found, return false
		if ( empty( $duplicates ) ) {
			return false;
		}

		// If not handling duplicates, just return the duplicate info
		if ( ! $handle_duplicates ) {
			return [
				'duplicates' => $duplicates,
				'all_current_labels' => $all_current_labels,
			];
		}

		// Handle duplicates by generating unique labels
		$modified_items = $request_items;
		$modified_labels = [];

		foreach ( $duplicates as $duplicate ) {
			$item_id = $duplicate['item_id'];
			$original_label = $duplicate['label'];

			$modified_label = $this->generate_unique_label( $original_label, array_values( $all_current_labels ) );

			$modified_items[ $item_id ]['label'] = $modified_label;

			$modified_labels[] = [
				'original' => $original_label,
				'modified' => $modified_label,
				'id' => $item_id,
			];

			// Update the all_current_labels array to reflect the change
			$all_current_labels[ $item_id ] = $modified_label;
		}

		return [
			'is_valid' => true,
			'message' => empty( $modified_labels ) ? '' : sprintf(
				/* translators: %d: Number of duplicate labels that were modified. */
				__( 'Modified %d duplicate labels automatically.', 'elementor' ),
				count( $modified_labels )
			),
			'meta' => [
				'modifiedLabels' => $modified_labels,
			],
			'items' => $modified_items,
		];
	}

	/**
	 * Generates a unique label that respects the character limit
	 *
	 * @param string $original_label The original label
	 * @param array $existing_labels Array of existing labels
	 * @return string The modified unique label
	 */
	private function generate_unique_label( $original_label, $existing_labels ) {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		// Check if the original label already has a prefix
		$has_prefix = strpos( $original_label, $prefix ) === 0;

		if ( $has_prefix ) {
			// Extract the base label (remove existing prefix)
			$base_label = substr( $original_label, strlen( $prefix ) );

			// Find the next available number
			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				++$counter;
				$new_label = $prefix . $base_label . $counter;
			}

			// If still too long, slice the base label
			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix . $counter );
				$base_label = substr( $base_label, 0, $available_length );
				$new_label = $prefix . $base_label . $counter;
			}
		} else {
			// Simple case: just add prefix
			$new_label = $prefix . $original_label;

			// If too long, slice the original label
			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			// Check if this label already exists, if so, add a number
			$counter = 1;
			$base_label = substr( $original_label, 0, $available_length ?? strlen( $original_label ) );

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . $base_label . $counter;

				// If too long, slice more from the base
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

	/**
	 * Builds response data with information about changes made
	 *
	 * @param array $changes Changes array from request
	 * @param array|null $validation_result Validation result with modified labels
	 * @return array Response data
	 */
	private function build_response_data( $changes, $validation_result = null ) {
		$response_data = [
			'message' => __( 'Global classes saved successfully.', 'elementor' ),
			'added_count' => count( $changes['added'] ?? [] ),
			'modified_count' => count( $changes['modified'] ?? [] ),
			'deleted_count' => count( $changes['deleted'] ?? [] ),
			'changes' => $changes,
		];

		// Add information about modified labels if any
		if ( $validation_result && ! empty( $validation_result['meta']['modifiedLabels'] ) ) {
			$response_data['code'] = 'DUPLICATED_LABEL';
			$response_data['message'] = $validation_result['message'];
			$response_data['modifiedLabels'] = $validation_result['meta']['modifiedLabels'];
			$response_data['duplicate_labels_handled'] = count( $validation_result['meta']['modifiedLabels'] );
		}

		return $response_data;
	}

	/**
	 * Builds response metadata with total changes count
	 *
	 * @param array $changes Changes array from request
	 * @return array Response metadata
	 */
	private function build_response_meta( $changes ) {
		return [
			'total_changes' => array_sum( [
				count( $changes['added'] ?? [] ),
				count( $changes['modified'] ?? [] ),
				count( $changes['deleted'] ?? [] ),
			] ),
		];
	}
}
