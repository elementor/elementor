<?php
namespace Elementor\Modules\Usage\Collection;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\Usage\Module;
use Elementor\Plugin;

class DocumentSettingsUsage extends Collection {
	/**
	 * Add, adds the document to collection.
	 *
	 * @param Document $document
	 *
	 * @return $this
	 */
	public function add( $document ) {
		$current_usage = $document->get_usage();
		$document_name = $document->get_name();

		$document->update_meta( Module::DOCUMENT_META_KEY, $current_usage );

		$global_usage = &$this->items;

		foreach ( $current_usage as $control_name => $control_count ) {
			$global_document_usage_ref = &$global_usage[ $document_name ];

			if ( ! is_array( $global_document_usage_ref ) ) {
				$global_document_usage_ref = [];
			}

			if ( empty( $global_document_usage_ref[ $control_name ] ) ) {
				$global_document_usage_ref[ $control_name ] = 0;
			}

			$global_document_usage_ref[ $control_name ] += $control_count;
		}

		return new static( $this->all() );
	}

	/**
	 * Remove, remove's the document from the collection.
	 *
	 * @param Document $document
	 *
	 * @return $this
	 */
	public function remove( $document ) {
		$current_usage = $document->get_meta( Module::DOCUMENT_META_KEY );

		if ( ! empty( $current_usage ) ) {
			$document_name = $document->get_name();

			foreach ( $current_usage as $control_name => $control_count ) {
				if ( ! empty( $this->items[ $document_name ][ $control_name ] ) ) {
					$this->items[ $document_name ][ $control_name ] -= $control_count;
				}
			}

			$this->clear_empty_recursive();
		}

		return new static( $this->all() );
	}
}
