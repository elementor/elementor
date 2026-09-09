<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\GlobalClasses\Usage\Applied_Global_Classes_Usage;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'global-classes';
	const API_BASE_USAGE = self::API_BASE . '/usage';
	const API_BASE_POST = self::API_BASE . '/post';
	const API_BASE_STYLES = self::API_BASE . '/styles';
	const MAX_ITEMS = 1000;

	/**
	 * Per-kit mutex that serializes the read-modify-write of a global-classes
	 * save. Mirrors the spinlock pattern used by the component lock managers,
	 * but keys on the kit so two overlapping saves cannot overwrite each other.
	 */
	const LOCK_GROUP = 'elementor_global_classes_lock';
	const LOCK_ACQUIRE_ATTEMPTS = 20;
	const LOCK_ACQUIRE_DELAY_US = 100000;

	private ?Global_Classes_Repository $repository = null;
	private ?Global_Classes_Relations $relations = null;
	private ?Kit $kit = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	public function invalidate_cache() {
		$this->kit = null;
		$this->repository = null;
		$this->relations = null;
	}

	private function get_kit(): ?Kit {
		if ( ! $this->kit ) {
			$this->kit = Plugin::$instance->kits_manager->get_active_kit();
		}

		return $this->kit;
	}

	private function get_repository() {
		if ( ! $this->repository ) {
			$this->repository = new Global_Classes_Repository( $this->get_kit() );
		}

		return $this->repository;
	}

	private function get_classes_relations(): Global_Classes_Relations {
		if ( ! $this->relations ) {
			$this->relations = new Global_Classes_Relations();
		}

		return $this->relations;
	}

	private function lock_key( int $kit_id ): string {
		return 'elementor_global_classes_' . $kit_id;
	}

	/**
	 * Acquire the per-kit global-classes write lock.
	 *
	 * Returns the lock token on success or null if it could not be acquired
	 * within the give-up budget. The token must be passed to release_lock().
	 */
	private function acquire_lock( int $kit_id ): ?string {
		$key = $this->lock_key( $kit_id );
		$token = wp_generate_uuid4();

		for ( $attempt = 0; $attempt < self::LOCK_ACQUIRE_ATTEMPTS; $attempt++ ) {
			if ( wp_cache_add( $key, $token, self::LOCK_GROUP ) ) {
				return $token;
			}

			usleep( self::LOCK_ACQUIRE_DELAY_US );
		}

		return null;
	}

	private function release_lock( int $kit_id, string $token ): void {
		$key = $this->lock_key( $kit_id );

		if ( wp_cache_get( $key, self::LOCK_GROUP ) === $token ) {
			wp_cache_delete( $key, self::LOCK_GROUP );
		}
	}

	private function register_routes() {
		// cache invalidation at this point is solely for tests, in particular - Test_Global_Classes_Rest_Api
		$this->invalidate_cache();

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
				'methods' => 'GET',
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
							'order' => [
								'type' => 'boolean',
								'required' => false,
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
					'version' => [
						'type' => 'integer',
						'required' => false,
						'description' => 'Optimistic-concurrency token from the last index read. When present and stale, the save is rejected with a conflict instead of overwriting the kit index.',
					],
				],
			],
		] );
	}

	private function all( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;
		$label_by_id = $this->get_repository()->set_preview( $is_preview )->all_labels();
		$list = [];

		foreach ( $label_by_id as $id => $label ) {
			$list[] = [
				'id' => $id,
				'label' => $label,
			];
		}

		return Response_Builder::make( $list )
			->set_meta( [ 'version' => $this->get_repository()->get_version() ] )
			->build();
	}

	private function styles_for_post( \WP_REST_Request $request ) {
		$context = $request->get_param( 'context' );
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;
		$post_id = (int) $request->get_param( 'post_id' );

		$document_class_ids = $this->get_classes_relations()->set_preview( $is_preview )->get_styles_by_post( $post_id );

		if ( empty( $document_class_ids ) ) {
			return Response_Builder::make( (object) [] )->set_meta( [ 'order' => [] ] )->build();
		}

		$repository = $this->get_repository()->set_preview( $is_preview );
		$global_order = array_keys( $repository->all_labels() );
		$filtered_order = array_values( array_intersect( $global_order, $document_class_ids ) );
		$items = $repository->get_by_ids( $document_class_ids );

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
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;
		$ids_param = $request->get_param( 'ids' );

		$requested_ids = array_map( 'trim', explode( ',', $ids_param ) );
		$requested_ids = array_filter( $requested_ids );

		if ( empty( $requested_ids ) ) {
			return Response_Builder::make( (object) [] )->set_meta( [ 'order' => [] ] )->build();
		}

		$repository = $this->get_repository()->set_preview( $is_preview );
		$global_order = array_keys( $repository->all_labels() );
		$filtered_order = array_values( array_intersect( $global_order, $requested_ids ) );
		$items = $repository->get_by_ids( $requested_ids );

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
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;
		$changes = $request->get_param( 'changes' ) ?? [];
		$added_ids = $changes['added'] ?? [];
		$deleted_ids = $changes['deleted'] ?? [];
		$order = $request->get_param( 'order' ) ?? [];
		$requested_version = $request->get_param( 'version' );

		$repository = $this->get_repository()->set_preview( $is_preview );
		$kit = $this->get_kit();
		$kit_id = $kit ? (int) $kit->get_main_id() : null;

		$lock_token = $kit_id ? $this->acquire_lock( $kit_id ) : null;

		if ( null === $lock_token ) {
			return Error_Builder::make( 'global_classes_conflict' )
				->set_status( 409 )
				->set_message( __( 'Global classes are currently being updated by another request. Please try again.', 'elementor' ) )
				->build();
		}

		try {
			return $this->put_serialized( $request, $repository, $changes, $added_ids, $deleted_ids, $order, $requested_version );
		} finally {
			if ( $kit_id ) {
				$this->release_lock( $kit_id, $lock_token );
			}
		}
	}

	private function put_serialized( \WP_REST_Request $request, Global_Classes_Repository $repository, array $changes, array $added_ids, array $deleted_ids, array $order, $requested_version ) {
		// Read the authoritative list inside the lock so a concurrent save cannot
		// interleave between this read and the index rewrite below.
		$all_label_by_id = $repository->all_labels();

		// Optimistic-concurrency guard: a client that sends an outdated version is
		// editing against a stale baseline. Reject before any mutation instead of
		// letting this request silently overwrite classes another save already wrote.
		if ( null !== $requested_version && (int) $requested_version !== $repository->get_version() ) {
			return Error_Builder::make( 'global_classes_conflict' )
				->set_status( 409 )
				->set_meta( [ 'version' => $repository->get_version() ] )
				->set_message( __( 'Global classes changed since this page was loaded. Refresh to reload the latest classes.', 'elementor' ) )
				->build();
		}

		$existing_label_list = $this->global_classes_existing_label_list( $all_label_by_id, $deleted_ids );
		$total_count = count( $all_label_by_id ) - count( $deleted_ids ) + count( $added_ids );

		$parser = Global_Classes_Parser::make();
		$items_result = $parser->parse_items( $request->get_param( 'items' ) ?? [] );

		if ( ! $items_result->is_valid() ) {
			return Error_Builder::make( 'invalid_items' )
				->set_status( 400 )
				->set_message( 'Invalid items: ' . $items_result->errors()->to_string() )
				->build();
		}

		$touched_items = $items_result->unwrap();

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

		$duplicated_labels = Global_Classes_Parser::check_for_duplicate_labels(
			$all_label_by_id,
			$deleted_ids,
			$touched_items,
			$added_ids
		);

		$duplicate_validation_result = null;

		if ( ! empty( $duplicated_labels ) ) {
			$modified_labels = $this->handle_duplicates( $duplicated_labels, $existing_label_list );
			$duplicate_validation_result = $modified_labels;

			foreach ( $modified_labels as $item_id => $labels ) {
				$touched_items[ $item_id ]['label'] = $labels['modified'];
			}
		}

		$final_item_ids = array_keys( $this->merge_touched_with_existing_labels( $all_label_by_id, $touched_items, $deleted_ids ) );

		$final_item_ids_set = array_flip( $final_item_ids );
		$order_set = array_flip( $order );

		$order = array_values( array_filter( $order, fn( $id ) => isset( $final_item_ids_set[ $id ] ) ) );
		$missing_from_order = array_values( array_filter( $final_item_ids, fn( $id ) => ! isset( $order_set[ $id ] ) ) );
		$order = array_merge( $order, $missing_from_order );

		$order_result = $parser->parse_order( $order, $final_item_ids );

		if ( ! $order_result->is_valid() ) {
			return Error_Builder::make( 'invalid_order' )
				->set_status( 400 )
				->set_message( 'Invalid order: ' . $order_result->errors()->to_string() )
				->build();
		}

		$repository->apply_changes( $touched_items, [
			'added' => $added_ids,
			'deleted' => $changes['deleted'] ?? [],
			'modified' => $changes['modified'] ?? [],
			'order' => isset( $changes['order'] ) && $changes['order'], // boolean indicating if the order has changed
		], $order_result->unwrap() );

		// Advance the concurrency token only after a successful, conflict-free commit.
		$repository->bump_version();

		if ( $duplicate_validation_result ) {
			return Response_Builder::make( [
				'code' => 'DUPLICATED_LABEL',
				'modifiedLabels' => $duplicate_validation_result,
			] )->build();
		}

		return Response_Builder::make()->no_content()->build();
	}

	private function global_classes_existing_label_list( array $label_by_id, array $deleted_ids ): array {
		$labels = [];

		foreach ( $label_by_id as $id => $label ) {
			if ( in_array( $id, $deleted_ids, true ) ) {
				continue;
			}

			$labels[] = $label;
		}

		return $labels;
	}

	private function merge_touched_with_existing_labels( array $label_by_id, array $touched_items, array $deleted_ids ): array {
		$final = [];

		foreach ( $label_by_id as $id => $label ) {
			if ( in_array( $id, $deleted_ids, true ) ) {
				continue;
			}

			if ( isset( $touched_items[ $id ] ) ) {
				$final[ $id ] = $touched_items[ $id ];
			} else {
				$final[ $id ] = [
					'id' => $id,
					'label' => $label,
					'type' => 'class',
					'variants' => [],
				];
			}
		}

		foreach ( $touched_items as $id => $item ) {
			if ( ! isset( $final[ $id ] ) ) {
				$final[ $id ] = $item;
			}
		}

		return $final;
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

			$modified_label = Global_Classes_Labels::generate_unique_label( $original_label, $existing_labels );

			$modified_labels[ $item_id ] = [
				'original' => $original_label,
				'modified' => $modified_label,
			];
		}

		return $modified_labels;
	}
}
