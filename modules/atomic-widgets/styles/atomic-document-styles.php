<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers per-post document instance styles with Atomic_Styles_Manager.
 *
 * Mirrors Atomic_Widget_Styles but for document root container CSS class definitions
 * (stored under Has_Atomic_Document::ATOMIC_STYLES_META_KEY).
 *
 * Type-level base styles (from define_base_styles()) are handled separately by
 * Atomic_Document_Base_Styles. This class handles only user-authored instance styles
 * applied via the v4 Style panel.
 */
class Atomic_Document_Styles {

	const STYLES_KEY       = 'document-local';
	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW  = 'preview';

	public function register_hooks(): void {
		add_action(
			'elementor/atomic-widgets/styles/register',
			function ( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
				$this->register_styles( $styles_manager, $post_ids );
			},
			25,
			2
		);

		// Invalidate per-post cache after save so the CSS file is regenerated.
		add_action(
			'elementor/document/after_save',
			function ( Document $document ) {
				if ( ! method_exists( $document, 'load_atomic_styles' ) ) {
					return;
				}
				$context = Utils::is_post_published( $document )
					? self::CONTEXT_FRONTEND
					: self::CONTEXT_PREVIEW;
				do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $document->get_main_post()->ID, $context ] );
			},
			20
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_cache()
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ): void {
		$context = $this->get_context( Plugin::$instance->preview->is_editor_or_preview() );

		foreach ( $post_ids as $post_id ) {
			$document = Plugin::$instance->documents->get( $post_id );

			if ( ! $document || ! method_exists( $document, 'load_atomic_styles' ) ) {
				continue;
			}

			$styles_manager->register(
				[ self::STYLES_KEY, $post_id, $context ],
				fn() => array_values( $document->load_atomic_styles() )
			);
		}
	}

	private function invalidate_cache(): void {
		do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );
	}

	private function get_context( bool $is_preview ): string {
		return $is_preview ? self::CONTEXT_PREVIEW : self::CONTEXT_FRONTEND;
	}
}
