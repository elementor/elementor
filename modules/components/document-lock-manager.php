<?php
namespace Elementor\Modules\Components;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Document_Lock_Manager {
	private $lock_duration;
	private $document_type;

	public function __construct($document_type,$lock_duration = 300) {
		$this->lock_duration = $lock_duration;
		$this->document_type = $document_type;
	}
	
	public function lock_document( $component_id ) {
		try {
			$user_id = get_current_user_id();
			if ( ! function_exists( 'wp_set_post_lock' ) ) {
				require_once ABSPATH . 'wp-admin/includes/post.php';
			}

			wp_set_post_lock( $component_id );
			
			update_post_meta( $component_id, '_'.$this->document_type.'_lock_user', $user_id );
			update_post_meta( $component_id, '_'.$this->document_type.'_lock_time', time() );
			
			return true;
		} catch ( \Exception $e ) {
			error_log( 'Document lock error: ' . $e->getMessage() );
			return false;
		}
	}


	public function unlock_document( $component_id ) {
		delete_post_meta( $component_id, '_edit_lock' );
		delete_post_meta( $component_id, '_'.$this->document_type.'_lock_user' );
		delete_post_meta( $component_id, '_'.$this->document_type.'_lock_time' );
		
		return true;
	}


	public function is_document_locked( $component_id ) {
		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once ABSPATH . 'wp-admin/includes/post.php';
		}

		$locked_user = wp_check_post_lock( $component_id );
		
		if ( ! $locked_user ) {
			return false;
		}
		
		$lock_time = get_post_meta( $component_id, '_'.$this->document_type.'_lock_time', true );
		
		if ( $lock_time && ( time() - $lock_time > $this->lock_duration ) ) {
			$this->unlock_document( $component_id );
			return false;
		}
		
		return [
			'user_id' => $locked_user,
			'timestamp' => $lock_time,
		];
	}


	public function get_locked_user( $component_id ) {
		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once ABSPATH . 'wp-admin/includes/post.php';
		}

		$locked_user = wp_check_post_lock( $component_id );
		
		if ( ! $locked_user ) {
			return false;
		}
		
		return get_user_by( 'id', $locked_user );
	}


	public function extend_lock( $component_id ) {
		$lock_data = $this->is_document_locked( $component_id );
		
		if ( ! $lock_data ) {
			return false;
		}

		update_post_meta( $component_id, '_'.$this->document_type.'_lock_time', time() );
		
		return true;
	}

}
