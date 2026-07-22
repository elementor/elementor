<?php

namespace Elementor\Modules\Mcp\Abilities;

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
					'destructive' => true,
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
		$input = is_array( $input ) ? $input : [];
		$operations = $input['operations'] ?? null;

		if ( ! is_array( $operations ) ) {
			return $this->bad_request( __( 'operations array is required.', 'elementor' ) );
		}

		if ( empty( $operations ) ) {
			return $this->bad_request( __( 'operations must not be empty.', 'elementor' ) );
		}

		if ( count( $operations ) > self::MAX_BATCH_SIZE ) {
			return new \WP_Error(
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
		}

		return $this->handle_bulk( $operations );
	}

	private function handle_bulk( array $operations ) {
		$batch_operations = [];
		$index_map = [];
		$results_by_index = [];

		foreach ( $operations as $index => $operation ) {
			if ( ! is_array( $operation ) ) {
				$results_by_index[ $index ] = $this->operation_error(
					$index,
					'',
					'invalid_input',
					__( 'Invalid operation.', 'elementor' )
				);
				continue;
			}

			$translated = $this->translate_operation( $operation );

			if ( is_wp_error( $translated ) ) {
				$results_by_index[ $index ] = $this->operation_error(
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

				foreach ( $batch_result['results'] as $batch_index => $result ) {
					$original_index = $index_map[ $batch_index ];
					$results_by_index[ $original_index ] = $result;
				}
			} catch ( FatalError $e ) {
				return new \WP_Error(
					'unexpected_server_error',
					__( 'Unexpected server error', 'elementor' ),
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}

			$this->clear_cache();
		}

		return $this->build_response( $results_by_index, $watermark );
	}

	private function translate_operation( array $operation ) {
		$action = $operation['action'] ?? '';

		switch ( $action ) {
			case 'create':
				return $this->translate_create_operation( $operation );
			case 'update':
				return $this->translate_update_operation( $operation );
			case 'delete':
				return $this->translate_delete_operation( $operation );
			default:
				return $this->bad_request( sprintf(
					/* translators: %s: action name */
					__( 'Unknown action: %s.', 'elementor' ),
					$action
				) );
		}
	}

	private function translate_create_operation( array $operation ) {
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
	}

	private function translate_update_operation( array $operation ) {
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
	}

	private function translate_delete_operation( array $operation ) {
		$id = $operation['id'] ?? '';

		if ( '' === $id ) {
			return $this->bad_request( __( 'Delete requires id.', 'elementor' ) );
		}

		return [
			'type' => 'delete',
			'id' => $id,
		];
	}

	private function build_response( array $results_by_index, ?int $watermark ): array {
		ksort( $results_by_index );

		$results = array_values( $results_by_index );
		$ok_count = 0;
		$error_count = 0;

		foreach ( $results as $result ) {
			if ( 'ok' === ( $result['status'] ?? '' ) ) {
				$ok_count++;
			} else {
				$error_count++;
			}
		}

		$status = 'ok';
		if ( $ok_count > 0 && $error_count > 0 ) {
			$status = 'partial_error';
		} elseif ( 0 === $ok_count ) {
			$status = 'error';
		}

		$response = [
			'status' => $status,
			'results' => $results,
		];

		if ( null !== $watermark ) {
			$response['watermark'] = $watermark;
		}

		return $response;
	}

	private function operation_error( int $index, string $action, string $code, string $message ): array {
		return [
			'index' => $index,
			'action' => $action,
			'status' => 'error',
			'code' => $code,
			'message' => $message,
		];
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function clear_cache(): void {
		if ( ! class_exists( Plugin::class ) || ! isset( Plugin::$instance ) ) {
			return;
		}

		Plugin::$instance->files_manager->clear_cache();
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
}
