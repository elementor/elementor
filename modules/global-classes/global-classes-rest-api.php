<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Usage\Applied_Global_Classes_Usage;
use Elementor\Modules\GlobalClasses\Utils\Error_Builder;
use Elementor\Modules\GlobalClasses\Utils\Response_Builder;
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

		$debug_data = [
			'url' => $request->get_route(),
			'params' => $request->get_params(),
			'body' => $request->get_body(),
			'headers' => $request->get_headers(),
		];

		// Check if changes arrays are empty
		$is_changes = $this->check_changes_empty($request);

		$context = $request->get_param( 'context' );

		$parser = Global_Classes_Parser::make();
		$existing_items = Global_Classes_Repository::make()
			->context($context)
			->all()
			->get_items()
			->map(function ($item) {
				return [
					'id'    => $item['id'],
					'label' => $item['label'],
				];
			})
			->all();

		// Validate and modify duplicate labels for added items (only when there are changes)
		$validation_result = null;
		if ($is_changes) {
			$validation_result = $this->validate_new_items_labels($request, $existing_items);
			
			// Log if any labels were modified
			if (!empty($validation_result['meta']['modified_labels'])) {
				error_log('Elementor Global Classes: Modified duplicate labels: ' . json_encode($validation_result['meta']['modified_labels']));
			}
		}
			
		$items_result = $parser->parse_items(
			$request->get_param( 'items' ),
		);

		$items_count = count( $items_result->unwrap() );

		if ( $items_count >= static::MAX_ITEMS ) {
			return Error_Builder::make( Global_Classes_Errors::ITEMS_LIMIT_EXCEEDED )
			                    ->set_status( 400 )
			                    ->set_meta([
			                    	'current_count' => $items_count,
			                    	'max_allowed' => static::MAX_ITEMS
			                    ])
			                    ->set_message( sprintf(
				                    __( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ),
				                    static::MAX_ITEMS
			                    ) )
			                    ->build();
		}

			if (! $items_result->is_valid()) {
				$first_error = $items_result->errors()->first_one();
				$code = $first_error['error'] ?? Global_Classes_Errors::INVALID_ITEMS;

				// Log validation errors
				error_log('Elementor Global Classes: Invalid items. Errors: ' . $items_result->errors()->to_string());

				return Error_Builder::make($code)
					->set_status(400)
					->set_meta([
						'validation_errors' => $items_result->errors()->all(),
						'required_fields' => ['id', 'variants', 'type', 'label'],
						'valid_types' => ['class']
					])
					->set_message('Invalid items: ' . $items_result->errors()->to_string())
					->build();
			}

			$order_result = $parser->parse_order(
				$request->get_param('order'),
				$items_result->unwrap()
			);

			if (! $order_result->is_valid()) {
				$first_error = $order_result->errors()->first_one();
				$code = $first_error['error'] ?? Global_Classes_Errors::INVALID_ORDER;

				// Log order validation errors
				error_log('Elementor Global Classes: Invalid order. Errors: ' . $order_result->errors()->to_string());

				return Error_Builder::make($code)
					->set_status(400)
					->set_meta([
						'validation_errors' => $order_result->errors()->all(),
						'items_count' => count($items_result->unwrap()),
						'order_count' => count($request->get_param('order') ?? []),
						'expected_count' => count($items_result->unwrap())
					])
					->set_message('Invalid order: ' . $order_result->errors()->to_string())
					->build();
			}
		

		$repository = $this->get_repository()
		                   ->context( $request->get_param( 'context' ) );

		$changes_resolver = Global_Classes_Changes_Resolver::make(
			$repository,
			$request->get_param( 'changes' ) ?? [],
		);

		// Final validation check to handle concurrency issues
		$final_validation = $this->perform_final_validation($request, $items_result->unwrap());
		if ($final_validation['has_changes']) {
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

		// Return success response with information about changes made
		$response_data = [
			'message' => __('Global classes saved successfully.', 'elementor'),
			'added_count' => count($request->get_param('changes')['added'] ?? []),
			'modified_count' => count($request->get_param('changes')['modified'] ?? []),
			'deleted_count' => count($request->get_param('changes')['deleted'] ?? [])
		];

		// Add information about modified labels if any
		$response_validation_result = $final_validation_result ?? $validation_result;
		if ($response_validation_result && !empty($response_validation_result['meta']['modified_labels'])) {
			$response_data['code'] = Global_Classes_Errors::DUPLICATED_LABEL;
			$response_data['message'] = $response_validation_result['message'];
			$response_data['modified_labels'] = $response_validation_result['meta']['modified_labels'];
			$response_data['duplicate_labels_handled'] = count($response_validation_result['meta']['modified_labels']);
		}

		return Response_Builder::make($response_data)
			->set_meta([
				'total_changes' => array_sum([
					count($request->get_param('changes')['added'] ?? []),
					count($request->get_param('changes')['modified'] ?? []),
					count($request->get_param('changes')['deleted'] ?? [])
				])
			])
			->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( Global_Classes_Errors::UNEXPECTED_ERROR )
			->set_status(500)
			->set_meta([
				'exception_class' => get_class($e),
				'exception_file' => $e->getFile(),
				'exception_line' => $e->getLine()
			])
			->set_message( __( 'Something went wrong', 'elementor' ) )
			->build();
		}

		return $response;
	}

	private function check_changes_empty($request) {
		$changes = $request->get_param('changes') ?? [];
		
		if (!is_array($changes)) {
			error_log('Elementor REST API Debug - Changes is not an array: ' . json_encode($changes, JSON_PRETTY_PRINT));
			return false;
		}
		
		$has_non_empty_arrays = false;
		
		foreach ($changes as $key => $value) {
			if (is_array($value) && !empty($value)) {
				$has_non_empty_arrays = true;
				break;
			}
		}
		
		if (!$has_non_empty_arrays) {
			error_log('Elementor REST API Debug - All arrays in changes are empty: ' . json_encode($changes, JSON_PRETTY_PRINT));
		}
		
		return $has_non_empty_arrays;
	}

	private function validate_new_items_labels($request, $existing_items) {
		$changes = $request->get_param('changes') ?? [];
		$items = $request->get_param('items') ?? [];

		// If no changes are being made, validation passes
		if (empty($changes['added'])) {
			return [
				'is_valid' => true,
				'message' => '',
				'meta' => []
			];
		}
		
		// Get existing labels from database
		$existing_labels = array_column($existing_items, 'label');
		
		// Get all current labels (including existing and new items)
		$all_current_labels = [];
		foreach ($items as $item_id => $item) {
			$label = $item['label'] ?? '';
			if (!empty($label)) {
				$all_current_labels[$item_id] = $label;
			}
		}
		
		// Get new items that are being added
		$added_item_ids = $changes['added'] ?? [];
		$modified_items = [];
		$modified_labels = [];
		
		foreach ($added_item_ids as $item_id) {
			if (!isset($items[$item_id])) {
				continue;
			}
			
			$new_item = $items[$item_id];
			$new_label = $new_item['label'] ?? '';
			
			// Skip empty labels
			if (empty($new_label)) {
				continue;
			}
			
			// Check if label already exists in database OR in current request
			$is_duplicate = false;
			
			// Check against existing database labels
			if (in_array($new_label, $existing_labels, true)) {
				$is_duplicate = true;
			}
			
			// Check against other items in the current request
			foreach ($all_current_labels as $other_item_id => $other_label) {
				if ($other_item_id !== $item_id && $other_label === $new_label) {
					$is_duplicate = true;
					break;
				}
			}
			
			if ($is_duplicate) {
				$modified_label = $this->generate_unique_label($new_label, $all_current_labels);
				
				$items[$item_id]['label'] = $modified_label;
				
				$modified_items[] = $item_id;
				$modified_labels[] = [
					'original' => $new_label,
					'modified' => $modified_label,
					'item_id' => $item_id
				];
				
				// Update the all_current_labels array to reflect the change
				$all_current_labels[$item_id] = $modified_label;
			}
		}
		
		if (!empty($modified_items)) {
			$request->set_param('items', $items);
		}
		
		return [
			'is_valid' => true,
			'message' => empty($modified_labels) ? '' : sprintf(
				__('Modified %d duplicate labels automatically.', 'elementor'),
				count($modified_labels)
			),
			'meta' => [
				'modified_labels' => $modified_labels
			]
		];
	}

	/**
	 * Generates a unique label that respects the 50-character limit
	 *
	 * @param string $original_label The original label
	 * @param array $existing_labels Array of existing labels with item_id as key
	 * @return string The modified unique label
	 */
	private function generate_unique_label($original_label, $existing_labels) {
		$suffix = '__duplicateLabel';
		$max_length = 50;
		
		// Check if the original label already has a suffix
		$has_suffix = strpos($original_label, '__duplicateLabel') !== false;
		
		if ($has_suffix) {
			// Extract the base label (remove existing suffix)
			$base_label = str_replace('__duplicateLabel', '', $original_label);
			
			// Find the next available number
			$counter = 1;
			$new_label = $base_label . $suffix . $counter;
			
			while (strlen($new_label) > $max_length || in_array($new_label, $existing_labels)) {
				$counter++;
				$new_label = $base_label . $suffix . $counter;
				
				// If still too long, slice the base label
				if (strlen($new_label) > $max_length) {
					$available_length = $max_length - strlen($suffix . $counter);
					$base_label = substr($base_label, 0, $available_length);
					$new_label = $base_label . $suffix . $counter;
				}
			}
		} else {
			// Simple case: just add suffix
			$new_label = $original_label . $suffix;
			
			// If too long, slice the original label
			if (strlen($new_label) > $max_length) {
				$available_length = $max_length - strlen($suffix);
				$new_label = substr($original_label, 0, $available_length) . $suffix;
			}
			
			// Check if this label already exists, if so, add a number
			$counter = 1;
			$base_label = $new_label;
			
			while (in_array($new_label, $existing_labels)) {
				$new_label = $base_label . $counter;
				
				// If too long, slice more from the base
				if (strlen($new_label) > $max_length) {
					$available_length = $max_length - strlen($suffix . $counter);
					$base_label = substr($original_label, 0, $available_length) . $suffix;
					$new_label = $base_label . $counter;
				}
				
				$counter++;
			}
		}
		
		return $new_label;
	}

	/**
	 * Performs final validation check right before saving to handle concurrency issues
	 *
	 * @param \WP_REST_Request $request The request object
	 * @param array $items Items to be saved
	 * @return array Result with has_changes, items, and validation_result
	 */
	private function perform_final_validation($request, $items) {
		// Get fresh data from database to check for concurrent changes
		$fresh_existing_items = $this->get_repository()
			->context($request->get_param('context'))
			->all()
			->get_items()
			->map(function ($item) {
				return [
					'id'    => $item['id'],
					'label' => $item['label'],
				];
			})
			->all();

		// Get added items from the request
		$changes = $request->get_param('changes') ?? [];
		$added_item_ids = $changes['added'] ?? [];
		
		$has_changes = false;
		$modified_items = [];
		$modified_labels = [];

		// Check each added item against fresh database state
		foreach ($added_item_ids as $item_id) {
			if (!isset($items[$item_id])) {
				continue;
			}

			$item = $items[$item_id];
			$original_label = $item['label'] ?? '';

			if (empty($original_label)) {
				continue;
			}

			// Check if label exists in fresh database state
			$existing_labels = array_column($fresh_existing_items, 'label');
			$is_duplicate = in_array($original_label, $existing_labels, true);

			// Also check against other items in the current request
			foreach ($items as $other_item_id => $other_item) {
				if ($other_item_id !== $item_id && ($other_item['label'] ?? '') === $original_label) {
					$is_duplicate = true;
					break;
				}
			}

			if ($is_duplicate) {
				$has_changes = true;
				
				// Get all current labels (including fresh database and current items)
				$all_current_labels = array_merge(
					$existing_labels,
					array_column($items, 'label')
				);

				$modified_label = $this->generate_unique_label($original_label, $all_current_labels);
				
				$items[$item_id]['label'] = $modified_label;
				
				$modified_labels[] = [
					'original' => $original_label,
					'modified' => $modified_label,
					'item_id' => $item_id
				];

				// Log the concurrency resolution
				error_log(sprintf(
					'Elementor Global Classes: Concurrency resolved - "%s" changed to "%s"',
					$original_label,
					$modified_label
				));
			}
		}

		return [
			'has_changes' => $has_changes,
			'items' => $items,
			'validation_result' => [
				'is_valid' => true,
				'message' => empty($modified_labels) ? '' : sprintf(
					__('Modified %d duplicate labels automatically.', 'elementor'),
					count($modified_labels)
				),
				'meta' => [
					'modified_labels' => $modified_labels
				]
			]
		];
	}
}