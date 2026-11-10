<?php

namespace Elementor\Modules\Mcp\Utils;

use Elementor\Core\Utils\Document\Document_Mutator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Sync_State {

	const EDITOR_UNSAVED_TTL = 300;
	const MCP_MUTATION_TTL   = 3600;
	const POST_LOCK_WINDOW   = 150;

	private static bool $is_mcp_write_in_progress = false;

	public function register_hooks(): void {
		add_filter( 'elementor/mcp/pre_execute_guard', [ $this, 'check_mutation_guard' ], 10, 2 );
		add_action( 'elementor/heartbeat/unsaved_signal', [ $this, 'handle_unsaved_signal' ], 10, 2 );
		add_filter( 'elementor/heartbeat/mutation_marker', [ $this, 'build_mutation_marker' ], 10, 2 );
		add_action( 'elementor/document/after_save', [ $this, 'on_document_saved' ] );
		add_filter( 'elementor/document/config', [ $this, 'add_server_time_to_config' ] );
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

		$editor_user_id = self::get_open_editor_user_id( $post_id );

		if ( ! $editor_user_id ) {
			return null;
		}

		if ( get_current_user_id() !== $editor_user_id && self::is_live_post( $post_id ) ) {
			return self::editor_open_by_other_user_error( $post_id, $editor_user_id );
		}

		if ( ! self::has_editor_unsaved( $post_id ) ) {
			return null;
		}

		return self::editor_unsaved_error( $post_id );
	}

	public static function get_open_editor_user_id( int $post_id ): int {
		$lock = explode( ':', (string) get_post_meta( $post_id, '_edit_lock', true ) );
		$locked_at = (int) $lock[0];

		/** This filter is documented in wp-admin/includes/post.php */
		$window = (int) apply_filters( 'wp_check_post_lock_window', self::POST_LOCK_WINDOW );

		if ( ! $locked_at || $locked_at <= time() - $window ) {
			return 0;
		}

		return (int) ( $lock[1] ?? get_post_meta( $post_id, '_edit_last', true ) );
	}

	public function on_document_saved( $document ): void {
		if ( self::$is_mcp_write_in_progress ) {
			return;
		}

		$post_id = (int) $document->get_main_id();
		self::clear_editor_unsaved( $post_id );
		self::delete_mcp_mutation( $post_id );
	}

	public static function begin_mcp_write(): void {
		self::$is_mcp_write_in_progress = true;
	}

	public static function end_mcp_write(): void {
		self::$is_mcp_write_in_progress = false;
	}

	private static function is_live_post( int $post_id ): bool {
		return in_array( get_post_status( $post_id ), Document_Mutator::LIVE_STATUSES, true );
	}

	private static function editor_open_by_other_user_error( int $post_id, int $editor_user_id ): \WP_Error {
		$editor_user = get_userdata( $editor_user_id );
		$editor_name = $editor_user ? $editor_user->display_name : __( 'Another user', 'elementor' );

		return new \WP_Error(
			'elementor_editor_open_by_other_user',
			sprintf(
				/* translators: %s: Display name of the user editing the page. */
				__( '%s has this page open in the Elementor editor. The page is published, so your changes would go into a separate draft copy they can\'t see. Ask them to connect the agent with their own account, or to close the editor and wait a few minutes before retrying.', 'elementor' ),
				$editor_name
			),
			[
				'status'  => \WP_Http::CONFLICT,
				'post_id' => $post_id,
			]
		);
	}

	private static function editor_unsaved_error( int $post_id ): \WP_Error {
		return new \WP_Error(
			'elementor_editor_unsaved_changes',
			__( 'The user has unsaved changes in the Elementor editor. Ask them to save (Ctrl+S), then call elementor/get-page-structure and retry.', 'elementor' ),
			[
				'status'  => \WP_Http::CONFLICT,
				'post_id' => $post_id,
			]
		);
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
