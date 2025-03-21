<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Plugin;

class Global_Classes_CSS {
	public function register_hooks() {
		add_action(
			'elementor/frontend/after_enqueue_styles',
			fn() => $this->enqueue_styles()
		);

		add_action(
			'elementor/global_classes/update',
			fn( $context ) => $this->clear_css_cache( $context )
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->clear_css_cache()
		);

		add_action(
			'deleted_post',
			fn( $post_id ) => $this->on_post_delete( $post_id )
		);

		add_action(
			'elementor/core/files/after_generate_css',
			fn() => $this->generate_styles()
		);
	}

	private function enqueue_styles() {
		$css_file = is_preview()
			? new Global_Classes_CSS_Preview()
			: new Global_Classes_CSS_File();

		$css_file->enqueue();
	}

	private function generate_styles() {
		( new Global_Classes_CSS_File() )->update();
	}

	private function on_post_delete( $post_id ) {
		$post_id = (int) $post_id;
		$active_kit_id = (int) Plugin::$instance->kits_manager->get_active_id();

		if ( $post_id !== $active_kit_id ) {
			return;
		}

		$this->clear_css_cache();
	}

	private function clear_css_cache( string $context = Global_Classes_Repository::CONTEXT_FRONTEND ): void {
		( new Global_Classes_CSS_Preview() )->delete();

		if ( Global_Classes_Repository::CONTEXT_FRONTEND === $context ) {
			( new Global_Classes_CSS_File() )->delete();
		}
	}
}
