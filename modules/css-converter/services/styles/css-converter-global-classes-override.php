<?php

namespace Elementor\Modules\CssConverter\Services\Styles;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Atomic_Global_Styles;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_Converter_Global_Classes_Override {
	
	private static ?self $instance = null;
	private static bool $hooks_registered = false;

	public static function make(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function register_hooks(): void {
		if ( self::$hooks_registered ) {
			return;
		}

		// Override the atomic global styles to use our custom sorting
		add_filter(
			'elementor/atomic-widgets/styles/register',
			[ $this, 'override_atomic_global_styles' ],
			19, // Priority 19: Just before the original global styles (20)
			2
		);

		self::$hooks_registered = true;
	}

	public function override_atomic_global_styles( $styles_manager, $post_ids ): void {
		// Remove the original global styles registration
		remove_action( 'elementor/atomic-widgets/styles/register', [ $this->get_atomic_global_styles_instance(), 'register_styles' ], 20 );
		
		// Register our custom global styles with specificity sorting
		$this->register_custom_global_styles( $styles_manager );
	}

	private function get_atomic_global_styles_instance() {
		// Get the original Atomic_Global_Styles instance
		static $instance = null;
		if ( null === $instance ) {
			$instance = new Atomic_Global_Styles();
		}
		return $instance;
	}

	private function register_custom_global_styles( $styles_manager ): void {
		$context = is_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;

		$get_styles = function () use ( $context ) {
			$global_classes = Global_Classes_Repository::make()->context( $context )->all();
			$sorted_items = $this->apply_custom_sorting( $global_classes );
			
			return $sorted_items->map( function( $item ) {
				$item['id'] = $item['label'];
				return $item;
			})->all();
		};

		$styles_manager->register(
			[ 'global', $context ],
			$get_styles
		);
	}

	private function apply_custom_sorting( $global_classes ) {
		$items = $global_classes->get_items();
		$order = $global_classes->get_order();

		// If user has set manual order, respect it (existing behavior)
		if ( ! $order->is_empty() ) {
			return $this->sort_by_user_order( $items, $order );
		}

		// No user order - sort by CSS Converter specificity if available
		return $this->sort_by_css_converter_specificity( $items );
	}

	private function sort_by_user_order( $items, $order ) {
		// Use existing order logic (same as original get_items_sorted_by_order)
		$sorted_items_array = [];

		foreach ( $order->all() as $item_id ) {
			$item = $items->get( $item_id );
			if ( null !== $item ) {
				$sorted_items_array[ $item_id ] = $item;
			}
		}

		$remaining_items = $items->except( $order->all() );
		$sorted_items = Collection::make( $sorted_items_array )->merge( $remaining_items );

		return $sorted_items;
	}

	private function sort_by_css_converter_specificity( $items ) {
		$items_array = $items->all();
		
		// Separate CSS Converter classes from regular classes
		$css_converter_classes = [];
		$regular_classes = [];
		
		foreach ( $items_array as $item_id => $item ) {
			if ( isset( $item['css_converter_specificity'] ) ) {
				$css_converter_classes[ $item_id ] = $item;
			} else {
				$regular_classes[ $item_id ] = $item;
			}
		}
		
		// Sort CSS Converter classes by specificity (lowest to highest)
		uasort( $css_converter_classes, function( $a, $b ) {
			$spec_a = $a['css_converter_specificity'] ?? 0;
			$spec_b = $b['css_converter_specificity'] ?? 0;
			return $spec_a <=> $spec_b;
		});
		
		// Merge: CSS Converter classes first (sorted by specificity), then regular classes
		$sorted_items = array_merge( $css_converter_classes, $regular_classes );
		
		return Collection::make( $sorted_items );
	}
}
