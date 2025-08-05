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

		// Validate that new items don't have labels that already exist (only when there are changes)
		if ($is_changes) {
			$validation_result = $this->validate_new_items_labels($request, $existing_items);
			if (!$validation_result['is_valid']) {
				return Error_Builder::make(Global_Classes_Errors::DUPLICATED_LABEL)
					->set_status(400)
					->set_meta($validation_result['meta'])
					->set_message($validation_result['message'])
					->build();
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

		$repository->put(
			$changes_resolver->resolve_items( $items_result->unwrap() ),
			$changes_resolver->resolve_order( $order_result ? $order_result->unwrap() : [] ),
		);

		return Response_Builder::make()->no_content()->build();
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

	/**
	 * Validates that new items don't have labels that already exist
	 *
	 * @param \WP_REST_Request $request The request object
	 * @param array $existing_items Array of existing items with their labels
	 * @return array Validation result with 'is_valid' and 'message' keys
	 */
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
		
		// Get existing labels
		$existing_labels = array_column($existing_items, 'label');
		
		// Get new items that are being added
		$added_item_ids = $changes['added'] ?? [];
		
		// Check each new item for duplicate labels
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
			
			if (in_array($new_label, $existing_labels, true)) {
				return [
					'is_valid' => false,
					'message' => sprintf(
						__('A global class with the label "%s" already exists.', 'elementor'),
						$new_label
					),
					'meta' => [
						'duplicated_label' => $new_label,
						'conflicting_item_id' => $item_id
					]
				];
			}
		}
		
		return [
			'is_valid' => true,
			'message' => '',
			'meta' => []
		];
	}

}
