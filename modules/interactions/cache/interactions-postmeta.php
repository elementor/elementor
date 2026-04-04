<?php

namespace Elementor\Modules\Interactions\Cache;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Postmeta {
	const META_KEY = 'elementor-interactions-cache';

	public function process_content( Document $document, $data ) {
		if ( $this->skip_processing( $data ) ) {
			return;
		}

		$elements_interactions = $this->extract_elements_interactions( $data );

		if ( empty( $elements_interactions ) ) {
			delete_post_meta( $document->get_main_id(), self::META_KEY );
		} else {
			update_post_meta( $document->get_main_id(), self::META_KEY, $elements_interactions );
		}

		$elements = isset( $data['elements'] ) && is_array( $data['elements'] ) ? $data['elements'] : [];
		\Elementor\Modules\Interactions\Interactions_Cache::sync( $document->get_main_id(), $elements );
	}

	private function skip_processing( array $data ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return true;
		}

		if ( isset( $data['settings']['post_status'] ) && Document::STATUS_AUTOSAVE === $data['settings']['post_status'] ) {
			return true;
		}

		return false;
	}

	private function extract_elements_interactions( array $data ) {
		$parser = new Elements_Interactions();
		$parser->parse_from( $data );
		return $parser->all();
	}
}
