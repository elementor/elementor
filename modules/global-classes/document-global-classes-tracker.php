<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Document_Global_Classes_Tracker {
	const META_KEY = '_elementor_used_global_class';

	public function register_hooks() {
		add_action(
			'elementor/document/after_save',
			fn( Document $document ) => $this->on_document_save( $document )
		);
	}

	public function get_document_class_ids( int $post_id ): array {
		$meta_values = get_post_meta( $post_id, self::META_KEY, false );

		if ( ! is_array( $meta_values ) ) {
			return [];
		}

		return array_values( array_unique( $meta_values ) );
	}

	public function get_documents_using_class( string $class_id ): array {
		global $wpdb;

		$results = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
				self::META_KEY,
				$class_id
			)
		);

		return array_map( 'intval', $results );
	}

	public function set_document_class_ids( int $post_id, array $class_ids ): void {
		delete_post_meta( $post_id, self::META_KEY );

		$unique_ids = array_unique( $class_ids );

		foreach ( $unique_ids as $class_id ) {
			add_post_meta( $post_id, self::META_KEY, $class_id );
		}
	}

	private function on_document_save( Document $document ): void {
		$post_id = $document->get_main_id();
		$used_class_ids = $this->extract_used_class_ids( $document );

		$this->set_document_class_ids( $post_id, $used_class_ids );
	}

	private function extract_used_class_ids( Document $document ): array {
		$elements_data = $document->get_elements_raw_data() ?? [];

		if ( empty( $elements_data ) ) {
			return [];
		}

		$used_class_ids = [];

		Plugin::$instance->db->iterate_data(
			$elements_data,
			function ( $element_data ) use ( &$used_class_ids ) {
				$class_values = $element_data['settings']['classes']['value'] ?? [];

				if ( empty( $class_values ) || ! is_array( $class_values ) ) {
					return;
				}

				foreach ( $class_values as $class_id ) {
					$used_class_ids[] = $class_id;
				}
			}
		);

		return array_unique( $used_class_ids );
	}
}
