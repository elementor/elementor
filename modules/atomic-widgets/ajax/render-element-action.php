<?php

namespace Elementor\Modules\AtomicWidgets\Ajax;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Render_Element_Action {
	const ACTION = 'render_atomic_element';

	public function register( Ajax $ajax ): void {
		$ajax->register_ajax_action( self::ACTION, fn ( $request ) => $this->handle( $request ) );
	}

	public function handle( $request ): array {
		$post_id = isset( $request['editor_post_id'] ) ? (int) $request['editor_post_id'] : 0;
		$element_data = $request['data'] ?? null;

		if ( ! $post_id || ! is_array( $element_data ) ) {
			throw new \Exception( 'Invalid request payload.' );
		}

		$document = Plugin::$instance->documents->get_with_permissions( $post_id );

		$editor = Plugin::$instance->editor;
		$is_edit_mode = $editor->is_edit_mode();
		$editor->set_edit_mode( true );

		Plugin::$instance->db->switch_to_query( [
			'p' => $post_id,
			'post_type' => 'any',
		], true );

		Plugin::$instance->documents->switch_to_document( $document );

		try {
			$render_html = $this->render_element( $element_data );
		} finally {
			$editor->set_edit_mode( $is_edit_mode );
			Plugin::$instance->db->restore_current_query();
		}

		return [
			'render' => $render_html,
		];
	}

	private function render_element( array $element_data ): string {
		$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

		if ( ! $element ) {
			throw new \Exception( 'Element could not be instantiated.' );
		}

		ob_start();
		$element->print_element();
		return (string) ob_get_clean();
	}
}
