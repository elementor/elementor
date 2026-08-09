<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reorder_Classes_Ability extends Abstract_Ability {

	const MAX_MOVES = 50;

	private ?Global_Classes_Repository $repository;

	public function __construct( ?Global_Classes_Repository $repository = null ) {
		$this->repository = $repository;
	}

	protected function get_ability_id(): string {
		return 'elementor/reorder-classes';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Reorder Global Classes', 'elementor' ),
			__( 'Change the priority of V4 global CSS classes on the active kit. Classes earlier in the order override conflicting CSS declarations from classes later in the order.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'changed', 'order' ],
				'properties' => [
					'changed' => [ 'type' => 'boolean' ],
					'order' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
					'appended_ids' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
					'moves' => [
						'type' => 'array',
						'description' => 'Applied moves in order. Each from/to is relative to the array state when that move ran, not the original input order.',
						'items' => [
							'type' => 'object',
							'properties' => [
								'id' => [ 'type' => 'string' ],
								'from' => [ 'type' => 'integer' ],
								'to' => [ 'type' => 'integer' ],
							],
						],
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( Add_Capabilities::UPDATE_CLASS ),
			[
				'type' => 'object',
				'properties' => [
					'moves' => [
						'type' => 'array',
						'description' => 'One to fifty sequential moves. Each move is applied to the result of the preceding move.',
						'items' => [
							'type' => 'object',
							'required' => [ 'id', 'position' ],
							'properties' => [
								'id' => [
									'type' => 'string',
									'description' => 'Global class ID from the global-classes resource.',
								],
								'position' => [
									'type' => 'string',
									'enum' => [ 'before', 'after', 'start', 'end' ],
								],
								'ref' => [
									'type' => 'string',
									'description' => 'Reference class ID. Required when position is before or after.',
								],
							],
						],
					],
					'order' => [
						'type' => 'array',
						'description' => 'Optional complete or partial priority order. Omitted existing class IDs are appended in their current relative order.',
						'items' => [ 'type' => 'string' ],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$has_moves = array_key_exists( 'moves', $input );
		$has_order = array_key_exists( 'order', $input );

		if ( $has_moves === $has_order ) {
			return $this->bad_request( __( 'Provide exactly one of moves or order.', 'elementor' ) );
		}

		$current_order = $this->get_repository()->get_order();

		if ( $has_moves ) {
			if ( ! is_array( $input['moves'] ) || empty( $input['moves'] ) ) {
				return $this->bad_request( __( 'moves must be a non-empty array.', 'elementor' ) );
			}

			if ( count( $input['moves'] ) > self::MAX_MOVES ) {
				return $this->bad_request( sprintf(
					/* translators: %d: maximum moves per request */
					__( 'Maximum %d moves per request.', 'elementor' ),
					self::MAX_MOVES
				) );
			}

			$result = $this->apply_moves( $current_order, $input['moves'] );
			if ( is_wp_error( $result ) ) {
				return $result;
			}

			$new_order = $result['order'];
			$moves = $result['moves'];
			$appended_ids = [];
		} else {
			if ( ! is_array( $input['order'] ) ) {
				return $this->bad_request( __( 'order must be an array.', 'elementor' ) );
			}

			$result = $this->build_order( $current_order, $input['order'] );
			if ( is_wp_error( $result ) ) {
				return $result;
			}

			$new_order = $result['order'];
			$appended_ids = $result['appended_ids'];
			$moves = [];
		}

		$changed = $new_order !== $current_order;
		if ( $changed ) {
			$this->get_repository()->apply_changes(
				[],
				[
					'added' => [],
					'deleted' => [],
					'modified' => [],
					'order' => true,
				],
				$new_order
			);
			$this->clear_cache();
		}

		return [
			'changed' => $changed,
			'order' => $new_order,
			'appended_ids' => $appended_ids,
			'moves' => $moves,
		];
	}

	private function apply_moves( array $order, array $moves ) {
		$applied_moves = [];

		foreach ( $moves as $index => $move ) {
			if ( ! is_array( $move ) ) {
				return $this->bad_request( sprintf(
					/* translators: %d: move index */
					__( 'Move %d must be an object.', 'elementor' ),
					$index
				) );
			}

			$id = $move['id'] ?? '';
			$position = $move['position'] ?? '';
			$ref = $move['ref'] ?? '';

			if ( ! is_string( $id ) || ! in_array( $id, $order, true ) ) {
				return $this->class_not_found( is_string( $id ) ? $id : '' );
			}

			if ( ! in_array( $position, [ 'before', 'after', 'start', 'end' ], true ) ) {
				return $this->bad_request( __( 'position must be before, after, start, or end.', 'elementor' ) );
			}

			if ( in_array( $position, [ 'before', 'after' ], true ) ) {
				if ( ! is_string( $ref ) || ! in_array( $ref, $order, true ) ) {
					return $this->class_not_found( is_string( $ref ) ? $ref : '' );
				}

				if ( $id === $ref ) {
					return $this->bad_request( __( 'A class cannot be moved relative to itself.', 'elementor' ) );
				}
			}

			$from = array_search( $id, $order, true );
			$order = array_values( array_filter( $order, fn( $item ) => $item !== $id ) );

			if ( 'start' === $position ) {
				$to = 0;
			} elseif ( 'end' === $position ) {
				$to = count( $order );
			} else {
				$to = array_search( $ref, $order, true );
				if ( 'after' === $position ) {
					++$to;
				}
			}

			array_splice( $order, $to, 0, [ $id ] );
			$applied_moves[] = [
				'id' => $id,
				'from' => $from,
				'to' => $to,
			];
		}

		return [
			'order' => $order,
			'moves' => $applied_moves,
		];
	}

	private function build_order( array $current_order, array $requested_order ) {
		$known_ids = array_flip( $current_order );
		$order = [];

		foreach ( $requested_order as $id ) {
			if ( ! is_string( $id ) || ! isset( $known_ids[ $id ] ) ) {
				return $this->class_not_found( is_string( $id ) ? $id : '' );
			}

			if ( in_array( $id, $order, true ) ) {
				return $this->bad_request( __( 'order must not contain duplicate class IDs.', 'elementor' ) );
			}

			$order[] = $id;
		}

		$appended_ids = array_values( array_diff( $current_order, $order ) );

		return [
			'order' => array_merge( $order, $appended_ids ),
			'appended_ids' => $appended_ids,
		];
	}

	private function get_repository(): Global_Classes_Repository {
		if ( $this->repository ) {
			return $this->repository;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}

	private function clear_cache(): void {
		if ( ! class_exists( Plugin::class ) || ! isset( Plugin::$instance ) ) {
			return;
		}

		Plugin::$instance->files_manager->clear_cache();
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => WP_Http::BAD_REQUEST ] );
	}

	private function class_not_found( string $id ): \WP_Error {
		return new \WP_Error(
			'class_not_found',
			sprintf(
				/* translators: %s: global class ID */
				__( 'Global class not found: %s.', 'elementor' ),
				$id
			),
			[ 'status' => WP_Http::BAD_REQUEST ]
		);
	}
}
