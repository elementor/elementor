<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Modules\Global_Classes\Usage\Applied_Global_Classes_Usage;
use Elementor\Plugin;

class Global_Classes_CSS {
	public function register_hooks() {
		add_action(
			'elementor/atomic-widget/styles/enqueue',
			fn( Styles_Manager $styles_manager ) => $this->enqueue_styles( $styles_manager ),
			20,
			3
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

	private function enqueue_styles( Styles_Manager $styles_manager ) {
		$global_classes_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();

		if ( empty( $global_classes_ids ) ) {
			return;
		}

		$post_ids = apply_filters( 'elementor/atomic-widgets/styles/posts-to-enqueue', [] );

		$global_classes = [];
		foreach ( $post_ids as $post_id ) {
			$elements_data = Plugin::instance()->documents->get( $post_id )->get_elements_data();
			$used_global_classes_ids = array_keys( ( new Applied_Global_Classes_Usage )->get_classes_count_per_class( $elements_data, $global_classes_ids ) );
			$global_classes = array_merge($global_classes, Global_Classes_Repository::make()->get_by_ids( $used_global_classes_ids )->get_items()->all() );
		}

		$styles_manager->register(
			'global',
			$global_classes
		);
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
