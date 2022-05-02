<?php
namespace Elementor\Modules\Usage\Collection;

use Elementor\Core\Base\Document;
use Elementor\Modules\Usage\Module;

class DocumentSettingsUsage extends BaseUsage {

	public function add( Document $document ) {
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

	public function remove( Document $document ) {
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
