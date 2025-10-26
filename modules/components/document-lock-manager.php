<?php
namespace Elementor\Modules\Components;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
// 5 minutes
const DEFAULT_TIME = 60 * 5;
	
/**
 * Manages document locking for Elementor documents.
 * 
 * This class handles locking/unlocking documents to prevent multiple users
 * from editing the same document simultaneously.
 */
class Document_Lock_Manager {
	private $lock_duration;
	private const LOCK_USER_META = '_lock_user';
	private const LOCK_TIME_META = '_lock_time';

	/**
	 * Initialize the lock manager.
	 * 
	 * @param int $lock_duration Lock duration in seconds (default: 300 = 5 minutes)
	 */
	public function __construct( $lock_duration = DEFAULT_TIME ) {
		$this->lock_duration = $lock_duration;
	}

	/**
	 * Lock a document for the current user.
	 * 
	 * Sets both WordPress post lock and custom document lock metadata.
	 * 
	 * @param int $document_id The document ID to lock
	 * @return bool True if lock was successful, false otherwise
	 */
	public function lock_document( $document_id ) {
		try {
			$user_id = get_current_user_id();
			
			// Check if user is logged in
			if ( ! $user_id ) {
				return false;
			}
			
			// Check if document exists
			$post = get_post( $document_id );
			if ( ! $post ) {
				return false;
			}
			
			// Ensure WordPress post lock functions are available
			if ( ! function_exists( 'wp_set_post_lock' ) ) {
				require_once ABSPATH . 'wp-admin/includes/post.php';
			}
			
			// Ensure WordPress admin functions are available
			if ( ! function_exists( 'wp_set_post_lock' ) ) {
				require_once ABSPATH . 'wp-admin/includes/admin.php';
			}

			// Set WordPress post lock
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
	public function unlock_document( $document_id ) {
		// Remove WordPress post lock
		delete_post_meta( $document_id, '_edit_lock' );
		
		// Remove custom document lock metadata
		delete_post_meta( $document_id, self::LOCK_USER_META );
		delete_post_meta( $document_id, self::LOCK_TIME_META );

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
	public function is_document_locked( $document_id ) {
		// Check custom document lock metadata first
		$lock_user = get_post_meta( $document_id, self::LOCK_USER_META, true );
		$lock_time = get_post_meta( $document_id, self::LOCK_TIME_META, true );

		if ( ! $lock_user || ! $lock_time ) {
			return false;
		}

		// Check if lock has expired
		if ( time() - $lock_time > $this->lock_duration ) {
			// Lock has expired, automatically unlock
			$this->unlock_document( $document_id );
			return false;
		}

		return [
			'user_id' => $lock_user,
			'timestamp' => $lock_time,
		];
	}


	/**
	 * Get the user who has locked a document.
	 * 
	 * @param int $document_id The document ID to check
	 * @return \WP_User|false User object if locked, false if not locked
	 */
	public function get_locked_user( $document_id ) {
		$lock_data = $this->is_document_locked( $document_id );

		if ( ! $lock_data ) {
			return false;
		}

		return get_user_by( 'id', $lock_data['user_id'] );
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
		$lock_data = $this->is_document_locked( $document_id );

		if ( ! $lock_data ) {
			return false;
		}

		// Update lock time to extend duration
		update_post_meta( $document_id, self::LOCK_TIME_META, time() );

		return true;
	}
}
