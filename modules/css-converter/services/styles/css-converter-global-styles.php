<?php

namespace Elementor\Modules\CssConverter\Services\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\AtomicWidgets\CacheValidity\Cache_Validity;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * CSS Converter Global Styles
 *
 * Integrates CSS Converter generated global classes with Elementor's atomic widgets CSS system.
 * Uses the official elementor/atomic-widgets/styles/register hook for proper CSS injection.
 */
class CSS_Converter_Global_Styles {
	const STYLES_KEY = 'css-converter-global';

	/**
	 * @var array Pending global classes to be registered with atomic system
	 */
	private static array $pending_global_classes = [];

	/**
	 * @var bool Whether hooks have been registered
	 */
	private static bool $hooks_registered = false;

	public static function make(): self {
		return new self();
	}

	/**
	 * Add global classes to be registered with atomic widgets system
	 */
	public static function add_global_classes( array $global_classes ): void {
		self::$pending_global_classes = array_merge( self::$pending_global_classes, $global_classes );
	}

	/**
	 * Register hooks with atomic widgets system
	 */
	public function register_hooks(): void {
		if ( self::$hooks_registered ) {
			return;
		}

		// Extract global classes from widget data before atomic system processes styles
		add_action(
			'elementor/post/render',
			[ $this, 'extract_global_classes_from_post' ],
			5 // Priority 5: Before atomic system processes post
		);

		add_action(
			'elementor/atomic-widgets/styles/register',
			[ $this, 'register_styles' ],
			25, // Priority 25: After global classes (20), before local styles (30)
			2
		);

		add_action(
			'elementor/core/files/clear_cache',
			[ $this, 'invalidate_cache' ]
		);

		self::$hooks_registered = true;
	}

	/**
	 * Extract global classes from post widget data
	 */
	public function extract_global_classes_from_post( int $post_id ): void {

		$document = \Elementor\Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			return;
		}

		$elements_data = $document->get_elements_data();
		$global_classes = $this->traverse_elements_for_global_classes( $elements_data );

		if ( ! empty( $global_classes ) ) {
			self::add_global_classes( $global_classes );
		} else {
		}
	}

	/**
	 * Traverse elements to extract global classes from CSS Converter widgets
	 */
	private function traverse_elements_for_global_classes( array $elements_data ): array {
		$global_classes = [];

		foreach ( $elements_data as $element_data ) {
			// Check if this element has CSS Converter global classes
			if ( ! empty( $element_data['css_converter_global_classes'] ) ) {
				$global_classes = array_merge( $global_classes, $element_data['css_converter_global_classes'] );
			}

			// Recursively check child elements
			if ( ! empty( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
				$child_classes = $this->traverse_elements_for_global_classes( $element_data['elements'] );
				$global_classes = array_merge( $global_classes, $child_classes );
			}
		}

		return $global_classes;
	}

	/**
	 * Register CSS Converter styles with atomic widgets system
	 */
	public function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ): void {
		if ( empty( self::$pending_global_classes ) ) {
			return;
		}

		$get_styles = function() {
			return $this->convert_to_atomic_format( self::$pending_global_classes );
		};

		$styles_manager->register(
			self::STYLES_KEY,
			$get_styles,
			[ 'css-converter', 'global-classes' ]
		);
	}

	/**
	 * Convert CSS Converter global classes to atomic widgets format
	 */
	private function convert_to_atomic_format( array $global_classes ): array {
		$atomic_styles = [];
		$mapper_registry = Class_Property_Mapper_Registry::get_instance();

		foreach ( $global_classes as $class_name => $class_data ) {
			$properties = $class_data['properties'] ?? [];
			if ( empty( $properties ) ) {
				continue;
			}

			// Convert CSS properties to atomic props
			$atomic_props = [];
			foreach ( $properties as $property => $value ) {
				$mapper = $mapper_registry->get_mapper( $property );
				if ( $mapper ) {
					$atomic_prop = $mapper->map_to_v4_atomic( $property, $value );
					if ( $atomic_prop ) {
						$atomic_props[ $property ] = $atomic_prop;
					}
				} else {
				}
			}

			if ( ! empty( $atomic_props ) ) {
				$atomic_styles[] = [
					'id' => $class_name,
					'label' => $class_name,
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => $atomic_props,
							'custom_css' => null,
						],
					],
				];
			}
		}

		return $atomic_styles;
	}

	/**
	 * Invalidate cache when needed
	 */
	public function invalidate_cache(): void {
		$cache_validity = new Cache_Validity();
		$cache_validity->invalidate( [ 'css-converter', 'global-classes' ] );
	}

	/**
	 * Clear pending global classes (for testing)
	 */
	public static function clear_pending_classes(): void {
		self::$pending_global_classes = [];
	}

	/**
	 * Get pending global classes count (for debugging)
	 */
	public static function get_pending_count(): int {
		return count( self::$pending_global_classes );
	}
}
