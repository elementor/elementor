<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils {
	public static function is_atomic( $element_instance ): bool {
		return $element_instance instanceof Atomic_Element_Base ||
			$element_instance instanceof Atomic_Widget_Base;
	}

	public static function generate_id( string $prefix = '', $existing_ids = [] ): string {
		do {
			$generated = substr(
				bin2hex( random_bytes( 4 ) ),
				0,
				7
			);

			$id = "$prefix{$generated}";
		} while ( in_array( $id, $existing_ids, true ) );

		return $id;
	}

	public static function is_post_published( Document $document ): bool {
		return $document->get_post()->post_status === Document::STATUS_PUBLISH;
	}

	public static function traverse_post_elements( string $post_id, callable $callback ): void {
		$documents = Plugin::$instance->documents;
		$document = is_preview() ? $documents->get_doc_or_auto_save( $post_id, get_current_user_id() ) : $documents->get( $post_id );

		if ( ! $document ) {
			return;
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return;
		}

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( $callback ) {
			call_user_func( $callback, $element_data );
		} );
	}
}
