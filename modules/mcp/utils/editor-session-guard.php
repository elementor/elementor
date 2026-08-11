<?php

namespace Elementor\Modules\Mcp\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Session_Guard {

	const EDITOR_UNSAVED_TTL = 300;
	const MCP_MUTATION_TTL   = 3600;

	private static function unsaved_key( int $post_id ): string {
		return "_elementor_editor_unsaved_{$post_id}";
	}

	private static function mutation_key( int $post_id ): string {
		return "_elementor_mcp_mutation_{$post_id}";
	}

	public static function set_editor_unsaved( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		set_transient( self::unsaved_key( $post_id ), get_current_user_id(), self::EDITOR_UNSAVED_TTL );
	}

	public static function clear_editor_unsaved( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		$owner = (int) get_transient( self::unsaved_key( $post_id ) );
		if ( $owner === get_current_user_id() ) {
			delete_transient( self::unsaved_key( $post_id ) );
		}
	}

	public static function has_editor_unsaved( int $post_id ): bool {
		if ( $post_id <= 0 ) {
			return false;
		}
		return (bool) get_transient( self::unsaved_key( $post_id ) );
	}

	public static function set_mcp_mutation( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		set_transient( self::mutation_key( $post_id ), time(), self::MCP_MUTATION_TTL );
	}

	public static function get_mcp_mutation_time( int $post_id ): int {
		if ( $post_id <= 0 ) {
			return 0;
		}
		return (int) get_transient( self::mutation_key( $post_id ) );
	}

	public static function delete_mcp_mutation( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		delete_transient( self::mutation_key( $post_id ) );
	}
}
