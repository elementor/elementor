<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\And_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Equals_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Exists_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\In_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Is_Array_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Is_Object_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Is_Primitive_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Not_Equals_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Not_Exists_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Not_In_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Or_Condition;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations\Delete_Operation;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations\Set_Operation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migration_Interpreter {
	private Conditions_Registry $conditions_registry;
	private Operations_Registry $operations_registry;

	private function __construct() {
		$this->conditions_registry = new Conditions_Registry();
		$this->operations_registry = new Operations_Registry();

		$this->register_default_conditions();
		$this->register_default_operations();
	}

	public static function make(): self {
		return new self();
	}

	public function interpret( array $migration_schema, array $element_data ): array {
		$operations = $migration_schema['operations'] ?? [];

		if ( empty( $operations ) ) {
			return $element_data;
		}

		foreach ( $operations as $operation_def ) {
			$element_data = $this->apply_operation( $operation_def, $element_data );
		}

		return $element_data;
	}

	public function set_conditions_registry( Conditions_Registry $registry ): self {
		$this->conditions_registry = $registry;

		return $this;
	}

	public function set_operations_registry( Operations_Registry $registry ): self {
		$this->operations_registry = $registry;

		return $this;
	}

	public function get_conditions_registry(): Conditions_Registry {
		return $this->conditions_registry;
	}

	public function get_operations_registry(): Operations_Registry {
		return $this->operations_registry;
	}

	private function apply_operation( array $operation_def, array $element_data ): array {
		$op_config = $operation_def['op'] ?? [];
		$condition_config = $operation_def['condition'] ?? null;

		$op_fn = $op_config['fn'] ?? null;
		$op_path = $op_config['path'] ?? null;

		if ( null === $op_fn || null === $op_path ) {
			return $element_data;
		}

		$operation = $this->operations_registry->get( $op_fn );

		if ( null === $operation ) {
			return $element_data;
		}

		$path_resolver = Path_Resolver::make( $element_data );
		$resolved_paths = $path_resolver->resolve( $op_path );

		foreach ( $resolved_paths as $path_info ) {
			$resolved_path = $path_info['path'];
			$wildcard_values = $path_info['wildcard_values'];

			$context = Migration_Context::make()
				->set_element_data( $element_data )
				->set_current_path( $resolved_path )
				->set_wildcard_values( $wildcard_values );

			if ( null !== $condition_config && ! $this->evaluate_condition( $condition_config, $context ) ) {
				continue;
			}

			$operation->execute( $element_data, $resolved_path, $op_config, $context );
		}

		return $element_data;
	}

	private function evaluate_condition( array $condition_config, Migration_Context $context ): bool {
		$fn = $condition_config['fn'] ?? null;
		$path_pattern = $condition_config['path'] ?? null;

		if ( null === $fn ) {
			return true;
		}

		$condition = $this->get_condition_instance( $fn, $context );

		if ( null === $condition ) {
			return false;
		}

		if ( null === $path_pattern ) {
			return $condition->evaluate( null, $condition_config );
		}

		$path_resolver = Path_Resolver::make( $context->get_element_data() );
		$resolved_path = $path_resolver->resolve_with_wildcard_binding(
			$path_pattern,
			$context->get_wildcard_values()
		);

		if ( null === $resolved_path ) {
			return false;
		}

		$value = $path_resolver->get( $resolved_path );

		return $condition->evaluate( $value, $condition_config );
	}

	private function get_condition_instance( string $fn, Migration_Context $context ) {
		if ( 'and' === $fn ) {
			return new And_Condition( $this->conditions_registry, $context );
		}

		if ( 'or' === $fn ) {
			return new Or_Condition( $this->conditions_registry, $context );
		}

		return $this->conditions_registry->get( $fn );
	}

	private function register_default_conditions(): void {
		$conditions = [
			new Exists_Condition(),
			new Not_Exists_Condition(),
			new Equals_Condition(),
			new Not_Equals_Condition(),
			new In_Condition(),
			new Not_In_Condition(),
			new Is_Primitive_Condition(),
			new Is_Object_Condition(),
			new Is_Array_Condition(),
		];

		foreach ( $conditions as $condition ) {
			$this->conditions_registry->register( $condition::get_name(), $condition );
		}
	}

	private function register_default_operations(): void {
		$operations = [
			new Set_Operation(),
			new Delete_Operation(),
		];

		foreach ( $operations as $operation ) {
			$this->operations_registry->register( $operation::get_name(), $operation );
		}
	}
}
