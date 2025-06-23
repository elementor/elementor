<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;

class Atomic_Global_Styles {
	const CSS_FILE_KEY = 'global';

	public function register_hooks() {
		add_action(
			'elementor/atomic-widgets/styles/register',
			fn( Atomic_Styles_Manager $styles_manager ) => $this->register_styles( $styles_manager ),
			20,
			1
		);

		add_filter('elementor/atomic-widgets/settings/transformers/classes',
			fn( $value ) => $this->transform_classes_names( $value )
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager ) {
		$get_styles = function () {
			$context = is_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;

			return Global_Classes_Repository::make()->context( $context )->all()->get_items()->map( function( $item ) {
				$item['id'] = $item['label'];
				return $item;
			})->all();
		};

		$styles_manager->register(
			self::CSS_FILE_KEY,
			$get_styles
		);
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
