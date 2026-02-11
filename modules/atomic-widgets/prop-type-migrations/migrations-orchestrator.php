<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Logger\Logger;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
	const EXPERIMENT_BC_MIGRATIONS = 'e_bc_migrations';
	const MIGRATIONS_URL = 'https://migrations.elementor.com/';

	private static ?self $instance = null;

	private Migrations_Loader $loader;
	private ?string $migrations_path = null;

	private function __construct( ?string $migrations_path = null ) {
		$this->migrations_path = $migrations_path;
		$this->loader = Migrations_Loader::make( $this->get_migrations_base_path() );
	}

	public function register_hooks() {
		if ( ! self::is_active() ) {
			return;
		}

		add_filter( 'elementor/document/load/data', fn ( $data, $document ) => $this->migrate_doc( $data, $document ), 10, 2 );
	}

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_BC_MIGRATIONS );
	}

	public static function make( ?string $migrations_path = null ): self {
		if ( null === self::$instance ) {
			self::$instance = new self( $migrations_path );
		}

		return self::$instance;
	}

	public static function destroy(): void {
		Migrations_Loader::destroy();
		self::$instance = null;
	}

	public static function register_affecting_feature_flag_hooks( array $features ): void {
		if ( ! self::is_active() ) {
			return;
		}

		foreach ( $features as $feature ) {
			add_action( 'elementor/experiments/feature-state-change/' . $feature, [ __CLASS__, 'clear_migration_cache' ], 10, 2 );
		}
	}

	public static function clear_migration_cache(): void {
		Migrations_Cache::clear_all();
	}

	public function migrate( array &$data, int $entity_id, string $data_identifier, callable $save_callback ): void {
		try {
			if ( Migrations_Cache::is_migrated( $entity_id, $data_identifier, $this->loader->get_manifest_hash() ) ) {
				return;
			}

			$has_changes = $this->walk_and_migrate( $data );

			if ( $has_changes ) {
				$save_callback( $data );
			}

			Migrations_Cache::mark_as_migrated( $entity_id, $data_identifier, $this->loader->get_manifest_hash() );
		} catch ( \Exception $e ) {
			Logger::warning( 'Migration failed', [
				'entity_id' => $entity_id,
				'data_identifier' => $data_identifier,
				'error' => $e->getMessage(),
			] );
		}
	}

	public function walk_and_migrate( array &$data, ?array $schema = null, ?string $element_type = null ): bool {
		$has_changes = false;
		$missing_keys = $schema ? array_keys( $schema ) : [];
		$pending_widget_key_migrations = [];

		foreach ( $data as $key => &$value ) {
			if ( ! is_array( $value ) || empty( $value ) ) {
				continue;
			}

			$resolved = Schema_Resolver::resolve( $key, $data );

			if ( $resolved ) {
				if ( $this->walk_and_migrate( $value, $resolved['schema'], $resolved['element_type'] ) ) {
					$has_changes = true;
				}

				continue;
			}

		if ( $schema ) {
			// interactions is not properly defined with props, so a bit of a special case
			if ( $key === 'items' && is_array( $schema ) && isset( $schema[0] ) && $schema[0] instanceof Prop_Type ) {
				$item_type = $schema[0];

				foreach ( $value as &$item ) {
					if ( $this->migrate_prop( $item, $item_type ) ) {
						$has_changes = true;
					}
				}

				continue;
			}

			if ( ! isset( $value['$$type'] ) ) {
				continue;
			}

			$prop_type = $schema[ $key ] ?? null;

			if ( $prop_type instanceof Prop_Type ) {
				$missing_keys = array_diff( $missing_keys, [ $key ] );

				if ( $this->migrate_prop( $value, $prop_type ) ) {
					$has_changes = true;
				}
			} elseif ( $element_type ) {
				$target_key = $this->loader->find_widget_key_migration( $key, $missing_keys, $element_type );

				if ( $target_key ) {
					$pending_widget_key_migrations[ $target_key ][] = [
						'from' => $key,
						'value' => $value,
					];
				}
			}

			continue;
		}

			if ( $this->walk_and_migrate( $value ) ) {
				$has_changes = true;
			}
		}

		if ( $element_type && ! empty( $pending_widget_key_migrations ) ) {
			return $this->migrate_pending_widget_keys( $data, $pending_widget_key_migrations, $schema );
		}

		return $has_changes;
	}

	private function migrate_pending_widget_keys( array &$data, array $pending_widget_key_migrations, array $schema ): bool {
		$has_changes = false;

		foreach ( $pending_widget_key_migrations as $target_key => $sources ) {
			if ( count( $sources ) !== 1 ) {
				continue;
			}

			$prop_type = $schema[ $target_key ] ?? null;

			if ( $prop_type instanceof Prop_Type ) {
				$this->migrate_prop( $sources[0]['value'], $prop_type );
			}

			$data[ $target_key ] = $sources[0]['value'];
			unset( $data[ $sources[0]['from'] ] );
			$has_changes = true;
		}

		return $has_changes;
	}

	private function migrate_prop( &$value, Prop_Type $prop_type ): bool {
		if ( ! is_array( $value ) || ! isset( $value['$$type'] ) || ! isset( $value['value'] ) ) {
			return false;
		}

		$actual_prop_type = $prop_type;

		if ( $prop_type instanceof Union_Prop_Type ) {
			$actual_prop_type = $this->resolve_union_type( $value, $prop_type );

			if ( ! $actual_prop_type ) {
				return false;
			}
		}

		$has_changes = false;

		if ( $actual_prop_type instanceof Object_Prop_Type && is_array( $value['value'] ) ) {
			$shape = $actual_prop_type->get_shape();

			foreach ( $value['value'] as $child_key => &$child ) {
				if ( isset( $shape[ $child_key ] ) && $shape[ $child_key ] instanceof Prop_Type ) {
					if ( $this->migrate_prop( $child, $shape[ $child_key ] ) ) {
				$has_changes = true;
					}
				}
			}
		} elseif ( $actual_prop_type instanceof Array_Prop_Type && is_array( $value['value'] ) ) {
			$item_type = $actual_prop_type->get_item_type();

			foreach ( $value['value'] as &$item ) {
				if ( $this->migrate_prop( $item, $item_type ) ) {
					$has_changes = true;
				}
			}
		}

		$found_type = $value['$$type'];
		$expected_type = $actual_prop_type::get_key();

		if ( $found_type !== $expected_type ) {
			$path_result = $this->loader->find_migration_path( $found_type, $expected_type );

			if ( $path_result ) {
				$value = $this->execute_prop_migration( $value, $path_result['migrations'], $path_result['direction'] );
				$has_changes = true;
			}
		}

		return $has_changes;
	}

	private function resolve_union_type( array $value, Union_Prop_Type $union_prop_type ): ?Prop_Type {
		$found_type = $value['$$type'] ?? null;

		if ( ! $found_type ) {
			return null;
		}

		$variant = $union_prop_type->get_prop_type( $found_type );

		if ( $variant ) {
			return $variant;
		}

		foreach ( $union_prop_type->get_prop_types() as $variant_type ) {
			if ( $this->loader->find_migration_path( $found_type, $variant_type::get_key() ) ) {
				return $variant_type;
			}
		}

		return null;
	}

	private function execute_prop_migration( $prop_value, array $migrations, string $direction ) {
		foreach ( $migrations as $migration ) {
			try {
				$operations = $this->loader->load_operations( $migration['id'] );

				if ( ! $operations || ! isset( $operations[ $direction ] ) ) {
					continue;
				}

				$prop_value = Migration_Interpreter::run(
					[ $direction => $operations[ $direction ] ],
					$prop_value,
					$direction
				);
			} catch ( \Exception $e ) {
				Logger::warning( 'Migration operation failed', [
					'migration_id' => $migration['id'],
					'direction' => $direction,
					'error' => $e->getMessage(),
				] );

				return $prop_value;
			}
		}

		return $prop_value;
	}

	private function migrate_doc( array $data, $document ): array {
		$this->migrate(
			$data,
			$document->get_post()->ID,
			Document::ELEMENTOR_DATA_META_KEY,
			function( $migrated_data ) use ( $document ) {
				$document->update_json_meta(
					Document::ELEMENTOR_DATA_META_KEY,
					$migrated_data
				);
			}
		);

		return $data;
	}

	private function get_migrations_base_path(): string {
		if ( $this->migrations_path ) {
			return $this->migrations_path;
		}

		if ( defined( 'ELEMENTOR_MIGRATIONS_PATH' ) ) {
			return constant( 'ELEMENTOR_MIGRATIONS_PATH' );
		}

		return self::MIGRATIONS_URL;
	}
}
