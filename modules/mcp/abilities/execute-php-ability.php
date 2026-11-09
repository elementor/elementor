<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Php_Executor;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Access;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Execute_Php_Ability extends Abstract_Ability {

	use Super_Admin_Access;

	const ERROR_EMPTY_CODE = 'empty_code';

	protected function get_ability_id(): string {
		return 'elementor/execute-php';
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
					'return_value' => [
						'type' => [ 'string', 'number', 'integer', 'boolean', 'array', 'object', 'null' ],
					],
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
			fn() => $this->can_use_enabled(),
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
		$refused = $this->forbidden_error() ?? $this->disabled_error();
		if ( $refused ) {
			return $refused;
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
}
