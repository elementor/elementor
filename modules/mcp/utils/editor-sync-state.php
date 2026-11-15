<?php

namespace Elementor\Modules\Mcp\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Sync_State {

	const EDITOR_UNSAVED_TTL = 300;
	const MCP_MUTATION_TTL   = 3600;

	const POST_LOCK_META_KEY       = '_edit_lock';
	const DEFAULT_POST_LOCK_WINDOW = 150;

	private int $save_checked_at = 0;

	public function register_hooks(): void {
		add_filter( 'elementor/mcp/pre_execute_guard', [ $this, 'check_mutation_guard' ], 10, 2 );
		add_action( 'elementor/heartbeat/unsaved_signal', [ $this, 'handle_unsaved_signal' ], 10, 2 );
		add_action( 'elementor/heartbeat/unpersisted_signal', [ $this, 'handle_unpersisted_signal' ], 10, 2 );
		add_filter( 'elementor/heartbeat/mutation_marker', [ $this, 'build_mutation_marker' ], 10, 2 );
		add_action( 'elementor/document/after_save', [ $this, 'on_document_saved' ] );
		add_filter( 'elementor/document/config', [ $this, 'add_server_time_to_config' ] );
		add_filter( 'elementor/documents/ajax_save/conflict', [ $this, 'check_stale_editor_save' ], 10, 3 );
		add_filter( 'elementor/documents/ajax_save/return_data', [ $this, 'add_server_time_to_save_response' ] );
	}

	public function add_server_time_to_config( array $config ): array {
		$config['server_time'] = time();

		return $config;
	}

	public function handle_unsaved_signal( int $post_id, $signal_value ): void {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		if ( $signal_value ) {
			self::set_editor_unsaved( $post_id );
		} else {
			self::clear_editor_unsaved( $post_id );
		}
	}

	public function handle_unpersisted_signal( int $post_id, $signal_value ): void {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		if ( $signal_value ) {
			self::set_editor_unpersisted( $post_id );
		} else {
			self::clear_editor_unpersisted( $post_id );
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

		$other_user_error = $this->check_other_user_unsaved( $post_id );

		if ( $other_user_error ) {
			return $other_user_error;
		}

		if ( ! self::has_own_unpersisted_editor( $post_id ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_own_editor_unsaved_changes',
			__( 'The Elementor editor is open on this page in your session with changes that are not saved yet, and its next save would overwrite this change. Ask the user to press Ctrl+S (or wait for the autosave), then call elementor/get-page-structure and retry.', 'elementor' ),
			[
				'status'  => \WP_Http::CONFLICT,
				'post_id' => $post_id,
			]
		);
	}

	public function check_stale_editor_save( $conflict, $document, array $request ): ?\WP_Error {
		$this->save_checked_at = time();

		if ( ! empty( $request['ignore_external_changes'] ) ) {
			return null;
		}

		$last_synced_at = (int) ( $request['last_synced_at'] ?? 0 );
		$mutated_at = self::get_mcp_mutation_time( (int) ( $request['editor_post_id'] ?? 0 ) );

		if ( $last_synced_at <= 0 || $mutated_at <= $last_synced_at ) {
			return null;
		}

		return new \WP_Error(
			'elementor_document_changed_externally',
			__( 'This page was changed by AI after you opened it. Your changes were not saved.', 'elementor' ),
			[ 'status' => \WP_Http::CONFLICT ]
		);
	}

	public function add_server_time_to_save_response( array $return_data ): array {
		$return_data['config']['document']['server_time'] = $this->save_checked_at ? $this->save_checked_at : time();

		return $return_data;
	}

	public function on_document_saved( $document ): void {
		self::clear_editor_unsaved( (int) $document->get_post()->ID );
	}

	public static function is_own_editor_open( int $post_id ): bool {
		$lock = explode( ':', (string) get_post_meta( $post_id, self::POST_LOCK_META_KEY, true ) );
		$locked_at = (int) $lock[0];
		$lock_owner = (int) ( $lock[1] ?? 0 );
		$window = (int) apply_filters( 'wp_check_post_lock_window', self::DEFAULT_POST_LOCK_WINDOW );

		return $lock_owner > 0
			&& get_current_user_id() === $lock_owner
			&& $locked_at > time() - $window;
	}

	public static function add_open_editor_notice( $result, int $post_id ) {
		if ( ! is_array( $result ) || ! self::is_own_editor_open( $post_id ) ) {
			return $result;
		}

		$result['llm_instructions'] = trim(
			( $result['llm_instructions'] ?? '' ) . ' ' . __( 'The Elementor editor is open on this page in the user\'s browser. Tell the user to choose Reload when it prompts them, before editing there again, or its next save will overwrite this change.', 'elementor' )
		);

		return $result;
	}

	private function check_other_user_unsaved( int $post_id ): ?\WP_Error {
		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once ABSPATH . 'wp-admin/includes/post.php';
		}

		$has_lock    = (bool) wp_check_post_lock( $post_id );
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

	private static function has_own_unpersisted_editor( int $post_id ): bool {
		return self::is_own_editor_open( $post_id )
			&& get_current_user_id() === (int) get_transient( self::unpersisted_key( $post_id ) );
	}

	private static function unsaved_key( int $post_id ): string {
		return "_elementor_editor_unsaved_{$post_id}";
	}

	private static function unpersisted_key( int $post_id ): string {
		return "_elementor_editor_unpersisted_{$post_id}";
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

	public static function set_editor_unpersisted( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		set_transient( self::unpersisted_key( $post_id ), get_current_user_id(), self::EDITOR_UNSAVED_TTL );
	}

	public static function clear_editor_unpersisted( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		$owner = (int) get_transient( self::unpersisted_key( $post_id ) );
		if ( get_current_user_id() === $owner ) {
			delete_transient( self::unpersisted_key( $post_id ) );
		}
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
