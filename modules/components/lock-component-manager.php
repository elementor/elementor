<?php
namespace Elementor\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Document_Lock_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const ONE_HOUR = 60 * 60;

class Lock_Component_Manager {
	private $lock_manager = null;

	public function __construct() {
			$this->lock_manager = new Document_Lock_Manager( ONE_HOUR );
	}

	public function register_hooks() {
		add_filter( 'heartbeat_received', [ $this, 'heartbeat_received' ], 10, 2 );
	}

	
	public function lock_component( $post_id ) {
		return $this->lock_manager->lock_document( $post_id );
	}

	public function unlock_component( $post_id ) {
		$lock_data = $this->lock_manager->is_document_locked( $post_id );
		$current_user_id = get_current_user_id();

		// Only allow unlocking if the current user owns the lock
		if ( ! $lock_data['is_locked'] || (int) $lock_data['lock_user'] !== (int) $current_user_id ) {
			return false;
		}

		return $this->lock_manager->unlock_document( $post_id );
	}


	private function is_component_post( $post_id ) {
		return get_post_type( $post_id ) === Component_Document::TYPE;
	}

	public function heartbeat_received( $response, $data ) {
		if ( ! isset( $data['elementor_post_lock']['post_ID'] ) ) {
			return $response;
		}

		$post_id = $data['elementor_post_lock']['post_ID'];

		if ( ! $this->is_component_post( $post_id ) ) {
			return $response;
		}

		$lock_data = $this->lock_manager->is_document_locked( $post_id );
		$current_user_id = get_current_user_id();
		if ( $lock_data['is_locked'] && $current_user_id === (int) $lock_data['lock_user'] ) {
			$this->lock_manager->extend_lock( $post_id );
		}

		return $response;
	}
}
