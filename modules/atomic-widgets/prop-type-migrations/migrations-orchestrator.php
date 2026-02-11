<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Logger\Logger;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\Interactions\Schema\Interactions_Schema;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
	const EXPERIMENT_BC_MIGRATIONS = 'e_bc_migrations';
	const MIGRATIONS_URL = 'https://migrations.elementor.com/';

	private const MIGRATIONS_STATE_META_KEY = '_elementor_migrations_state';

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

		add_filter( 'elementor/document/load/data', fn ( $data, $document ) => $this->backward_compatibility_migrations( $data, $document ), 10, 2 );
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

	/**
	 * Registers hooks to listen for experiment flag state changes. Forcing documents to be re-migrated with the new feature flag state.
	 */
	public static function register_affecting_feature_flag_hooks( array $features ): void {
		if ( ! self::is_active() ) {
			return;
		}

		foreach ( $features as $feature ) {
			add_action( 'elementor/experiments/feature-state-change/' . $feature, [ __CLASS__, 'clear_migration_cache' ], 10, 2 );
		}
	}

	public static function clear_migration_cache( $old_state = null, $new_state = null ): void {
		global $wpdb;

		$deleted = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE %s",
				$wpdb->esc_like( self::MIGRATIONS_STATE_META_KEY ) . '%'
			)
		);

		if ( false === $deleted ) {
			Logger::error( 'Failed to clear migration caches', [
				'error' => $wpdb->last_error,
				'reason' => 'feature_flag_change',
				'old_state' => $old_state,
				'new_state' => $new_state,
			] );
			return;
		}

		Logger::info( 'Cleared migration caches', [
			'deleted_count' => $deleted,
			'reason' => 'feature_flag_change',
			'old_state' => $old_state,
			'new_state' => $new_state,
		] );
	}

	public function migrate( array &$data, int $entity_id, string $data_identifier, callable $save_callback ): void {
		$initial_context = [
			'type' => null,
			'parent_key' => null,
			'element_type' => null,
		];

		try {
			if ( $this->is_migrated( $entity_id, $data_identifier ) ) {
				return;
			}

			$has_changes = $this->walk_and_migrate( $data, $initial_context );

			if ( $has_changes ) {
				$save_callback( $data );
			}

			$this->mark_as_migrated( $entity_id, $data_identifier );
		} catch ( \Exception $e ) {
			Logger::warning( 'Migration failed', [
				'entity_id' => $entity_id,
				'data_identifier' => $data_identifier,
				'error' => $e->getMessage(),
			] );
		}
	}

	public function migrate_node( array &$data, array $schema, array $context ): bool {
		$missing_keys = array_keys( $schema );
		$pending_widget_key_migrations = [];
		$has_changes = false;

		foreach ( $data as $key => $value ) {
			if ( ! isset( $schema[ $key ] ) ) {
				if ( 'widget' === $context['type'] ) {
					$this->process_missing_widget_key( $key, $value, $context, $missing_keys, $pending_widget_key_migrations );
				}
			} else {
				$missing_keys = array_diff( $missing_keys, [ $key ] );

				if ( $this->process_prop_key( $key, $value, $schema, $data ) ) {
					$has_changes = true;
				}
			}
		}

		if ( 'widget' === $context['type'] ) {
			$this->apply_pending_widget_key_migrations( $pending_widget_key_migrations, $schema, $data, $has_changes );
		}

		return $has_changes;
	}

	private function walk_and_migrate( array &$data, array $context, ?array $schema = null ): bool {
		$has_changes = false;

		if ( null === $schema ) {
			$schema = $this->try_get_schema( $context );
		}

		if ( ! empty( $schema ) ) {
			$migrate_changes = $this->migrate_node( $data, $schema, $context );

			if ( $migrate_changes ) {
				$has_changes = true;
			}
		}

		foreach ( $data as $key => &$value ) {
			if ( ! is_array( $value ) || empty( $value ) ) {
				continue;
			}

			$nested_context = $this->build_context( $data, $key, $context );
			$nested_changes = $this->walk_and_migrate( $value, $nested_context );

			if ( $nested_changes ) {
				$has_changes = true;
			}
		}

		return $has_changes;
	}

	private function try_get_schema( array $context ): array {
		if ( ! isset( $context['type'] ) || null === $context['type'] ) {
			return [];
		}

		if ( 'widget' === $context['type'] ) {
			return $this->get_props_schema_by_type( $context['element_type'] );
		}

		if ( 'style' === $context['type'] ) {
			return Style_Schema::get();
		}

		if ( 'interactions' === $context['type'] ) {
			return Interactions_Schema::get()['items'];
		}

		return [];
	}

	private function build_context( array $parent, $key, array $existing_context ): array {
		$context_type = $this->determine_context_type( $parent, $key, $existing_context );

		$context = [
			'type' => $context_type,
			'parent_key' => $existing_context['parent_key'] ?? null,
		];

		if ( isset( $existing_context['element_type'] ) ) {
			$context['element_type'] = $existing_context['element_type'];
		} elseif ( isset( $parent['widgetType'] ) || isset( $parent['elType'] ) ) {
			$context['element_type'] = $parent['widgetType'] ?? $parent['elType'] ?? 'unknown';
		} else {
			$context['element_type'] = null;
		}

		if ( 'widget' === $context_type ) {
			$context['parent_key'] = $key;
		}

		return $context;
	}

	private function determine_context_type( array $parent, $key, array $existing_context ): ?string {
		$type = $existing_context['type'];
		if ( 'settings' === $key && isset( $parent['elType'] ) ) {
			$type = 'widget';
		}

		if ( 'props' === $key ) {
			$type = 'style';
		}

		if ( 'interactions' === $key ) {
			$type = 'interactions';
		}

		return $type;
	}

	private function is_migrated( int $id, string $data_identifier ): bool {
		$cache_meta_key = $this->get_cache_meta_key( $data_identifier );
		$current_state = $this->get_migration_state();

		if ( empty( $current_state ) ) {
			return false;
		}

		$stored_state = get_post_meta( $id, $cache_meta_key, true );

		return $current_state === $stored_state;
	}

	private function mark_as_migrated( int $id, string $data_identifier ): void {
		$cache_meta_key = $this->get_cache_meta_key( $data_identifier );
		update_post_meta( $id, $cache_meta_key, $this->get_migration_state() );
	}

	/**
	 * We use a suffix to cache multiple migrations, each "type" of migration should run once.
	 */
	private function get_cache_meta_key( string $data_identifier ): string {
		return self::MIGRATIONS_STATE_META_KEY . '_' . substr( md5( $data_identifier ), 0, 4 );
	}

	private function get_migration_state(): string {
		$hash = $this->loader->get_manifest_hash();

		if ( empty( $hash ) ) {
			return '';
		}

		return ELEMENTOR_VERSION . ':' . $hash;
	}

	private function get_props_schema_by_type( ?string $element_type ): array {
		if ( ! $element_type ) {
			return [];
		}

		$instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! $instance || ! method_exists( $instance, 'get_props_schema' ) ) {
			return [];
		}

		$schema = call_user_func( [ $instance, 'get_props_schema' ] );

		return is_array( $schema ) ? $schema : [];
	}

	private function process_prop_key(
		string $key,
		$value,
		array $schema,
		array &$data
	): bool {
		$result = $this->migrate_prop_if_needed( $value, $schema[ $key ], $key );
		$data[ $key ] = $result['value'];

		return $result['has_changes'];
	}

	private function process_missing_widget_key(
		string $key,
		$value,
		array $context,
		array $missing_keys,
		array &$pending_widget_key_migrations
	): void {
		$widget_type = $context['element_type'] ?? 'unknown';
		$target_key = $this->loader->find_widget_key_migration( $key, $missing_keys, $widget_type );

		if ( $target_key ) {
			$pending_widget_key_migrations[ $target_key ][] = [
				'from' => $key,
				'value' => $value,
			];
		}
	}

	private function apply_pending_widget_key_migrations( array $pending_widget_key_migrations, array $schema, array &$data, bool &$has_changes ): void {
		foreach ( $pending_widget_key_migrations as $target_key => $sources ) {
			if ( count( $sources ) === 1 ) {
				$result = $this->migrate_prop_if_needed(
					$sources[0]['value'],
					$schema[ $target_key ],
					$target_key
				);

				$data[ $target_key ] = $result['value'];
				unset( $data[ $sources[0]['from'] ] );
				$has_changes = true;
			}
		}
	}

	private function migrate_prop_if_needed( $value, $prop_type, string $key ): array {
		if ( is_array( $prop_type ) && ! isset( $prop_type['$$type'] ) && is_array( $value ) && ! isset( $value['$$type'] ) ) {
			foreach ( $value as $index => $value_item ) {
				$result = $this->migrate_prop_if_needed( $value_item, $prop_type[ $index ], $key );
				if ( $result['has_changes'] ) {
					return $result;
				}
			}
		}

		if ( ! ( $prop_type instanceof Prop_Type ) ) {
			return [
				'value' => $value,
				'has_changes' => false,
			];
		}

		return $this->migrate_prop( $value, $prop_type, $key );
	}

	private function migrate_prop( $value, Prop_Type $prop_type, string $prop_name ): array {
		$has_changes = false;

		if ( ! is_array( $value ) || ! isset( $value['$$type'] ) || ! isset( $value['value'] ) ) {
			return [
				'value' => $value,
				'has_changes' => false,
			];
		}

		$actual_prop_type = $prop_type;

		if ( $prop_type instanceof Union_Prop_Type ) {
			$actual_prop_type = $this->resolve_union_type( $value, $prop_type );

			if ( ! $actual_prop_type ) {
				return [
					'value' => $value,
					'has_changes' => false,
				];
			}
		}

		$trigger = $this->type_mismatch( $value, $actual_prop_type, $prop_name );

		if ( $trigger ) {
			$path_result = $this->loader->find_migration_path(
				$trigger['found_type'],
				$trigger['expected_type']
			);

			if ( $path_result ) {
				$value = $this->execute_prop_migration( $value, $path_result['migrations'], $path_result['direction'] );
				return [
					'value' => $value,
					'has_changes' => true,
				];
			}
		}

		if ( $actual_prop_type instanceof Object_Prop_Type && is_array( $value['value'] ) ) {
			$shape = $actual_prop_type->get_shape();
			$nested_result = $this->migrate_nested_object( $value['value'], $shape );

			if ( $nested_result['has_changes'] ) {
				$value['value'] = $nested_result['value'];
				$has_changes = true;
			}
		} elseif ( $actual_prop_type instanceof Array_Prop_Type && is_array( $value['value'] ) ) {
			$item_type = $actual_prop_type->get_item_type();
			$nested_result = $this->migrate_nested_array( $value['value'], $item_type );

			if ( $nested_result['has_changes'] ) {
				$value['value'] = $nested_result['value'];
				$has_changes = true;
			}
		}

		return [
			'value' => $value,
			'has_changes' => $has_changes,
		];
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
			$expected_key = $variant_type::get_key();

			$path_exists = $this->loader->find_migration_path( $found_type, $expected_key );

			if ( $path_exists ) {
				return $variant_type;
			}
		}

		return null;
	}

	private function migrate_nested_object( array $values, array $shape ): array {
		$has_changes = false;
		$migrated = [];

		foreach ( $values as $key => $value ) {
			if ( ! isset( $shape[ $key ] ) || ! ( $shape[ $key ] instanceof Prop_Type ) ) {
				$migrated[ $key ] = $value;
				continue;
			}

			$result = $this->migrate_prop( $value, $shape[ $key ], $key );
			$migrated[ $key ] = $result['value'];

			if ( $result['has_changes'] ) {
				$has_changes = true;
			}
		}

		return [
			'value' => $migrated,
			'has_changes' => $has_changes,
		];
	}

	private function migrate_nested_array( array $items, Prop_Type $item_type ): array {
		$has_changes = false;
		$migrated = [];

		foreach ( $items as $index => $item ) {
			$result = $this->migrate_prop( $item, $item_type, (string) $index );
			$migrated[ $index ] = $result['value'];

			if ( $result['has_changes'] ) {
				$has_changes = true;
			}
		}

		return [
			'value' => $migrated,
			'has_changes' => $has_changes,
		];
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

	private function backward_compatibility_migrations( array $data, $document ): array {
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
