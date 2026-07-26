<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Preview_Styles {

	private const DEFAULT_BREAKPOINT = 'desktop';

	private array $fonts = [];

	public function collect( Document $document ): string {
		$this->fonts = [];

		$post_id = $document->get_main_id();
		$css_chunks = [
			$this->get_static_css(),
			$this->render_style_set( $this->get_base_styles() ),
			$this->render_style_set( $this->get_local_styles( $document ) ),
			$this->render_style_set( $this->get_global_styles( $post_id ) ),
			$this->get_design_system_css(),
		];

		return implode( '', array_filter( $css_chunks ) );
	}

	public function get_collected_fonts(): array {
		return array_values( array_unique( $this->fonts ) );
	}

	private function get_static_css(): string {
		return '.e-heading-base a, .e-paragraph-base a { all: unset; cursor: pointer; }'
			. 'form[data-element_type="e-form"].form-state-success [data-element_type="e-form-success-message"],'
			. 'form[data-element_type="e-form"].form-state-error [data-element_type="e-form-error-message"]'
			. '{ display: block; }';
	}

	private function get_base_styles(): array {
		$elements = Plugin::$instance->elements_manager->get_element_types();
		$widgets = Plugin::$instance->widgets_manager->get_widget_types();

		return Collection::make( $elements )
			->merge( $widgets )
			->filter( fn( $element ) => Atomic_Utils::is_atomic( $element ) )
			->map( fn( $element ) => $element->get_base_styles() )
			->flatten()
			->all();
	}

	private function get_local_styles( Document $document ): array {
		$post_styles = [];
		$elements = $document->get_elements_data();

		if ( empty( $elements ) ) {
			return [];
		}

		Plugin::$instance->db->iterate_data(
			$elements,
			function ( array $element_data ) use ( &$post_styles ) {
				$post_styles = array_merge( $post_styles, $this->parse_element_styles( $element_data ) );
			}
		);

		return Atomic_Widget_Styles::get_license_based_filtered_styles( $post_styles );
	}

	private function parse_element_styles( array $element_data ): array {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Atomic_Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		return $element_data['styles'] ?? [];
	}

	private function get_global_styles( int $post_id ): array {
		$aggregate_ids = $this->get_aggregate_post_ids( $post_id );

		$class_ids = [];
		$relations = ( new Global_Classes_Relations() )->set_preview( true );

		foreach ( $aggregate_ids as $aggregate_id ) {
			$class_ids = array_merge( $class_ids, $relations->get_styles_by_post( $aggregate_id ) );
		}

		$class_ids = array_values( array_unique( $class_ids ) );

		if ( empty( $class_ids ) ) {
			return [];
		}

		$repository = Global_Classes_Repository::make()->set_preview( true );
		$global_order = $repository->all_labels();
		$ordered_class_ids = array_values( array_intersect( array_keys( $global_order ), $class_ids ) );

		if ( empty( $ordered_class_ids ) ) {
			return [];
		}

		$items = $repository->get_by_ids( $ordered_class_ids );
		$styles = [];

		foreach ( array_reverse( $ordered_class_ids ) as $class_id ) {
			$item = $items[ $class_id ] ?? null;

			if ( ! $item ) {
				continue;
			}

			$resolved_label = $global_order[ $class_id ] ?? $item['label'];
			$item['id'] = $resolved_label;
			$item['label'] = $resolved_label;
			$styles[] = $item;
		}

		return $styles;
	}

	private function get_aggregate_post_ids( int $post_id ): array {
		$parent_to_embedded = [];
		$visited = [];

		$this->resolve_embedded_post_descendants( $post_id, $parent_to_embedded, $visited );

		$embedded_ids = $parent_to_embedded[ $post_id ] ?? [];

		return array_values( array_unique( array_merge( [ $post_id ], $embedded_ids ) ) );
	}

	private function resolve_embedded_post_descendants( int $post_id, array &$parent_to_embedded, array &$visited ): array {
		if ( isset( $visited[ $post_id ] ) ) {
			return $parent_to_embedded[ $post_id ] ?? [];
		}

		$visited[ $post_id ] = true;

		$related = (array) apply_filters( 'elementor/document/related_posts', [], $post_id );
		$related = array_values( array_unique( array_map( 'intval', array_filter( $related, 'is_numeric' ) ) ) );

		$all_related = $related;

		foreach ( $related as $related_post ) {
			$further_related = $this->resolve_embedded_post_descendants( $related_post, $parent_to_embedded, $visited );
			$all_related = array_values( array_unique( array_merge( $all_related, $further_related ) ) );
		}

		$parent_to_embedded[ $post_id ] = $all_related;

		return $all_related;
	}

	private function get_design_system_css(): string {
		if ( ! class_exists( '\Elementor\Modules\DesignSystemSync\Classes\Stylesheet_Manager' ) ) {
			return '';
		}

		$manager = new \Elementor\Modules\DesignSystemSync\Classes\Stylesheet_Manager();
		$method = new \ReflectionMethod( $manager, 'parse_content' );
		$method->setAccessible( true );

		return (string) $method->invoke( $manager );
	}

	private function render_style_set( array $styles ): string {
		if ( empty( $styles ) ) {
			return '';
		}

		$grouped_styles = $this->group_by_breakpoint( $styles );
		$css = '';

		foreach ( $this->get_breakpoints() as $breakpoint_key ) {
			$breakpoint_styles = array_values( $grouped_styles[ $breakpoint_key ] ?? [] );

			if ( empty( $breakpoint_styles ) ) {
				continue;
			}

			$css .= Styles_Renderer::make(
				Plugin::$instance->breakpoints->get_breakpoints_config()
			)->on_font_enqueue( function ( string $font ) {
				$this->fonts[] = $font;
			} )->render( $breakpoint_styles );
		}

		return $css;
	}

	private function group_by_breakpoint( array $styles ): array {
		return Collection::make( $styles )->reduce(
			function ( array $group, array $style ) {
				Collection::make( $style['variants'] ?? [] )->each(
					function ( array $variant ) use ( &$group, $style ) {
						$breakpoint = $variant['meta']['breakpoint'] ?? self::DEFAULT_BREAKPOINT;

						if ( ! isset( $group[ $breakpoint ][ $style['id'] ] ) ) {
							$group[ $breakpoint ][ $style['id'] ] = [
								'id' => $style['id'],
								'type' => $style['type'],
								'variants' => [],
							];
						}

						$group[ $breakpoint ][ $style['id'] ]['variants'][] = $variant;
					}
				);

				return $group;
			},
			[]
		);
	}

	private function get_breakpoints(): array {
		return Collection::make( Plugin::$instance->breakpoints->get_breakpoints() )
			->map( fn( Breakpoint $breakpoint ) => $breakpoint->get_name() )
			->reverse()
			->prepend( self::DEFAULT_BREAKPOINT )
			->all();
	}
}
