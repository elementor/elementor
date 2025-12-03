<?php
namespace Elementor\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Document_Lock_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Lock_Manager extends Document_Lock_Manager {
	const ONE_HOUR = 60 * 60;
	private static $instance = null;
	public function __construct() {
		parent::__construct( self::ONE_HOUR );
	}

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function register_hooks() {
		add_filter( 'heartbeat_received', [ $this, 'heartbeat_received' ], 10, 2 );
	}

	public function heartbeat_received( $response, $data ) {
		if ( ! isset( $data['elementor_post_lock']['post_ID'] ) ) {
			return $response;
		}

		$post_id = $data['elementor_post_lock']['post_ID'];

		if ( ! $this->is_component_post( $post_id ) ) {
			return $response;
		}

		$lock_data = $this->get_lock_data( $post_id );
		$user_id = get_current_user_id();
		if ( $user_id === (int) $lock_data['locked_by'] ) {
			$this->extend_lock( $post_id );
		}

		return $response;
	}


	/**
	 * Unlock a component.
	 *
	 * @param int $post_id The component ID to unlock
	 * @return bool True if unlock was successful, false otherwise
	 * @throws \Exception If post is not a component type.
	 */
	public function unlock( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
				throw new \Exception( 'Post is not a component type' );
		}

		$lock_data = $this->get_lock_data( $post_id );
		$current_user_id = get_current_user_id();
		if ( $lock_data['locked_by'] && (int) $lock_data['locked_by'] !== (int) $current_user_id ) {
			return false;
		}
		return parent::unlock( $post_id );
	}

	/**
	 * Lock a component.
	 *
	 * @param int $post_id The component ID to lock
	 * @return bool|null True if lock was successful, null if locked by another user, false otherwise
	 * @throws \Exception If post is not a component type.
	 */
	public function lock( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
			throw new \Exception( 'Post is not a component type' );
		}

		$lock_data = $this->get_lock_data( $post_id );
		$is_expired = $this->is_lock_expired( $post_id );

		if ( $is_expired ) {
			parent::unlock( $post_id );
		} elseif ( $lock_data['locked_by'] ) {
			return null;
		}

		return parent::lock( $post_id );
	}

	/**
	 * Get lock data for a component.
	 *
	 * @param int $post_id The component ID
	 * @return array Lock data with 'locked_by' (int|null), 'locked_at' (int|null)
	 * @throws \Exception If post is not a component type.
	 */
	public function get_lock_data( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
			throw new \Exception( 'Post is not a component type' );
		}

		return parent::get_lock_data( $post_id );
	}

	/**
	 * Extend the lock for a component.
	 *
	 * @param int $post_id The component ID
	 * @return bool|null True if extended successfully, null if not locked or locked by another user
	 * @throws \Exception If post is not a component type.
	 */
	public function extend_lock( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
			throw new \Exception( 'Post is not a component type' );
		}

		$lock_data = $this->get_lock_data( $post_id );
		if ( ! $lock_data['locked_by'] ) {
			return null;
		}

		$current_user_id = get_current_user_id();
		if ( (int) $lock_data['locked_by'] !== (int) $current_user_id ) {
			return null;
		}

		return parent::extend_lock( $post_id );
	}

	private function is_component_post( $post_id ) {
		return get_post_type( $post_id ) === Component_Document::TYPE;
	}
}
