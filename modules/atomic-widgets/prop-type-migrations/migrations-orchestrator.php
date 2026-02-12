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

/**
 * Migrations orchestrator should follow the following steps:
 * 1. Check cache to see if the data is already migrated
 * 2. Resolve the schema for the current element
 * 3. Walk through the data and migrate the props if type mismatch (between data and schema) is found
 * 4. Migrate the widget keys
 * 5. Save migrated data to the database
 * 6. Save the migrated state to the cache
 */
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

	public static function is_active(): bool {
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

			$has_changes = $this->walk_and_migrate( $data, [] );

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

	private function walk_and_migrate( array &$data, array $path ): bool {
		$has_changes = false;

		Schema_Resolver::update_widget_context( $data );

		if ( $this->handle_widget_key_migrations( $data, $path ) ) {
			$has_changes = true;
		}

		foreach ( $data as $key => &$value ) {
			if ( ! is_array( $value ) || empty( $value ) ) {
				continue;
			}

			$path[] = $key;

			if ( isset( $value['$$type'] ) ) {
				$prop_type = Schema_Resolver::resolve( $key, $path );

				if ( $prop_type instanceof Prop_Type && $this->migrate_prop( $value, $prop_type ) ) {
					$has_changes = true;
				}
			} else {
				if ( $this->walk_and_migrate( $value, $path ) ) {
					$has_changes = true;
				}
			}

			array_pop( $path );
		}

		return $has_changes;
	}

	private function handle_widget_key_migrations( array &$data, array $path ): bool {
		if ( end( $path ) !== 'settings' ) {
			return false;
		}

		$element_type = Schema_Resolver::get_widget_context();

		if ( ! $element_type ) {
			return false;
		}

		$schema = Schema_Resolver::get_widget_schema( $element_type );

		if ( ! $schema ) {
			return false;
		}

		$schema_keys = array_keys( $schema );
		$data_keys_with_type = array_keys( array_filter( $data, fn( $value ) => is_array( $value ) && isset( $value['$$type'] ) ) );

		$orphaned_keys = array_diff( $data_keys_with_type, $schema_keys );
		$missing_keys = array_diff( $schema_keys, $data_keys_with_type );

		$pending_widget_key_migrations = [];

		foreach ( $orphaned_keys as $orphaned_key ) {
			$target_key = $this->loader->find_widget_key_migration( $orphaned_key, $missing_keys, $element_type );

			if ( $target_key ) {
				$pending_widget_key_migrations[ $target_key ][] = [
					'from' => $orphaned_key,
					'value' => $data[ $orphaned_key ],
				];
			}
		}

		return $this->migrate_pending_widget_keys( $data, $pending_widget_key_migrations );
	}

	private function migrate_pending_widget_keys( array &$data, array $pending_widget_key_migrations ): bool {
		$has_changes = false;

		foreach ( $pending_widget_key_migrations as $target_key => $sources ) {
			if ( count( $sources ) !== 1 ) {
				continue;
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

	private function migrate_doc( array $data, Document $document ): array {
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
