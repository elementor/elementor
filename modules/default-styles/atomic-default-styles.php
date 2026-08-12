<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;

class Atomic_Default_Styles {
	const STYLES_KEY = 'default';

	public function register_hooks() {
		add_action(
			'elementor/atomic-widgets/styles/register',
			fn( Atomic_Styles_Manager $styles_manager ) => $this->register_styles( $styles_manager ),
			15,
			1
		);

		add_action(
			'elementor/default_styles/update',
			fn() => $this->invalidate_cache(),
			10,
			0
		);

		add_action(
			'elementor/default_styles/publish',
			fn() => $this->invalidate_cache(),
			10,
			0
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_all_cache(),
		);

		add_action(
			'deleted_post',
			fn( $post_id ) => $this->on_kit_delete( $post_id ),
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager ) {
		$styles_manager->register(
			[ self::STYLES_KEY ],
			fn () => $this->get_all_default_styles(),
		);
	}

	private function get_all_default_styles(): array {
		$repository = Default_Styles_Repository::make();
		$items = $repository->all();

		return array_values( $items );
	}

	private function invalidate_cache(): void {
		do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );
	}

	private function invalidate_all_cache(): void {
		do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );
	}

	private function on_kit_delete( $post_id ): void {
		if ( ! \Elementor\Plugin::$instance->kits_manager->is_kit( $post_id ) ) {
			return;
		}

		$this->invalidate_all_cache();
	}
}
