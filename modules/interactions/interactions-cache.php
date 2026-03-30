<?php

namespace Elementor\Modules\Interactions;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Cache {
	const META_KEY = 'elementor-interactions-cache';

	public static function sync( $post_id, array $elements ) {
		$post_id = absint( $post_id );

		if ( ! $post_id ) {
			return;
		}

		$rows = Interactions_Data_Builder::build_script_rows( $elements );

		if ( empty( $rows ) ) {
			delete_post_meta( $post_id, self::META_KEY );
			return;
		}

		update_post_meta( $post_id, self::META_KEY, $rows );
	}

	public static function get_valid_rows( $post_id ) {
		$post_id = absint( $post_id );

		if ( ! $post_id ) {
			return null;
		}

		$raw = get_post_meta( $post_id, self::META_KEY, true );

		if ( ! is_array( $raw ) || empty( $raw ) ) {
			return null;
		}

		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) || empty( $row['elementId'] ) || ! isset( $row['interactions'] ) || ! is_array( $row['interactions'] ) ) {
				return null;
			}
		}

		return $raw;
	}

	public static function should_skip_sync_for_save_data( array $data ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return true;
		}

		if ( isset( $data['settings']['post_status'] ) && Document::STATUS_AUTOSAVE === $data['settings']['post_status'] ) {
			return true;
		}

		return false;
	}
}
