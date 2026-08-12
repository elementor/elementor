<?php

namespace Elementor\Modules\Mcp\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Sync_State {

	const EDITOR_UNSAVED_TTL = 300;
	const MCP_MUTATION_TTL   = 3600;

	public function register_hooks(): void {
		add_filter( 'elementor/mcp/pre_execute_guard', [ $this, 'check_mutation_guard' ], 10, 2 );
		add_action( 'elementor/heartbeat/unsaved_signal', [ $this, 'handle_unsaved_signal' ], 10, 2 );
		add_filter( 'elementor/heartbeat/mutation_marker', [ $this, 'build_mutation_marker' ], 10, 2 );
		add_action( 'elementor/document/after_save', [ $this, 'on_document_saved' ] );
	}

	public function handle_unsaved_signal( int $post_id, $signal_value ): void {
		if ( $signal_value ) {
			self::set_editor_unsaved( (int) $signal_value );
		} else {
			self::clear_editor_unsaved( $post_id );
		}
	}

	public function build_mutation_marker( $default, int $post_id ): ?array {
		$mutated_at = self::get_mcp_mutation_time( $post_id );
		if ( ! $mutated_at ) {
			return null;
		}
		return [
			'post_id'    => $post_id,
			'mutated_at' => $mutated_at,
		];
	}

	public function check_mutation_guard( $error, $input ): ?\WP_Error {
		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		if ( $post_id <= 0 ) {
			return null;
		}

		$has_lock    = ! empty( get_post_meta( $post_id, '_edit_lock', true ) );
		$has_unsaved = self::has_editor_unsaved( $post_id );

		if ( ! $has_lock || ! $has_unsaved ) {
			return null;
		}

		return new \WP_Error(
			'elementor_editor_unsaved_changes',
			__( 'The editor has unsaved changes for this document. Ask the user to save or discard their changes in the Elementor editor before retrying this operation.', 'elementor' ),
			[
				'status'  => 409,
				'post_id' => $post_id,
			]
		);
	}

	public function on_document_saved( $document ): void {
		$post_id = (int) $document->get_post()->ID;
		self::clear_editor_unsaved( $post_id );
		self::delete_mcp_mutation( $post_id );
	}

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
		if ( get_current_user_id() === $owner ) {
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
