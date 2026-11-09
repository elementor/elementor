<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Path_Validator;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Read_File_Ability extends Abstract_Ability {

	const MAX_READ_BYTES = 524288;

	const ERROR_INVALID_PATH = 'invalid_path';
	const ERROR_NOT_A_FILE = 'not_a_file';
	const ERROR_FILE_TOO_LARGE = 'file_too_large';
	const ERROR_READ_FAILED = 'read_failed';

	protected function get_ability_id(): string {
		return 'elementor/read-file';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Read File', 'elementor' ),
			Prompt_Loader::load( 'read-file' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'path' => [ 'type' => 'string' ],
					'size' => [ 'type' => 'integer' ],
					'content' => [ 'type' => 'string' ],
				],
				'required' => [ 'path', 'size', 'content' ],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => Super_Admin_Settings::current_user_can_use() && Super_Admin_Settings::is_enabled(),
			[
				'type' => 'object',
				'properties' => [
					'path' => [
						'type' => 'string',
						'description' => __( 'File path relative to ABSPATH.', 'elementor' ),
					],
				],
				'required' => [ 'path' ],
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

		$raw_path = is_array( $input ) && isset( $input['path'] ) ? (string) $input['path'] : '';
		$resolved = Path_Validator::resolve_under_abspath( $raw_path );
		if ( empty( $resolved ) ) {
			return $this->error(
				self::ERROR_INVALID_PATH,
				__( 'Path must resolve under ABSPATH.', 'elementor' ),
				\WP_Http::BAD_REQUEST
			);
		}

		if ( ! is_file( $resolved ) ) {
			return $this->error(
				self::ERROR_NOT_A_FILE,
				__( 'Path is not a file.', 'elementor' ),
				\WP_Http::NOT_FOUND
			);
		}

		$size = (int) @filesize( $resolved ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		if ( $size > self::MAX_READ_BYTES ) {
			return $this->error(
				self::ERROR_FILE_TOO_LARGE,
				sprintf(
					/* translators: %d: max bytes */
					__( 'File exceeds the %d byte read limit.', 'elementor' ),
					self::MAX_READ_BYTES
				),
				\WP_Http::REQUEST_ENTITY_TOO_LARGE
			);
		}

		$content = file_get_contents( $resolved ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $content ) {
			return $this->error(
				self::ERROR_READ_FAILED,
				__( 'Failed to read file.', 'elementor' ),
				\WP_Http::INTERNAL_SERVER_ERROR
			);
		}

		return [
			'path'    => $resolved,
			'size'    => $size,
			'content' => $content,
		];
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}
