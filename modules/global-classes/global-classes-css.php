<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Plugin;

class Global_Classes_CSS {
	private ?array $css_by_breakpoint = null;

	public function register_hooks() {
		add_action(
			'elementor/atomic-widget/styles/enqueue',
			fn( string $breakpoint, Styles_Manager $styles_manager ) => $this->enqueue_styles( $breakpoint, $styles_manager ),
			10,
			2
		);

		add_action(
			'elementor/global_classes/update',
			fn( $context ) => $this->clear_css_cache( $context )
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->clear_css_cache( Global_Classes_Repository::CONTEXT_FRONTEND )
		);

		add_action(
			'deleted_post',
			fn( $post_id ) => $this->on_post_delete( $post_id )
		);

		add_action(
			'elementor/core/files/after_generate_css',
			fn() => $this->generate_styles()
		);

		add_filter('elementor/atomic-widgets/settings/transformers/classes',
			fn( $value ) => $this->transform_classes_names( $value )
		);
	}

	private function enqueue_styles( string $breakpoint, Styles_Manager $styles_manager ) {
		if ( ! $this->css_by_breakpoint ) {
			$this->css_by_breakpoint = $this->render_css();
		}

		$css = $this->css_by_breakpoint[ $breakpoint ] ?? null;

		if ( ! $css ) {
			return;
		}

		$styles_manager->register(
			$breakpoint,
			'elementor-global-classes-' . $breakpoint,
			'global-classes-' . $breakpoint,
			$css
		);
	}

	private function render_css() {
		$global_classes = Global_Classes_Repository::make()->all();

		if ( $global_classes->get_items()->is_empty() ) {
			return null;
		}

		$sorted_items = $global_classes
			->get_order()
			->reverse()
			->map(
				fn( $id ) => $global_classes->get_items()->get( $id )
			);

		$grouped = $this->group_by_breakpoint( $sorted_items->all() );
		$result = [];

		foreach ( $grouped as $breakpoint => $styles ) {
			$css = Styles_Renderer::make(
				Plugin::$instance->breakpoints->get_breakpoints_config()
			)->on_prop_transform( function( $key, $value ) {
				if ( 'font-family' !== $key ) {
					return;
				}

				// TODO: Add the font somewhere.
//				$this->add_font( $value );
			} )->render( $styles );

			$result[ $breakpoint ] = $css;
		}

		return $result;
	}

	private function group_by_breakpoint( $styles ) {
		$groups = [];

		foreach ( $styles as $style ) {
			foreach ( $style['variants'] as $variant ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? 'desktop';

				$groups[ $breakpoint ][] = [
					'id' => $style['id'],
					'type' => $style['type'],
					'variants' => [ $variant ],
				];
			}
		}

		return $groups;
	}

	private function generate_styles() {
		( new Global_Classes_CSS_File() )->update();
	}

	private function on_post_delete( $post_id ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_id ) ) {
			return;
		}

		$this->clear_css_cache(
			Global_Classes_Repository::CONTEXT_FRONTEND,
			$post_id
		);
	}

	private function clear_css_cache( string $context, $kit_id = null ): void {
		( new Global_Classes_CSS_Preview( $kit_id ) )->delete();

		if ( Global_Classes_Repository::CONTEXT_FRONTEND === $context ) {
			( new Global_Classes_CSS_File( $kit_id ) )->delete();
		}
	}

	private function transform_classes_names( $ids ) {
		$context = is_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;

		$classes = Global_Classes_Repository::make()
			->context( $context )
			->all()
			->get_items();

		return array_map(
			function( $id ) use ( $classes ) {
				$class = $classes->get( $id );

				return $class ? $class['label'] : $id;
			},
			$ids
		);
	}
}
