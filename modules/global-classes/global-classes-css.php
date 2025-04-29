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
}
