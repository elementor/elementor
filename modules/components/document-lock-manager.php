<?php
namespace Elementor\Modules\Components;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Manages document locking for Elementor documents.
 *
 * This class handles locking/unlocking documents to prevent multiple users
 * from editing the same document simultaneously.
 */
class Document_Lock_Manager {
	// 5 minutes
	const DEFAULT_TIME = 60 * 5;

	private $lock_duration;
	private const LOCK_USER_META = '_lock_user';
	private const LOCK_TIME_META = '_lock_time';
	private const LOCK_EDIT_LOCK_META = '_edit_lock';

	/**
	 * Initialize the lock manager.
	 *
	 * @param int $lock_duration Lock duration in seconds (default: 300 = 5 minutes)
	 */
	public function __construct( $lock_duration = self::DEFAULT_TIME ) {
		$this->lock_duration = $lock_duration;
	}

	/**
	 * Lock a document for the current user.
	 *
	 * @param int $document_id The document ID to lock
	 * @return bool True if lock was successful, false otherwise
	 */
	public function lock( $document_id ) {
		try {
			$user_id = get_current_user_id();
			if ( ! $user_id ) {
				return false;
			}

			$post = get_post( $document_id );
			if ( ! $post ) {
				return false;
			}

			if ( $this->is_lock_expired( $document_id ) ) {
				$this->unlock( $document_id );
			}

			$existing_lock = $this->get_lock_data( $document_id );
			if ( $existing_lock['locked_by'] ) {
				return false;
			}

			update_post_meta( $document_id, self::LOCK_USER_META, $user_id );
			update_post_meta( $document_id, self::LOCK_TIME_META, time() );

			if ( ! function_exists( 'wp_set_post_lock' ) ) {
				require_once ABSPATH . 'wp-admin/includes/post.php';
			}

			wp_set_post_lock( $document_id );

			return true;
		} catch ( \Exception $e ) {
			error_log( 'Document lock error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Unlock a document.
	 *
	 * @param int $document_id The document ID to unlock
	 * @return bool True if unlock was successful, false otherwise
	 */
	public function unlock( $document_id ) {
		try {

			delete_post_meta( $document_id, self::LOCK_USER_META );
			delete_post_meta( $document_id, self::LOCK_TIME_META );
			delete_post_meta( $document_id, self::LOCK_EDIT_LOCK_META );

			return true;
		} catch ( \Exception $e ) {
			error_log( 'Document unlock error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Check if a document is currently locked.
	 *
	 * @param int $document_id The document ID to check
	 * @return array Lock data with 'locked_by' (int|null), 'locked_at' (int|null)
	 */
	public function get_lock_data( $document_id ) {
		$locked_by = $this->get_document_lock_user( $document_id );
		$locked_at = $this->get_document_lock_time( $document_id );

		return [
			'locked_by' => $locked_by,
			'locked_at' => $locked_at,
		];
	}

	/**
	 * Check if a document lock has expired.
	 *
	 * @param int $document_id The document ID to check
	 * @return bool True if lock exists and is expired, false if not locked or not expired
	 */
	public function is_lock_expired( $document_id ) {
		$lock_data = $this->get_lock_data( $document_id );
		if ( ! $lock_data['locked_by'] ) {
			return false;
		}

		return $lock_data['locked_at'] && (int) $lock_data['locked_at'] + $this->lock_duration <= time();
	}

	/**
	 * Extend the lock for a document.
	 *
	 * @param int $document_id The document ID
	 * @return bool True if extended successfully, false if not locked or locked by another user
	 */
	public function extend_lock( $document_id ) {
		$lock_data = $this->get_lock_data( $document_id );
		if ( ! $lock_data['locked_by'] ) {
			return false;
		}

		$current_user_id = get_current_user_id();
		if ( (int) $lock_data['locked_by'] !== (int) $current_user_id ) {
			return false;
		}

		update_post_meta( $document_id, self::LOCK_TIME_META, time() );
		return true;
	}

	public function get_document_lock_user( $document_id ) {
		$lock_user_meta = get_post_meta( $document_id, self::LOCK_USER_META, true );
		if ( $lock_user_meta ) {
			return (int) $lock_user_meta;
		}

		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once ABSPATH . 'wp-admin/includes/post.php';
		}

		$wp_lock_user = wp_check_post_lock( $document_id );
		return $wp_lock_user ? (int) $wp_lock_user : null;
	}

	/**
	 * Get the lock time of a document.
	 *
	 * @param int $document_id The document ID to check
	 * @return int|null Lock time, or null if not locked
	 */
	public function get_document_lock_time( $document_id ) {
		$lock_time = get_post_meta( $document_id, self::LOCK_TIME_META, true );
		if ( $lock_time ) {
			return (int) $lock_time;
		}

		return null;
	}
}
