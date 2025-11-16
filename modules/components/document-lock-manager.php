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
	 * Sets both WordPress post lock and custom document lock metadata.
	 * Respects existing locks - will not override locks held by other users.
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

			$existing_lock = $this->is_locked( $document_id );
			if ( $existing_lock['is_locked'] && (int) $existing_lock['lock_user'] !== (int) $user_id ) {
				return false;
			}

			if ( ! function_exists( 'wp_set_post_lock' ) ) {
				require_once ABSPATH . 'wp-admin/includes/post.php';
			}

			if ( ! function_exists( 'wp_set_post_lock' ) ) {
				require_once ABSPATH . 'wp-admin/includes/admin.php';
			}

			wp_set_post_lock( $document_id );

			// Set custom document lock metadata
			update_post_meta( $document_id, self::LOCK_USER_META, $user_id );
			update_post_meta( $document_id, self::LOCK_TIME_META, time() );

			return true;
		} catch ( \Exception $e ) {
			error_log( 'Document lock error: ' . $e->getMessage() );
			return false;
		}
	}


	/**
	 * Unlock a document.
	 *
	 * Removes both WordPress post lock and custom document lock metadata.
	 *
	 * @param int $document_id The document ID to unlock
	 * @return bool Always returns true
	 */
	public function unlock( $document_id ) {

		// Remove custom document lock metadata
		delete_post_meta( $document_id, self::LOCK_USER_META );
		delete_post_meta( $document_id, self::LOCK_TIME_META );

		// Remove edit lock metadata
		delete_post_meta( $document_id, self::LOCK_EDIT_LOCK_META );

		return true;
	}

	/**
	 * Check if a document is currently locked.
	 *
	 * Also handles automatic lock expiration based on lock duration.
	 *
	 * @param int $document_id The document ID to check
	 * @return array|false Lock data array if locked, false if not locked
	 */
	public function is_locked( $document_id ) {
		$lock_user = get_post_meta( $document_id, self::LOCK_USER_META, true );
		$lock_time = get_post_meta( $document_id, self::LOCK_TIME_META, true );
		$is_locked = false;

		if ( $lock_user && $lock_time && time() - $lock_time <= $this->lock_duration ) {
			$is_locked = true;
		}

		return [
			'is_locked'  => $is_locked,
			'lock_user'  => $lock_user ? $lock_user : null,
			'lock_time'  => $lock_time ? $lock_time : null,
		];
	}

	/**
	 * Extend the lock duration for a document.
	 *
	 * Only works if the current user owns the lock.
	 *
	 * @param int $document_id The document ID to extend lock for
	 * @return bool True if lock was extended, false otherwise
	 */
	public function extend_lock( $document_id ) {
		$user_id = get_current_user_id();
		$lock_data = $this->is_locked( $document_id );

		if ( ! $lock_data['is_locked'] ) {
			return false;
		}

		if ( (int) $lock_data['lock_user'] !== (int) $user_id ) {
			return false;
		}

		// Update lock time to extend duration
		update_post_meta( $document_id, self::LOCK_TIME_META, time() );

		return true;
	}
}
