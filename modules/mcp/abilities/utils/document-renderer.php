<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Frontend\Widget_Content_Render_Mode;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Renderer {

	const DEFAULT_TEXT_LIMIT = 8000;

	private const DRAFT_STATUSES = [ 'draft', 'pending', 'auto-draft', 'future' ];

	public function render( int $post_id, ?string $element_id = null, ?int $text_limit = null ) {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_view',
				__( 'Sorry, you are not allowed to access this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$document = $this->resolve_preview_document( $post_id );

		if ( is_wp_error( $document ) ) {
			return $document;
		}

		if ( ! $document->is_built_with_elementor() ) {
			return new \WP_Error(
				'not_elementor',
				__( 'This post is not built with Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$elements = $document->get_elements_data();
		$elements = is_array( $elements ) ? $elements : [];

		if ( null !== $element_id && '' !== $element_id ) {
			$subtree = Utils::find_element_recursive( $elements, $element_id );

			if ( ! $subtree ) {
				return new \WP_Error(
					'element_not_found',
					__( 'Element not found in this document.', 'elementor' ),
					[ 'status' => \WP_Http::NOT_FOUND ]
				);
			}

			$elements = [ $subtree ];
		}

		$html = Widget_Content_Render_Mode::execute_as(
			Widget_Content_Render_Mode::MARKDOWN,
			fn() => $this->render_elements( $document, $elements, $post_id )
		);

		$styles_collector = new Document_Preview_Styles();
		$css = $styles_collector->collect( $document );
		$html = ( new Document_Preview_Html() )->wrap(
			$post_id,
			$html,
			$css,
			$styles_collector->get_collected_fonts()
		);
		$text = $this->html_to_text( $html, $text_limit ?? self::DEFAULT_TEXT_LIMIT );

		return [
			'post_id' => $post_id,
			'element_id' => $element_id,
			'html' => $html,
			'text' => $text,
		];
	}

	private function resolve_preview_document( int $post_id ) {
		$user_id = get_current_user_id();
		$main = Plugin::$instance->documents->get( $post_id );

		if ( ! $main ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( $main->get_autosave_id( $user_id ) ) {
			$autosave = $main->get_autosave( $user_id );

			if ( $autosave ) {
				return $autosave;
			}
		}

		$status = get_post_status( $post_id );

		if ( in_array( $status, self::DRAFT_STATUSES, true ) ) {
			return $main;
		}

		return new \WP_Error(
			'no_draft_preview',
			__( 'No draft preview is available for this document.', 'elementor' ),
			[ 'status' => \WP_Http::NOT_FOUND ]
		);
	}

	private function render_elements( Document $document, array $elements, int $post_id ): string {
		$editor = Plugin::$instance->editor;
		$is_edit_mode = $editor->is_edit_mode();
		$editor->set_edit_mode( true );

		Plugin::$instance->db->switch_to_query( [
			'p' => $post_id,
			'post_type' => 'any',
		], true );

		Plugin::$instance->documents->switch_to_document( $document );

		do_action( 'elementor/atomic_widgets/before_render', $document );

		$output = '';

		try {
			foreach ( $elements as $element_data ) {
				$instance = Plugin::$instance->elements_manager->create_element_instance( $element_data );

				if ( ! $instance ) {
					continue;
				}

				ob_start();
				$instance->print_element();
				$output .= ob_get_clean() . "\n";
			}
		} finally {
			do_action( 'elementor/atomic_widgets/after_render', $document );
			Plugin::$instance->documents->restore_document();
			$editor->set_edit_mode( $is_edit_mode );
			Plugin::$instance->db->restore_current_query();
		}

		return trim( $output );
	}

	private function html_to_text( string $html, int $limit ): string {
		$text = wp_strip_all_tags( $html );
		$text = preg_replace( '/\s+/u', ' ', $text );
		$text = trim( (string) $text );

		if ( strlen( $text ) > $limit ) {
			$text = substr( $text, 0, $limit );
		}

		return $text;
	}
}
