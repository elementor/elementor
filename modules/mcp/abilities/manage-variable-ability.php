<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Tool_Performance_Metrics;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Variable_Ability extends Abstract_Ability {

	const TYPE_COLOR = 'global-color-variable';
	const TYPE_FONT = 'global-font-variable';
	const TYPE_SIZE = 'global-size-variable';
	const TYPE_CUSTOM_SIZE = 'global-custom-size-variable';
	const MAX_BATCH_SIZE = 50;

	private ?Variables_Service $service;

	public function __construct( ?Variables_Service $service = null ) {
		$this->service = $service;
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-global-variable';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Global Variable', 'elementor' ),
			__( 'Manage V4 global variables (color, font, size, custom-size). Bulk create, update, or delete on the active kit (up to 50 operations).', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status', 'results' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'results' => [ 'type' => 'array' ],
					'watermark' => [ 'type' => 'integer' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'manage_options' ),
			[
				'type' => 'object',
				'required' => [ 'operations' ],
				'properties' => [
					'operations' => [
						'type' => 'array',
						'description' => 'Bulk operations (1–50). Each item requires action; create needs type/label/value, update needs id/label/value, delete needs id.',
						'items' => [
							'type' => 'object',
							'required' => [ 'action' ],
							'properties' => [
								'action' => [
									'type' => 'string',
									'enum' => [ 'create', 'update', 'delete' ],
								],
								'id' => [ 'type' => 'string' ],
								'type' => [
									'type' => 'string',
									'enum' => [ self::TYPE_COLOR, self::TYPE_FONT, self::TYPE_SIZE, self::TYPE_CUSTOM_SIZE ],
								],
								'label' => [ 'type' => 'string' ],
								'value' => [ 'type' => 'string' ],
							],
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$started_at = hrtime( true );
		$input      = is_array( $input ) ? $input : [];
		$operations = $input['operations'] ?? null;

		if ( ! is_array( $operations ) ) {
			$error = $this->bad_request( __( 'operations array is required.', 'elementor' ) );
			$this->emit_mcp_manage_global_variable_executed( $started_at, [], $error );
			return $error;
		}

		if ( empty( $operations ) ) {
			$error = $this->bad_request( __( 'operations must not be empty.', 'elementor' ) );
			$this->emit_mcp_manage_global_variable_executed( $started_at, [], $error );
			return $error;
		}

		if ( count( $operations ) > self::MAX_BATCH_SIZE ) {
			$error = new \WP_Error(
				'batch_size_exceeded',
				sprintf(
					/* translators: %d: maximum operations per request */
					__( 'Maximum %d operations per request.', 'elementor' ),
					self::MAX_BATCH_SIZE
				),
				[
					'status' => \WP_Http::BAD_REQUEST,
					'max_allowed' => self::MAX_BATCH_SIZE,
				]
			);
			$this->emit_mcp_manage_global_variable_executed( $started_at, $operations, $error );
			return $error;
		}

		$response = $this->handle_bulk( $operations );
		if ( is_wp_error( $response ) ) {
			$this->emit_mcp_manage_global_variable_executed( $started_at, $operations, $response );
		} else {
			$this->emit_mcp_manage_global_variable_executed( $started_at, $operations, null, $response );
		}
		return $response;
	}

	private function handle_bulk( array $operations ) {
		$results = new Bulk_Operations_Result();
		$batch_operations = [];
		$index_map = [];

		foreach ( $operations as $index => $operation ) {
			if ( ! is_array( $operation ) ) {
				$results->add_error( $index, '', 'invalid_input', __( 'Invalid operation.', 'elementor' ) );
				continue;
			}

			$translated = $this->translate_operation( $operation );

			if ( is_wp_error( $translated ) ) {
				$results->add_error(
					$index,
					$operation['action'] ?? '',
					$translated->get_error_code(),
					$translated->get_error_message()
				);
				continue;
			}

			$index_map[ count( $batch_operations ) ] = $index;
			$batch_operations[] = $translated;
		}

		$watermark = null;

		if ( ! empty( $batch_operations ) ) {
			try {
				$batch_result = $this->get_service()->process_batch( $batch_operations, true );
				$watermark = $batch_result['watermark'] ?? null;

				$this->merge_batch_results( $batch_result['results'], $index_map, $results );
				$this->emit_variable_events( $batch_result['results'] );
			} catch ( FatalError $e ) {
				return new \WP_Error(
					'unexpected_server_error',
					__( 'Unexpected server error', 'elementor' ),
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}

			$this->clear_cache();
		}

		$response = $results->to_array();

		if ( null !== $watermark ) {
			$response['watermark'] = $watermark;
		}

		return $response;
	}

	private function translate_operation( array $operation ) {
		$action = $operation['action'] ?? '';

		switch ( $action ) {
			case 'create':
				$type = $operation['type'] ?? '';
				$label = $operation['label'] ?? '';
				$value = $operation['value'] ?? '';

				if ( '' === $type || '' === $label || '' === $value ) {
					return $this->bad_request( __( 'Create requires type, label, and value.', 'elementor' ) );
				}

				return [
					'type' => 'create',
					'variable' => [
						'type' => $type,
						'label' => $label,
						'value' => $value,
					],
				];

			case 'update':
				$id = $operation['id'] ?? '';
				$label = $operation['label'] ?? '';
				$value = $operation['value'] ?? '';

				if ( '' === $id || '' === $label || '' === $value ) {
					return $this->bad_request( __( 'Update requires id, label, and value.', 'elementor' ) );
				}

				return [
					'type' => 'update',
					'id' => $id,
					'variable' => [
						'label' => $label,
						'value' => $value,
					],
				];

			case 'delete':
				$id = $operation['id'] ?? '';

				if ( '' === $id ) {
					return $this->bad_request( __( 'Delete requires id.', 'elementor' ) );
				}

				return [
					'type' => 'delete',
					'id' => $id,
				];

			default:
				return $this->bad_request( sprintf(
					/* translators: %s: action name */
					__( 'Unknown action: %s.', 'elementor' ),
					$action
				) );
		}
	}

	private function merge_batch_results( array $batch_results, array $index_map, Bulk_Operations_Result $results ): void {
		foreach ( $batch_results as $batch_index => $result ) {
			$original_index = $index_map[ $batch_index ];

			if ( 'ok' === ( $result['status'] ?? '' ) ) {
				$extra = array_diff_key( $result, array_flip( [ 'index', 'status' ] ) );
				$results->add_success( $original_index, $result['action'] ?? '', $extra );
			} else {
				$results->add_error(
					$original_index,
					$result['action'] ?? '',
					$result['code'] ?? 'unknown_error',
					$result['message'] ?? ''
				);
			}
		}
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function clear_cache(): void {
		if ( ! class_exists( Plugin::class ) || ! isset( Plugin::$instance ) ) {
			return;
		}

		Plugin::$instance->files_manager->clear_cache();
		$this->flush_runtime_cache();
	}

	private function flush_runtime_cache(): void {
		if ( function_exists( 'wp_cache_flush_runtime' ) ) {
			wp_cache_flush_runtime();
		}
	}

	private function get_service(): Variables_Service {
		if ( $this->service ) {
			return $this->service;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}

	private function emit_variable_events( array $batch_results ): void {
		$event_by_action = [
			'create' => 'variable_created',
			'update' => 'variable_updated',
		];

		$var_type_labels = [
			self::TYPE_COLOR       => 'color',
			self::TYPE_FONT        => 'font',
			self::TYPE_SIZE        => 'size',
			self::TYPE_CUSTOM_SIZE => 'size',
		];

		foreach ( $batch_results as $result ) {
			if ( 'ok' !== ( $result['status'] ?? '' ) ) {
				continue;
			}

			$action = $result['action'] ?? '';

			if ( ! isset( $event_by_action[ $action ] ) ) {
				continue;
			}

			$raw_type = $result['type'] ?? '';
			$var_type = $var_type_labels[ $raw_type ] ?? $raw_type;

			Mcp_Event_Dispatcher::emit( $event_by_action[ $action ], [
				'id'       => $result['id'] ?? '',
				'name'     => $result['label'] ?? '',
				'var_type' => $var_type,
			] );
		}
	}

	private function emit_mcp_manage_global_variable_executed(
		int $started_at,
		array $operations,
		?\WP_Error $top_level_error = null,
		array $response = []
	): void {
		$duration_ms = Tool_Performance_Metrics::duration_ms_since( $started_at );

		[ 'status' => $status, 'error_code' => $error_code ] = Tool_Performance_Metrics::resolve_status( $response, $top_level_error );

		$failed_results = array_filter( $response['results'] ?? [], fn( $r ) => 'error' === ( $r['status'] ?? '' ) );
		$failed_count   = count( $failed_results );
		$failed_codes   = array_values( array_unique( array_column( $failed_results, 'code' ) ) );

		$ops_count      = count( $operations );
		$by_action      = [];
		$variable_types = [];

		foreach ( $operations as $op ) {
			$action = $op['action'] ?? '';
			if ( is_string( $action ) && '' !== $action ) {
				$by_action[ $action ] = ( $by_action[ $action ] ?? 0 ) + 1;
			}
		}

		$ok_results = array_filter( $response['results'] ?? [], fn( $r ) => 'ok' === ( $r['status'] ?? '' ) );
		foreach ( $ok_results as $row ) {
			$type = $row['type'] ?? '';
			if ( is_string( $type ) && '' !== $type ) {
				$variable_types[ $type ] = ( $variable_types[ $type ] ?? 0 ) + 1;
			}
		}

		$dominant_action = '';
		if ( ! empty( $by_action ) ) {
			arsort( $by_action );
			$dominant_action = (string) array_key_first( $by_action );
		}

		$payload = [
			'tool_name'               => $this->get_ability_id(),
			'status'                  => $status,
			'duration_ms'             => $duration_ms,
			'action'                  => $dominant_action,
			'operations_count'        => $ops_count,
			'operations_by_type'      => $by_action,
			'variable_types'          => $variable_types,
			'failed_operations_count' => $failed_count,
			'failed_operation_codes'  => $failed_codes,
			'warning_count'           => 0,
			'warning_types'           => [],
		];

		if ( null !== $error_code ) {
			$payload['error_code'] = $error_code;
		}

		Mcp_Event_Dispatcher::emit( 'mcp_manage_global_variable_executed', $payload );
	}
}
