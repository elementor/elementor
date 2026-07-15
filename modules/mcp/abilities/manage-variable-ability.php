<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\Type_Mismatch;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
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
			__( 'Manage V4 global variables (color, font, size, custom-size). Create, update, or delete a single variable on the active kit.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'variable' => [ 'type' => 'object' ],
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
				'required' => [ 'action' ],
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => [ 'create', 'update', 'delete' ],
					],
					'id' => [
						'type' => 'string',
						'description' => 'Variable id — required for update/delete.',
					],
					'type' => [
						'type' => 'string',
						'enum' => [ self::TYPE_COLOR, self::TYPE_FONT, self::TYPE_SIZE, self::TYPE_CUSTOM_SIZE ],
						'description' => 'Variable type — required for create.',
					],
					'label' => [
						'type' => 'string',
						'description' => 'Variable label (lowercase, dash-separated) — required for create/update.',
					],
					'value' => [
						'type' => 'string',
						'description' => 'Plain CSS value — required for create/update.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$action = $input['action'] ?? '';

		switch ( $action ) {
			case 'create':
				return $this->handle_create( $input );
			case 'update':
				return $this->handle_update( $input );
			case 'delete':
				return $this->handle_delete( $input );
			default:
				return $this->bad_request( sprintf(
					/* translators: %s: action name */
					__( 'Unknown action: %s.', 'elementor' ),
					$action
				) );
		}
	}

	private function handle_create( array $input ) {
		$type = $input['type'] ?? '';
		$label = $input['label'] ?? '';
		$value = $input['value'] ?? '';

		if ( '' === $type || '' === $label || '' === $value ) {
			return $this->bad_request( __( 'Create requires type, label, and value.', 'elementor' ) );
		}

		try {
			$result = $this->get_service()->create( [
				'type' => $type,
				'label' => $label,
				'value' => $value,
			] );
		} catch ( \Exception $e ) {
			return $this->map_service_exception( $e );
		}

		$this->clear_cache();

		return $this->ok( $result );
	}

	private function handle_update( array $input ) {
		$id = $input['id'] ?? '';
		$label = $input['label'] ?? '';
		$value = $input['value'] ?? '';

		if ( '' === $id || '' === $label || '' === $value ) {
			return $this->bad_request( __( 'Update requires id, label, and value.', 'elementor' ) );
		}

		try {
			$result = $this->get_service()->update( $id, [
				'label' => $label,
				'value' => $value,
			] );
		} catch ( \Exception $e ) {
			return $this->map_service_exception( $e );
		}

		$this->clear_cache();

		return $this->ok( $result );
	}

	private function handle_delete( array $input ) {
		$id = $input['id'] ?? '';

		if ( '' === $id ) {
			return $this->bad_request( __( 'Delete requires id.', 'elementor' ) );
		}

		try {
			$result = $this->get_service()->delete( $id );
		} catch ( \Exception $e ) {
			return $this->map_service_exception( $e );
		}

		$this->clear_cache();

		return $this->ok( $result );
	}

	private function ok( array $result ): array {
		return [
			'status' => 'ok',
			'variable' => $result['variable'],
			'watermark' => $result['watermark'],
		];
	}

	private function map_service_exception( \Exception $e ): \WP_Error {
		if ( $e instanceof VariablesLimitReached ) {
			return new \WP_Error(
				'invalid_variable_limit_reached',
				__( 'Reached the maximum number of variables', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( $e instanceof DuplicatedLabel ) {
			return new \WP_Error(
				'duplicated_label',
				__( 'Variable label already exists', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( $e instanceof RecordNotFound ) {
			return new \WP_Error(
				'variable_not_found',
				__( 'Variable not found', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( $e instanceof Type_Mismatch ) {
			return new \WP_Error(
				'type_mismatch',
				$e->getMessage(),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return new \WP_Error(
			'unexpected_server_error',
			__( 'Unexpected server error', 'elementor' ),
			[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
		);
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function clear_cache(): void {
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
