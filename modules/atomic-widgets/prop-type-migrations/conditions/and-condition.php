<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions_Registry;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Path_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class And_Condition extends Condition_Base {
	private Conditions_Registry $registry;
	private Migration_Context $context;

	public function __construct( Conditions_Registry $registry, Migration_Context $context ) {
		$this->registry = $registry;
		$this->context = $context;
	}

	public static function get_name(): string {
		return 'and';
	}

	public function evaluate( $value, array $condition_config ): bool {
		$conditions = $condition_config['conditions'] ?? [];

		if ( empty( $conditions ) ) {
			return true;
		}

		$path_resolver = Path_Resolver::make( $this->context->get_element_data() );
		$wildcard_values = $this->context->get_wildcard_values();

		foreach ( $conditions as $sub_condition ) {
			if ( ! $this->evaluate_sub_condition( $sub_condition, $path_resolver, $wildcard_values ) ) {
				return false;
			}
		}

		return true;
	}

	private function evaluate_sub_condition( array $sub_condition, Path_Resolver $path_resolver, array $wildcard_values ): bool {
		$fn = $sub_condition['fn'] ?? null;
		$path_pattern = $sub_condition['path'] ?? null;

		if ( null === $fn ) {
			return false;
		}

		$condition = $this->registry->get( $fn );

		if ( null === $condition ) {
			return false;
		}

		if ( null === $path_pattern ) {
			return $condition->evaluate( null, $sub_condition );
		}

		$resolved_path = $path_resolver->resolve_with_wildcard_binding( $path_pattern, $wildcard_values );

		if ( null === $resolved_path ) {
			return false;
		}

		$condition_value = $path_resolver->get( $resolved_path );

		return $condition->evaluate( $condition_value, $sub_condition );
	}
}
