<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Super_Admin\Path_Validator;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Access;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Directory_Ability extends Abstract_Ability {

	use Super_Admin_Access;

	const MAX_LIST_ENTRIES = 1000;

	const ERROR_INVALID_PATH = 'invalid_path';
	const ERROR_NOT_A_DIR = 'not_a_directory';
	const ERROR_OPEN_FAILED = 'open_failed';

	protected function get_ability_id(): string {
		return 'elementor/list-directory';
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
			fn() => $this->can_use_enabled(),
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
		$refused = $this->forbidden_error() ?? $this->disabled_error();
		if ( $refused ) {
			return $refused;
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

		$dh = @opendir( $resolved ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		if ( false === $dh ) {
			return $this->error(
				self::ERROR_OPEN_FAILED,
				__( 'Failed to open directory.', 'elementor' ),
				\WP_Http::INTERNAL_SERVER_ERROR
			);
		}

		$relative_prefix = $this->relative_path_from_abspath( $raw_path );
		$valid_names = [];

		while ( false !== ( $name = readdir( $dh ) ) ) {
			if ( '.' === $name || '..' === $name ) {
				continue;
			}

			$child_relative = $this->child_relative_path( $relative_prefix, $name );
			if ( '' === Path_Validator::resolve_under_abspath( $child_relative ) ) {
				continue;
			}

			$valid_names[] = $name;
		}
		closedir( $dh );

		sort( $valid_names, SORT_STRING );

		$truncated = count( $valid_names ) > self::MAX_LIST_ENTRIES;
		$selected_names = array_slice( $valid_names, 0, self::MAX_LIST_ENTRIES );

		$entries = [];
		foreach ( $selected_names as $name ) {
			$child_relative = $this->child_relative_path( $relative_prefix, $name );
			$full = Path_Validator::resolve_under_abspath( $child_relative );
			if ( '' === $full ) {
				continue;
			}

			$is_dir = is_dir( $full );
			$entries[] = [
				'name' => $name,
				'type' => $is_dir ? 'dir' : 'file',
				'size' => $is_dir ? null : (int) @filesize( $full ), // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			];
		}

		return [
			'path'      => $resolved,
			'entries'   => $entries,
			'truncated' => $truncated,
		];
	}

	private function relative_path_from_abspath( string $path ): string {
		$trimmed = trim( $path, '/\\' );

		return $trimmed;
	}

	private function child_relative_path( string $relative_prefix, string $name ): string {
		if ( '' === $relative_prefix ) {
			return $name;
		}

		return trailingslashit( $relative_prefix ) . $name;
	}
}
