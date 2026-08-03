<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Children_Dependency_Evaluator;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Reconcile_Component_Instance_Elements {
	public static function apply( array $elements ): array {
		return array_map( [ self::class, 'reconcile_element' ], $elements );
	}

	private static function reconcile_element( array $element ): array {
		if ( ! empty( $element['elements'] ) ) {
			$element['elements'] = array_map( [ self::class, 'reconcile_element' ], $element['elements'] );
		}

		$instance = Plugin::$instance->elements_manager->create_element_instance( $element );

		if ( ! Utils::is_atomic( $instance ) ) {
			return $element;
		}

		/** @var Atomic_Element_Base|Atomic_Widget_Base $instance */
		$dependencies = $instance->get_config()['children_dependencies'] ?? [];

		if ( empty( $dependencies ) ) {
			return $element;
		}

		$resolved_settings = Render_Props_Resolver::for_settings()->resolve(
			$instance::get_props_schema(),
			$instance->get_settings()
		);

		$children = $element['elements'] ?? [];

		foreach ( $dependencies as $rule ) {
			$is_met = Children_Dependency_Evaluator::is_met( $rule['when'] ?? null, $resolved_settings );
			$child_type = $rule['child_type'];
			$index = self::find_child_index( $children, $child_type );
			$is_present = $index >= 0;

			if ( $is_met && ! $is_present ) {
				$model = $rule['default_model'] ?? [ 'elType' => $child_type ];
				$insert_at = self::resolve_insert_index( $rule['position'] ?? [], $children );
				array_splice( $children, $insert_at, 0, [ $model ] );
				continue;
			}

			if ( ! $is_met && $is_present ) {
				array_splice( $children, $index, 1 );
			}
		}

		if ( ! empty( $children ) ) {
			$element['elements'] = array_map( [ self::class, 'reconcile_element' ], $children );
		} else {
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
