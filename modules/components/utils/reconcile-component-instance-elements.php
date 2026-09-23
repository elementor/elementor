<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Children_Dependency_Evaluator;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Utils\Format_Element_Ids;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Applies `children_dependencies` rules to a component's element tree at render
 * time, mirroring what the editor does on the canvas via `reconcileInitialChildren`.
 *
 * Must run *before* {@see Format_Component_Elements_Id::format()} so that children
 * inserted here are included in the instance-scoped id hashing.
 */
class Reconcile_Component_Instance_Elements {
	const ELEMENT_ID_LENGTH = 7;

	public static function apply( array $elements ): array {
		return array_map( [ self::class, 'reconcile_element' ], $elements );
	}

	private static function reconcile_element( array $element ): array {
		$children = self::resolve_children( $element );

		$element['elements'] = array_map( [ self::class, 'reconcile_element' ], $children );

		return $element;
	}

	private static function resolve_children( array $element ): array {
		$children = $element['elements'] ?? [];
		$instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		if ( ! $instance || ! Utils::is_atomic( $instance ) ) {
			return $children;
		}

		/** @var Atomic_Element_Base|Atomic_Widget_Base $instance */
		$dependencies = $instance->get_config()['children_dependencies'] ?? [];

		if ( empty( $dependencies ) ) {
			return $children;
		}

		$resolved_settings = Render_Props_Resolver::for_settings()->resolve(
			$instance::get_props_schema(),
			$instance->get_settings()
		);

		foreach ( $dependencies as $rule ) {
			$child_type = $rule['child_type'];
			$is_met = Children_Dependency_Evaluator::is_met( $rule['when'] ?? null, $resolved_settings );
			$index = self::find_child_index( $children, $child_type );
			$is_present = $index >= 0;

			if ( $is_met && ! $is_present ) {
				$model = self::derive_ids(
					$rule['default_model'] ?? [ 'elType' => $child_type ],
					( $element['id'] ?? '' ) . '_' . $child_type
				);

				array_splice( $children, self::resolve_insert_index( $rule['position'] ?? [], $children ), 0, [ $model ] );

				continue;
			}

			if ( ! $is_met && $is_present ) {
				array_splice( $children, $index, 1 );
			}
		}

		return $children;
	}

	/**
	 * `default_model` payloads are static configuration and carry no ids, so every
	 * inserted node gets one derived from the parent id and its position in the subtree.
	 * Keep in sync with `deriveIds()` in the editor's
	 * `reconcile-component-instance-elements.ts` so ids match between render and canvas.
	 */
	private static function derive_ids( array $element, string $seed ): array {
		$element['id'] = Format_Element_Ids::hash_string( $seed, self::ELEMENT_ID_LENGTH );

		if ( ! empty( $element['elements'] ) ) {
			$children = array_values( $element['elements'] );

			foreach ( $children as $index => $child ) {
				$children[ $index ] = self::derive_ids( $child, $element['id'] . '_' . $index );
			}

			$element['elements'] = $children;
		}

		return $element;
	}

	private static function find_child_index( array $children, string $child_type ): int {
		foreach ( $children as $index => $child ) {
			if ( ( $child['elType'] ?? null ) === $child_type ) {
				return $index;
			}
		}

		return -1;
	}

	private static function resolve_insert_index( array $position, array $children ): int {
		$last_index = count( $children );
		$kind = $position['kind'] ?? 'last';

		switch ( $kind ) {
			case 'first':
				return 0;

			case 'index':
				$index = isset( $position['value'] ) ? (int) $position['value'] : $last_index;

				return max( 0, min( $index, $last_index ) );

			case 'after_type':
				$anchor = self::find_child_index( $children, (string) ( $position['value'] ?? '' ) );

				return $anchor >= 0 ? $anchor + 1 : $last_index;

			case 'before_type':
				$anchor = self::find_child_index( $children, (string) ( $position['value'] ?? '' ) );

				return $anchor >= 0 ? $anchor : $last_index;

			case 'last':
			default:
				return $last_index;
		}
	}
}
