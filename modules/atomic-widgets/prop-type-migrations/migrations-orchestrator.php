<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
	private static ?self $instance = null;

	private Migrations_Loader $loader;

	private function __construct() {
		$this->loader = Migrations_Loader::instance();
	}

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function migrate( array $settings, array $schema, ?int $post_id, string $widget_type ): array {
		$mismatches = $this->detect_type_mismatches( $settings, $schema );

		if ( empty( $mismatches ) ) {
			return $settings;
		}

		$migrated_settings = $settings;

		foreach ( $mismatches as $mismatch ) {
			$path_result = $this->loader->find_migration_path(
				$mismatch['found_type'],
				$mismatch['expected_type'],
				$widget_type,
				$mismatch['prop_name']
			);

			if ( ! $path_result ) {
				continue;
			}

			$migrated_settings = $this->execute_migrations(
				$migrated_settings,
				$path_result['migrations'],
				$path_result['direction']
			);
		}

		return $migrated_settings;
	}

	private function detect_type_mismatches( array $settings, array $schema ): array {
		$mismatches = [];

		foreach ( $schema as $prop_name => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			if ( ! isset( $settings[ $prop_name ] ) ) {
				continue;
			}

			$mismatch = $this->check_prop_mismatch(
				$settings[ $prop_name ],
				$prop_type,
				$prop_name,
				[ $prop_name ]
			);

			if ( $mismatch ) {
				$mismatches[] = $mismatch;
			}
		}

		return $mismatches;
	}

	private function check_prop_mismatch( $value, Prop_Type $prop_type, string $prop_name, array $path ): ?array {
		if ( $prop_type->validate( $value ) ) {
			return null;
		}

		if ( ! is_array( $value ) || ! isset( $value['$$type'] ) ) {
			return null;
		}

		$expected_type = $prop_type::get_key();
		$found_type = $value['$$type'];

		if ( $found_type === $expected_type ) {
			return null;
		}

		return [
			'prop_name' => $prop_name,
			'found_type' => $found_type,
			'expected_type' => $expected_type,
		];
	}

	private function execute_migrations( array $settings, array $migrations, string $direction ): array {
		foreach ( $migrations as $migration ) {
			$operations = $this->loader->load_operations( $migration['id'] );

			if ( ! $operations || ! isset( $operations[ $direction ] ) ) {
				continue;
			}

			$settings = Migration_Interpreter::run(
				[ $direction => $operations[ $direction ] ],
				$settings
			);
		}

		return $settings;
	}
}

