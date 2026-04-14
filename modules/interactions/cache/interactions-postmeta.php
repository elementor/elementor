<?php

namespace Elementor\Modules\Interactions\Cache;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Postmeta {
	const META_KEY = 'elementor-interactions-cache';

	public function load_content( $post_id ) {
		return get_post_meta( $post_id, self::META_KEY, true );
	}

	public function process_content( $post_id, $data ) {
		if ( $this->skip_processing( $data ) ) {
			return;
		}

		$elements_interactions = $this->extract_elements_interactions( $data );

		$this->save_postmeta( $post_id, $elements_interactions );

		return $elements_interactions;
	}

	private function save_postmeta( $post_id, array $interactions ) {
		if ( empty( $interactions ) ) {
			delete_post_meta( $post_id, self::META_KEY );
			return;
		}

		update_post_meta( $post_id, self::META_KEY, $interactions );
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
