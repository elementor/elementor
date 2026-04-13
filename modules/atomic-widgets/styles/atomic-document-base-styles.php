<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers type-level base styles from all atomic document types with Atomic_Styles_Manager.
 *
 * Mirrors Atomic_Widget_Base_Styles but for documents. Each atomic document class
 * (identified by the static is_atomic_document() marker from Has_Atomic_Document)
 * contributes its define_base_styles() output.
 *
 * These are type-level styles — the same CSS for every instance of a given document
 * type (e.g. all Header V4 documents share the same root style). They are NOT
 * instance-scoped; per-instance element styles are handled by Atomic_Widget_Styles.
 */
class Atomic_Document_Base_Styles {

	const STYLES_KEY = 'document-base';

	public function register_hooks(): void {
		add_action(
			'elementor/atomic-widgets/styles/register',
			fn( Atomic_Styles_Manager $styles_manager ) => $this->register_styles( $styles_manager ),
			10,
			1
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_cache()
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager ): void {
		$styles_manager->register(
			[ self::STYLES_KEY ],
			fn() => $this->get_all_base_styles()
		);
	}

	private function invalidate_cache(): void {
		do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );
	}

	/**
	 * Collects base styles from all registered atomic document types.
	 * A document type is considered atomic if it exposes the static is_atomic_document() marker
	 * (provided by the Has_Atomic_Document trait).
	 *
	 * @return array
	 */
	public function get_all_base_styles(): array {
		$document_types = Plugin::$instance->documents->get_document_types();

		return Collection::make( $document_types )
			->filter( fn( $class_name ) => $this->is_atomic_document( $class_name ) )
			->map( function( $class_name ) {
				// Instantiate without post data to access type-level style definitions.
				// Document::__construct( array $data = [] ) is safe with empty args.
				$doc = new $class_name();
				return $doc->get_base_styles();
			} )
			->flatten()
			->all();
	}

	/**
	 * Checks whether a document class is an atomic document by looking for the
	 * static is_atomic_document() marker introduced by Has_Atomic_Document.
	 *
	 * @param string $class_name Fully-qualified class name.
	 * @return bool
	 */
	private function is_atomic_document( string $class_name ): bool {
		return method_exists( $class_name, 'is_atomic_document' )
			&& true === $class_name::is_atomic_document();
	}
}
