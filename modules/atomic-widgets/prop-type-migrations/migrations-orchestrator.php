<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Logger\Logger;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
	private const MIGRATIONS_STATE_META_KEY = '_elementor_migrations_state';

	private static ?self $instance = null;

	private Migrations_Loader $loader;

	private function __construct( string $migrations_base_path ) {
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

	public static function register_feature_flag_hooks(): void {
		static $registered = false;

		if ( $registered ) {
			return;
		}

		add_action(
			'elementor/experiments/feature-state-change/' . Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING,
			[ __CLASS__, 'clear_all_migration_caches' ],
			10,
			2
		);

		$registered = true;
	}

	public static function clear_all_migration_caches( $old_state = null, $new_state = null ): void {
		global $wpdb;

		$deleted = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s",
				self::MIGRATIONS_STATE_META_KEY
			)
		);

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
		try {
			if ( $this->is_already_migrated( $post_id ) ) {
				return;
			}

			$has_changes = $this->migrate_elements_recursive( $elements_data );

			if ( $has_changes ) {
				$save_callback( $elements_data );
			}

			$this->mark_as_migrated( $post_id );
		} catch ( \Exception $e ) {
			Logger::warning( 'Document migration failed', [
				'post_id' => $post_id,
				'error' => $e->getMessage(),
			] );
		}
	}

	private function migrate_elements_recursive( array &$elements_data ): bool {
		$has_changes = false;

		foreach ( $elements_data as &$element ) {
			if ( $this->is_atomic_widget( $element ) ) {
				$widget_type = $element['widgetType'] ?? '';

				if ( empty( $widget_type ) ) {
					continue;
				}

				$schema = $this->get_widget_schema( $widget_type );

				if ( empty( $schema ) ) {
					continue;
				}

				$original_settings = $element['settings'] ?? [];

				if ( empty( $original_settings ) ) {
					continue;
				}

				try {
					$result = $this->migrate_element( $original_settings, $schema, $widget_type );

					if ( $result['has_changes'] ) {
						$element['settings'] = $result['settings'];
						$has_changes = true;
					}
				} catch ( \Exception $e ) {
					Logger::warning( 'Element migration failed', [
						'widget_type' => $widget_type,
						'error' => $e->getMessage(),
					] );
				}
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

	private function is_already_migrated( int $post_id ): bool {
		$current_state = $this->get_migration_state();

		if ( empty( $current_state ) ) {
			return false;
		}

		$stored_state = get_post_meta( $post_id, self::MIGRATIONS_STATE_META_KEY, true );

		return $current_state === $stored_state;
	}

	private function mark_as_migrated( int $post_id ): void {
		update_post_meta( $post_id, self::MIGRATIONS_STATE_META_KEY, $this->get_migration_state() );
	}

	private function get_migration_state(): string {
		$hash = $this->loader->get_manifest_hash();

		if ( empty( $hash ) ) {
			return '';
		}

		return ELEMENTOR_VERSION . ':' . $hash;
	}

	private function get_widget_schema( string $widget_type ): array {
		$widget = \Elementor\Plugin::$instance->widgets_manager->get_widget_types( $widget_type );

		if ( ! $widget ) {
			return [];
		}

		if ( ! method_exists( $widget, 'get_props_schema' ) ) {
			return [];
		}

		$schema = call_user_func( [ $widget, 'get_props_schema' ] );

		return is_array( $schema ) ? $schema : [];
	}

	private function is_atomic_widget( array $element ): bool {
		if ( ! isset( $element['elType'] ) || 'widget' !== $element['elType'] ) {
			return false;
		}

		if ( ! isset( $element['widgetType'] ) ) {
			return false;
		}

		$widget = \Elementor\Plugin::$instance->widgets_manager->get_widget_types( $element['widgetType'] );

		return Atomic_Elements_Utils::is_atomic_element( $widget );
	}

	public function migrate_element( array $settings, array $schema, string $widget_type ): array {
		$migrated_settings = [];
		$missing_keys = array_keys( $schema );
		$pending_migrations = [];
		$has_changes = false;

		foreach ( $settings as $key => $value ) {
			$this->process_setting_key(
				$key,
				$value,
				$schema,
				$widget_type,
				$migrated_settings,
				$missing_keys,
				$pending_migrations,
				$has_changes
			);
		}

		$this->apply_pending_key_migrations( $pending_migrations, $schema, $migrated_settings, $has_changes );

		return [
			'settings' => $migrated_settings,
			'has_changes' => $has_changes,
		];
	}

	private function process_setting_key(
		string $key,
		$value,
		array $schema,
		string $widget_type,
		array &$migrated_settings,
		array &$missing_keys,
		array &$pending_migrations,
		bool &$has_changes
	): void {
		if ( isset( $schema[ $key ] ) ) {
			$missing_keys = array_diff( $missing_keys, [ $key ] );
			$result = $this->migrate_prop_if_needed( $value, $schema[ $key ], $key );
			$migrated_settings[ $key ] = $result['value'];

			if ( $result['has_changes'] ) {
				$has_changes = true;
			}

			return;
		}

		$target_key = $this->loader->find_widget_key_migration( $key, $missing_keys, $widget_type );

		if ( $target_key ) {
			$pending_migrations[ $target_key ][] = [
				'from' => $key,
				'value' => $value,
			];
		} else {
			$migrated_settings[ $key ] = $value;
		}
	}

	private function apply_pending_key_migrations( array $pending_migrations, array $schema, array &$migrated_settings, bool &$has_changes ): void {
		foreach ( $pending_migrations as $target_key => $sources ) {
			if ( count( $sources ) === 1 ) {
				$result = $this->migrate_prop_if_needed(
					$sources[0]['value'],
					$schema[ $target_key ],
					$target_key
				);
				$migrated_settings[ $target_key ] = $result['value'];

				$has_changes = true;
			} else {
				foreach ( $sources as $source ) {
					$migrated_settings[ $source['from'] ] = $source['value'];
				}
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

		$trigger = $this->type_mismatch( $value, $actual_prop_type, $prop_name );

		if ( $trigger ) {
			$path_result = $this->loader->find_migration_path(
				$trigger['found_type'],
				$trigger['expected_type']
			);

			if ( $path_result ) {
				$value = $this->execute_prop_migration( $value, $path_result['migrations'], $path_result['direction'] );
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
}
