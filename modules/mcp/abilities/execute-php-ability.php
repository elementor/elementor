<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Php_Executor;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Execute_Php_Ability extends Abstract_Ability {

	const ERROR_EMPTY_CODE = 'empty_code';

	protected function get_ability_id(): string {
		return 'elementor/execute-php';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Execute PHP', 'elementor' ),
			Prompt_Loader::load( 'execute-php' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'return_value' => [],
					'output' => [ 'type' => 'string' ],
					'errors' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'type' => [ 'type' => 'string' ],
								'message' => [ 'type' => 'string' ],
								'file' => [ 'type' => 'string' ],
								'line' => [ 'type' => 'integer' ],
							],
						],
					],
					'execution_time_ms' => [ 'type' => 'number' ],
					'error_message' => [ 'type' => 'string' ],
					'error_class' => [ 'type' => 'string' ],
				],
				'required' => [ 'success', 'return_value', 'output', 'errors', 'execution_time_ms' ],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'mutates_page' => false,
			],
			fn() => Super_Admin_Settings::current_user_can_use() && Super_Admin_Settings::is_enabled(),
			[
				'type' => 'object',
				'properties' => [
					'code' => [
						'type' => 'string',
						'description' => __( 'PHP code to execute.', 'elementor' ),
					],
				],
				'required' => [ 'code' ],
				'additionalProperties' => false,
			]
		);
	}

	public function execute( $input = [] ) {
		if ( ! Super_Admin_Settings::current_user_can_use() ) {
			return $this->error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'elementor' ), \WP_Http::FORBIDDEN );
		}

		if ( ! Super_Admin_Settings::is_enabled() ) {
			return $this->error(
				'super_admin_disabled',
				__( 'Super Admin is disabled.', 'elementor' ),
				\WP_Http::FORBIDDEN
			);
		}

		$code = is_array( $input ) && isset( $input['code'] ) ? (string) $input['code'] : '';
		if ( empty( trim( $code ) ) ) {
			return $this->error(
				self::ERROR_EMPTY_CODE,
				__( 'No PHP code provided.', 'elementor' ),
				\WP_Http::BAD_REQUEST
			);
		}

		return Php_Executor::execute( $code );
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}
