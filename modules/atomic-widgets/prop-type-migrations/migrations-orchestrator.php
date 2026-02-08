<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Logger\Logger;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
	const EXPERIMENT_BC_MIGRATIONS = 'e_bc_migrations';
	private const MIGRATIONS_STATE_META_KEY = '_elementor_migrations_state';
	private ?array $style_schema = null;

	private static ?self $instance = null;

	private Migrations_Loader $loader;

	private function __construct( ?string $migrations_base_path ) {
		$migrations_base_path = $migrations_base_path ?? $this->get_migrations_base_path();

		$this->loader = Migrations_Loader::make( $migrations_base_path );
	}

	public function register_hooks() {
		if ( ! self::is_active() ) {
			return;
		}

		add_filter( 'elementor/document/load/data', fn ( $data, $document ) => $this->backward_compatibility_migrations( $data, $document ), 10, 2 );
	}

	private function backward_compatibility_migrations( array $data, $document ): array {
		$this->migrate_document(
			$data,
			$document->get_post()->ID,
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
		// define this in wp-config.php to use local migrations i.e. __DIR__ . '/wp-content/plugins/elementor/migrations/'
		if ( defined( 'ELEMENTOR_MIGRATIONS_PATH' ) ) {
			return ELEMENTOR_MIGRATIONS_PATH;
		}

		return 'https://migrations.elementor.com/';
	}

	public static function make( ?string $migrations_base_path = null ): self {
		if ( null === self::$instance ) {
			self::$instance = new self( $migrations_base_path );
		}

		return self::$instance;
	}

	public static function destroy(): void {
		Migrations_Loader::destroy();
		self::$instance = null;
	}

	/**
	 * Registers hooks to listen for experiment flag state changes.
	 *
	 * Usage example:
	 * ```
	 * static $registered = false;
	 * if ( $registered ) {
	 *     return;
	 * }
	 *
	 * add_action(
	 *     'elementor/experiments/feature-state-change/' . Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING,
	 *     [ __CLASS__, 'clear_migration_cache' ],
	 *     10,
	 *     2
	 * );
	 *
	 * $registered = true;
	 * ```
	 *
	 * This ensures that when the inline editing experiment is enabled or disabled, all
	 * migration state metadata is cleared, forcing documents to be re-migrated with the
	 * new feature flag state.
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
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s",
				self::MIGRATIONS_STATE_META_KEY
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

	public function migrate_document(
		array &$elements_data,
		int $post_id,
		callable $save_callback
	): void {
		$this->migrate_entity(
			$elements_data,
			$post_id,
			[ $this, 'migrate_elements_recursive' ],
			$save_callback,
			'Document',
			'post_id'
		);
	}

	public function migrate_global_classes(
		array &$global_classes_data,
		int $post_id,
		callable $save_callback,
		?array $schema = null
	): void {
		$schema = $schema ?? $this->get_style_schema();

		$this->migrate_entity(
			$global_classes_data,
			$post_id,
			fn( array &$data ) => $this->migrate_global_classes_items( $data, $schema ),
			$save_callback,
			'Global classes',
			'post_id'
		);
	}

	private function migrate_global_classes_items( array &$data, array $schema ): bool {
		$has_changes = false;

		if ( empty( $data['items'] ) ) {
			return $has_changes;
		}

		foreach ( $data['items'] as &$item ) {
			if ( isset( $item['props'] ) && $this->migrate_node( $item['props'], $schema, 'global-class' ) ) {
				$has_changes = true;
			}

			if ( empty( $item['variants'] ) ) {
				continue;
			}

			foreach ( $item['variants'] as &$variant ) {
				if ( ! isset( $variant['props'] ) ) {
					continue;
				}

				if ( $this->migrate_node( $variant['props'], $schema, 'global-class' ) ) {
					$has_changes = true;
				}
			}
			unset( $variant );
		}
		unset( $item );

		return $has_changes;
	}

	private function migrate_entity(
		array &$data,
		int $entity_id,
		callable $migrate_logic,
		callable $save_callback,
		string $entity_type,
		string $entity_id_key = 'entity_id'
	): void {
		try {
			if ( $this->is_migrated( $entity_id ) ) {
				return;
			}

			$has_changes = $migrate_logic( $data );

			if ( $has_changes ) {
				$save_callback( $data );
			}

			$this->mark_as_migrated( $entity_id );
		} catch ( \Exception $e ) {
			Logger::warning( $entity_type . ' migration failed', [
				$entity_id_key => $entity_id,
				'error' => $e->getMessage(),
			] );
		}
	}

	private function migrate_elements_recursive( array &$elements_data ): bool {
		$has_changes = false;

		foreach ( $elements_data as &$element ) {
			$element_type = $element['widgetType'] ?? $element['elType'] ?? '';

			try {
				$element_has_changes = $this->walk_and_migrate( $element );

				if ( $element_has_changes ) {
					$has_changes = true;
				}
			} catch ( \Exception $e ) {
				Logger::warning( 'Element migration failed', [
					'element_type' => $element_type,
					'error' => $e->getMessage(),
				] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$nested_has_changes = $this->migrate_elements_recursive( $element['elements'] );

				if ( $nested_has_changes ) {
					$has_changes = true;
				}
			}
		}

		return $has_changes;
	}

	private function walk_and_migrate( array &$data, ?array $schema = null, ?array $context = null ): bool {
		$has_changes = false;

		if ( null === $schema ) {
			$schema = $this->try_get_schema( $data, $context );
		}

		if ( ! empty( $schema ) ) {
			$element_type = $context['element_type'] ?? 'unknown';
			$migrate_changes = $this->migrate_node( $data, $schema, $element_type );

			if ( $migrate_changes ) {
				$has_changes = true;
			}
		}

		foreach ( $data as $key => &$value ) {
			if ( 'elements' === $key ) {
				continue;
			}

			if ( ! is_array( $value ) || empty( $value ) ) {
				continue;
			}

			$nested_context = $this->build_context( $data, $key, $context );
			$nested_changes = $this->walk_and_migrate( $value, null, $nested_context );

			if ( $nested_changes ) {
				$has_changes = true;
			}
		}

		return $has_changes;
	}

	private function try_get_schema( array $data, ?array $context ): array {
		if ( isset( $context['key'] ) && 'settings' === $context['key'] && isset( $context['parent']['elType'] ) ) {
			return $this->get_props_schema( $context['parent'] );
		}

		if ( isset( $context['key'] ) && 'props' === $context['key'] ) {
			return $this->get_style_schema();
		}

		return [];
	}

	private function build_context( array $parent, $key, ?array $existing_context ): array {
		$context = [
			'key' => $key,
			'parent' => $parent,
		];

		if ( isset( $existing_context['element_type'] ) ) {
			$context['element_type'] = $existing_context['element_type'];
		} elseif ( isset( $parent['widgetType'] ) || isset( $parent['elType'] ) ) {
			$context['element_type'] = $parent['widgetType'] ?? $parent['elType'] ?? 'unknown';
		}

		return $context;
	}

	private function is_migrated( int $id ): bool {
		$current_state = $this->get_migration_state();

		if ( empty( $current_state ) ) {
			return false;
		}

		$stored_state = get_post_meta( $id, self::MIGRATIONS_STATE_META_KEY, true );

		return $current_state === $stored_state;
	}

	private function mark_as_migrated( int $id ): void {
		update_post_meta( $id, self::MIGRATIONS_STATE_META_KEY, $this->get_migration_state() );
	}

	private function get_migration_state(): string {
		$hash = $this->loader->get_manifest_hash();

		if ( empty( $hash ) ) {
			return '';
		}

		return ELEMENTOR_VERSION . ':' . $hash;
	}

	private function get_props_schema( array $entity_data ): array {
		$type = Atomic_Elements_Utils::get_element_type( $entity_data );
		$instance = Atomic_Elements_Utils::get_element_instance( $type );

		if ( ! $instance || ! method_exists( $instance, 'get_props_schema' ) ) {
			return [];
		}

		$schema = call_user_func( [ $instance, 'get_props_schema' ] );

		return is_array( $schema ) ? $schema : [];
	}

	private function get_style_schema(): array {
		if ( null === $this->style_schema ) {
			$this->style_schema = Style_Schema::get();
		}

		return $this->style_schema;
	}

	public function migrate_node( array &$settings, array $schema, string $type ): bool {
		$missing_keys = array_keys( $schema );
		$pending_migrations = [];
		$has_changes = false;
		foreach ( $settings as $key => $value ) {
			if ( ! isset( $schema[ $key ] ) ) {
				$this->process_missing_key( $key, $value, $type, $missing_keys, $pending_migrations );
			} else {
				$missing_keys = array_diff( $missing_keys, [ $key ] );

				if ( $this->process_setting_key( $key, $value, $schema, $settings ) ) {
					$has_changes = true;
				}
			}
		}

		$this->apply_pending_key_migrations( $pending_migrations, $schema, $settings, $has_changes );

		return $has_changes;
	}

	private function process_setting_key(
		string $key,
		$value,
		array $schema,
		array &$settings
	): bool {
		$result = $this->migrate_prop_if_needed( $value, $schema[ $key ], $key );
		$settings[ $key ] = $result['value'];

		return $result['has_changes'];
	}

	private function process_missing_key(
		string $key,
		$value,
		string $widget_type,
		array $missing_keys,
		array &$pending_migrations
	): void {
		$target_key = $this->loader->find_widget_key_migration( $key, $missing_keys, $widget_type );

		if ( $target_key ) {
			$pending_migrations[ $target_key ][] = [
				'from' => $key,
				'value' => $value,
			];
		}
	}

	private function apply_pending_key_migrations( array $pending_migrations, array $schema, array &$settings, bool &$has_changes ): void {
		foreach ( $pending_migrations as $target_key => $sources ) {
			if ( count( $sources ) === 1 ) { // sanity check for only one key source, otherwise no-op
				$result = $this->migrate_prop_if_needed(
					$sources[0]['value'],
					$schema[ $target_key ],
					$target_key
				);

				$settings[ $target_key ] = $result['value'];
				unset( $settings[ $sources[0]['from'] ] );
				$has_changes = true;
			}
		}
	}

	private function migrate_prop_if_needed( $value, $prop_type, string $key ): array {
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

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_BC_MIGRATIONS );
	}
}
