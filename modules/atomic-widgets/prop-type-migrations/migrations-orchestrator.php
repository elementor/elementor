<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Orchestrator {
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

	public function migrate_document(
		array &$elements_data,
		int $post_id,
		callable $save_callback
	): void {
		if ( $this->is_already_migrated( $post_id ) ) {
			return;
		}

		$has_changes = false;

		foreach ( $elements_data as &$element ) {
			if ( ! $this->is_atomic_widget( $element ) ) {
				continue;
			}

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

			$result = $this->migrate_element( $original_settings, $schema, $widget_type );

			if ( $result['has_changes'] ) {
				$element['settings'] = $result['settings'];
				$has_changes = true;
			}
		}

		if ( $has_changes ) {
			$save_callback( $elements_data );
		}

		$this->mark_as_migrated( $post_id );
	}

	private function is_already_migrated( int $post_id ): bool {
		$cached_version = get_post_meta( $post_id, '_elementor_data_version', true );
		return $cached_version === ELEMENTOR_VERSION;
	}

	private function mark_as_migrated( int $post_id ): void {
		update_post_meta( $post_id, '_elementor_data_version', ELEMENTOR_VERSION );
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
			$pending_migrations[ $target_key ][] = [ 'from' => $key, 'value' => $value ];
			$has_changes = true;
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

				if ( $result['has_changes'] ) {
					$has_changes = true;
				}
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
		if ( $prop_type->validate( $value ) ) {
			return [
				'value' => $value,
				'has_changes' => false,
			];
		}

		$trigger = $this->type_mismatch( $value, $prop_type, $prop_name );

		if ( ! $trigger ) {
			return [
				'value' => $value,
				'has_changes' => false,
			];
		}

		$path_result = $this->loader->find_migration_path(
			$trigger['found_type'],
			$trigger['expected_type']
		);

		if ( ! $path_result ) {
			return [
				'value' => $value,
				'has_changes' => false,
			];
		}

		$migrated_value = $this->execute_prop_migration( $value, $path_result['migrations'], $path_result['direction'] );

		return [
			'value' => $migrated_value,
			'has_changes' => true,
		];
	}

	private function execute_prop_migration( $prop_value, array $migrations, string $direction ) {
		foreach ( $migrations as $migration ) {
			$operations = $this->loader->load_operations( $migration['id'] );

			if ( ! $operations || ! isset( $operations[ $direction ] ) ) {
				continue;
			}

			$prop_value = Migration_Interpreter::run(
				[ $direction => $operations[ $direction ] ],
				$prop_value,
				$direction
			);
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

