<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Plugin;

class Global_Classes_CSS {
	CONST CSS_FILE_KEY = 'global';

	public function register_hooks() {
		add_action(
			'elementor/atomic-widget/styles/register',
			fn(Atomic_Styles_Manager $styles_manager ) => $this->register_styles( $styles_manager ),
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

	private function register_styles(Atomic_Styles_Manager $styles_manager ) {
		$get_styles = function ( $post_ids ) {
			if ( empty( $post_ids ) ) {
				return [];
			}

			$context = is_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;

			return  Global_Classes_Repository::make()->context( $context )->all()->get_items()->map( function( $item ) {
				$item['id'] = $item['label'];
				return $item;
			})->all();
		};

		$styles_manager->register(
			self::CSS_FILE_KEY,
			$get_styles
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
