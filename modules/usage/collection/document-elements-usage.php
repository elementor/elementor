<?php
namespace Elementor\Modules\Usage\Collection;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Usage;
use Elementor\Modules\Usage\Module;

class DocumentElementsUsage extends BaseUsage {

	/**
	 * @throws \Exception
	 */
	public function add( Document $document ) {
		$current_usage = $document->get_elements_usage();

		if ( empty( $current_usage ) ) {
			return $this;
		}

		$document_name = $document->get_name();

		$document->update_meta( Module::ELEMENTS_META_KEY, $current_usage );

		$global_usage = &$this->items;

		foreach ( $current_usage as $element_type => $element_usage_data ) {
			if ( ! isset( $global_usage[ $document_name ] ) ) {
				$global_usage[ $document_name ] = [];
			}

			if ( ! isset( $global_usage[ $document_name ][ $element_type ] ) ) {
				$global_usage[ $document_name ][ $element_type ] = [
					'count' => 0,
					'controls' => [],
				];
			}

			$global_usage_ref = &$global_usage[ $document_name ][ $element_type ];
			$global_usage_ref['count'] += $element_usage_data['count'];

			if ( empty( $element_usage_data['controls'] ) ) {
				continue;
			}

			foreach ( $element_usage_data['controls'] as $tab => $sections ) {
				foreach ( $sections as $section => $controls ) {
					foreach ( $controls as $control => $count ) {
						Usage::increase_controls_amount( $global_usage_ref, $tab, $section, $control, $count );
					}
				}
			}
		}

		return new static( $this->all() );
	}

	public function remove( Document $document ) {
		$prev_usage = $document->get_meta( Module::ELEMENTS_META_KEY );

		if ( empty( $prev_usage ) ) {
			return $this;
		}

		$document_name = $document->get_name();

		$global_usage = &$this->items;

		foreach ( $prev_usage as $element_type => $doc_value ) {
			foreach ( $prev_usage[ $element_type ]['controls'] as $tab => $sections ) {
				foreach ( $sections as $section => $controls ) {
					foreach ( $controls as $control => $count ) {
						if ( isset( $global_usage[ $document_name ][ $element_type ]['controls'][ $tab ][ $section ][ $control ] ) ) {
							$section_ref = &$global_usage[ $document_name ][ $element_type ]['controls'][ $tab ][ $section ];

							$section_ref[ $control ] -= $count;

							if ( 0 === $section_ref[ $control ] ) {
								unset( $section_ref[ $control ] );
							}
						}
					}
				}
			}

			if ( isset( $global_usage[ $document_name ][ $element_type ]['count'] ) ) {
				$global_usage[ $document_name ][ $element_type ]['count'] -= $prev_usage[ $element_type ]['count'];

				if ( 0 === $global_usage[ $document_name ][ $element_type ]['count'] ) {
					unset( $global_usage[ $document_name ][ $element_type ] );

					if ( 0 === count( $global_usage[ $document_name ] ) ) {
						unset( $global_usage[ $document_name ] );
					}
				}
			}
		}

		$document->delete_meta( Module::ELEMENTS_META_KEY );

		return new static( $this->all() );
	}
}
