<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Custom_Attributes_Trust {
	const LAST_EDITOR_META_KEY = '_elementor_data_last_editor';

	const UNFILTERED_CAPABILITY = 'unfiltered_html';

	public static function register_hooks(): void {
		add_action( 'added_post_meta', [ self::class, 'record_last_editor' ], 10, 3 );
		add_action( 'updated_post_meta', [ self::class, 'record_last_editor' ], 10, 3 );
	}

	public static function record_last_editor( $meta_id, $post_id, $meta_key ): void {
		$user_id = get_current_user_id();

		if ( Document::ELEMENTOR_DATA_META_KEY !== $meta_key || ! $user_id ) {
			return;
		}

		update_metadata( 'post', $post_id, self::LAST_EDITOR_META_KEY, $user_id );
	}

	public static function can_current_user_save_unfiltered(): bool {
		return current_user_can( self::UNFILTERED_CAPABILITY );
	}

	public static function is_post_trusted( int $post_id ): bool {
		if ( ! metadata_exists( 'post', $post_id, self::LAST_EDITOR_META_KEY ) ) {
			return true;
		}

		$last_editor_id = (int) get_metadata( 'post', $post_id, self::LAST_EDITOR_META_KEY, true );

		return $last_editor_id > 0 && user_can( $last_editor_id, self::UNFILTERED_CAPABILITY );
	}

	public static function can_print_unfiltered_in_current_document(): bool {
		if ( self::is_editor_request() ) {
			return false;
		}

		$document = Plugin::$instance->documents->get_current();

		return $document instanceof Document && self::is_post_trusted( (int) $document->get_post()->ID );
	}

	private static function is_editor_request(): bool {
		return Plugin::$instance->editor->is_edit_mode() || Plugin::$instance->preview->is_preview_mode();
	}
}
