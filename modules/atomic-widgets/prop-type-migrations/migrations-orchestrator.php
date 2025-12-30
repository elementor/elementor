<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
	private static ?self $instance = null;

	private Migrations_Loader $loader;

	private string $migrations_base_path;

	private function __construct( string $migrations_base_path ) {
		$this->migrations_base_path = $migrations_base_path;
		$this->loader = Migrations_Loader::make( $migrations_base_path );
	}

	public static function make( string $migrations_base_path ): self {
		if ( null === self::$instance ) {
			self::$instance = new self( $migrations_base_path );
		}

		return self::$instance;
	}

	public static function destroy(): void {
		self::$instance = null;
	}

	public function migrate( array $settings, array $schema, string $widget_type ): array {
		$migration_triggers = $this->detect_type_mismatches( $settings, $schema );

		if ( empty( $migration_triggers ) ) {
			return $settings;
		}

		$migrated_settings = $settings;

		foreach ( $migration_triggers as $trigger ) {
			$path_result = $this->loader->find_migration_path(
				$trigger['found_type'],
				$trigger['expected_type'],
				$widget_type,
				$trigger['prop_name']
			);

			if ( ! $path_result ) {
				continue;
			}

			$migrated_settings = $this->execute_migrations(
				$migrated_settings,
				$path_result['migrations'],
				$path_result['direction'],
				$trigger['prop_name']
			);
		}

		return $migrated_settings;
	}

	private function detect_type_mismatches( array $settings, array $schema ): array {
		$migration_triggers = [];

		foreach ( $schema as $prop_name => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			if ( ! isset( $settings[ $prop_name ] ) ) {
				continue;
			}

			$trigger = $this->check_prop(
				$settings[ $prop_name ],
				$prop_type,
				$prop_name,
				[ $prop_name ]
			);

			if ( $trigger ) {
				$migration_triggers[] = $trigger;
			}
		}

		return $migration_triggers;
	}

	private function check_prop( $value, Prop_Type $prop_type, string $prop_name, array $path ): ?array {
		if ( $prop_type->validate( $value ) ) {
			return null;
		}

		$trigger = $this->type_mismatch( $value, $prop_type, $prop_name );
		if ( $trigger ) {
			return $trigger;
		}

		return null;
	}

	private function type_mismatch( $value, Prop_Type $prop_type, string $prop_name ): ?array {
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
			'reason' => 'type_mismatch',
		];
	}

	private function execute_migrations( array $settings, array $migrations, string $direction, string $prop_name ): array {
		$prop_value = $settings[ $prop_name ] ?? null;

		foreach ( $migrations as $migration ) {
			$operations = $this->loader->load_operations( $migration['id'] );

			if ( ! $operations || ! isset( $operations[ $direction ] ) ) {
				continue;
			}

			$prop_value = Migration_Interpreter::run(
				[ $direction => $operations[ $direction ] ],
				$prop_value
			);
		}

		$settings[ $prop_name ] = $prop_value;

		return $settings;
	}
}

