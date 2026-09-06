<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Walks an elements tree and replaces every `e-component` widget with the resolved
 * inner elements of its component post, with instance overrides baked in.
 *
 * Used at export time when components round-trip is disabled, so a page still carries
 * its content into the exported zip even though the referenced component posts are not
 * exported. Runs on the source site where component posts still exist in the DB.
 *
 * Uses `Reconcile_Component_Instance_Elements::apply()` to keep parity with the render
 * path, and then hands each root element to `Resolve_Detached_Instance::apply()`.
 * Nested `e-component` widgets found inside a resolved subtree are recursively detached,
 * guarded by a component-id stack that mirrors the `rendering_stack` guard in
 * `Component_Instance_Transformer` to protect against pre-existing circular references
 * that slipped past `Circular_Dependency_Validator`.
 */
class Detach_Component_Instances {
	/**
	 * @var callable(int): ?array
	 */
	private $resolve_component_elements;

	private array $stack = [];

	public static function apply( array $elements ): array {
		return self::apply_with_resolver( $elements, [ self::class, 'default_resolve_component_elements' ] );
	}

	/**
	 * Seam for DB-less unit tests: hands the tree walker a resolver callable that returns
	 * ready-to-detach reconciled root elements for a given component id, or null when the
	 * component is missing / cannot be resolved.
	 *
	 * @param callable(int): ?array $resolver
	 */
	public static function apply_with_resolver( array $elements, callable $resolver ): array {
		return ( new self( $resolver ) )->run( $elements );
	}

	private function __construct( callable $resolve_component_elements ) {
		$this->resolve_component_elements = $resolve_component_elements;
	}

	private function run( array $elements ): array {
		$result = [];

		foreach ( $elements as $element ) {
			foreach ( $this->process_element( $element ) as $processed ) {
				$result[] = $processed;
			}
		}

		return $result;
	}

	private function process_element( $element ): array {
		if ( ! is_array( $element ) ) {
			return [ $element ];
		}

		if ( Component_Instance_Prop_Type::is_instance_element( $element ) ) {
			$detached = $this->detach( $element );

			if ( null !== $detached ) {
				return $detached;
			}
		}

		if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$element['elements'] = $this->run( $element['elements'] );
		}

		return [ $element ];
	}

	/**
	 * Any failure inside detach (missing component, unexpected schema, transformer throw during
	 * reconcile) returns `null` so the caller keeps the original `e-component` node. The zip
	 * that carries the dangling node will be cleaned up by `Strip_Component_Instances` on
	 * import — a single missing widget is a survivable degradation, a broken export is not.
	 */
	private function detach( array $element ): ?array {
		$component_id = Component_Instance_Prop_Type::extract_component_id( $element['settings'] ?? [] );

		if ( ! is_numeric( $component_id ) ) {
			return null;
		}

		$component_id = (int) $component_id;

		if ( in_array( $component_id, $this->stack, true ) ) {
			return [];
		}

		$this->stack[] = $component_id;

		try {
			$component_elements = ( $this->resolve_component_elements )( $component_id );

			if ( ! is_array( $component_elements ) ) {
				array_pop( $this->stack );

				return null;
			}

			$overrides = Component_Instance_Prop_Type::extract_overrides( $element['settings'] ?? [] );

			$resolved = [];
			foreach ( $component_elements as $root ) {
				if ( ! is_array( $root ) ) {
					continue;
				}

				$resolved_root = Resolve_Detached_Instance::apply( $root, $overrides );

				foreach ( $this->process_element( $resolved_root ) as $processed ) {
					$resolved[] = $processed;
				}
			}
		} catch ( \Throwable $e ) {
			array_pop( $this->stack );

			return null;
		}

		array_pop( $this->stack );

		return $resolved;
	}

	private static function default_resolve_component_elements( int $component_id ): ?array {
		$component = Components_Repository::make()->get( $component_id, false );

		if ( ! $component ) {
			return null;
		}

		return Reconcile_Component_Instance_Elements::apply( $component->get_elements_data() );
	}
}
