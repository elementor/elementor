<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Path_Validator;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Directory_Ability extends Abstract_Ability {

	const MAX_LIST_ENTRIES = 1000;

	const ERROR_INVALID_PATH = 'invalid_path';
	const ERROR_NOT_A_DIR = 'not_a_directory';
	const ERROR_OPEN_FAILED = 'open_failed';

	protected function get_ability_id(): string {
		return 'elementor/list-directory';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Directory', 'elementor' ),
			Prompt_Loader::load( 'list-directory' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'path' => [ 'type' => 'string' ],
					'entries' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'name' => [ 'type' => 'string' ],
								'type' => [ 'type' => 'string' ],
								'size' => [ 'type' => [ 'integer', 'null' ] ],
							],
						],
					],
					'truncated' => [ 'type' => 'boolean' ],
				],
				'required' => [ 'path', 'entries', 'truncated' ],
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
						'description' => __( 'Directory path relative to ABSPATH.', 'elementor' ),
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

		if ( ! is_dir( $resolved ) ) {
			return $this->error(
				self::ERROR_NOT_A_DIR,
				__( 'Path is not a directory.', 'elementor' ),
				\WP_Http::NOT_FOUND
			);
		}

		$entries = [];
		$count = 0;
		$truncated = false;

		$dh = @opendir( $resolved ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		if ( false === $dh ) {
			return $this->error(
				self::ERROR_OPEN_FAILED,
				__( 'Failed to open directory.', 'elementor' ),
				\WP_Http::INTERNAL_SERVER_ERROR
			);
		}

		while ( false !== ( $name = readdir( $dh ) ) ) {
			if ( '.' === $name || '..' === $name ) {
				continue;
			}
			if ( $count >= self::MAX_LIST_ENTRIES ) {
				$truncated = true;
				break;
			}
			$full = trailingslashit( $resolved ) . $name;
			$is_dir = is_dir( $full );
			$entries[] = [
				'name' => $name,
				'type' => $is_dir ? 'dir' : 'file',
				'size' => $is_dir ? null : (int) @filesize( $full ), // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			];
			$count++;
		}
		closedir( $dh );

		return [
			'path'      => $resolved,
			'entries'   => $entries,
			'truncated' => $truncated,
		];
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}
