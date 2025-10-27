<?php
namespace Elementor\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Document_Lock_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const ONE_HOUR = 60 * 60;

class Lock_Component_Manager {
	private $lock_manager;

	public function __construct() {
		$this->lock_manager = $this->get_lock_manager_instance();
		$this->register_hooks();
	}

	private function register_hooks() {
		add_filter( 'heartbeat_received', [ $this, 'heartbeat_received' ], 10, 2 );
	}

	private function get_lock_manager() {
		return $this->lock_manager;
	}

	public static function get_lock_manager_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new Document_Lock_Manager( ONE_HOUR );
		}

		return $instance;
	}

	public function lock_component( $post_id ) {
		$lock_manager = $this->get_lock_manager();
		return $lock_manager->lock_document( $post_id );
	}

	public function unlock_component( $post_id ) {
		$locked_user = $this->get_locked_user( $post_id );
		$current_user_id = get_current_user_id();

		// Only allow unlocking if the current user owns the lock
		if ( ! $locked_user || (int) $locked_user->ID !== (int) $current_user_id ) {
			return false;
		}

		$lock_manager = $this->get_lock_manager();
		return $lock_manager->unlock_document( $post_id );
	}

	public function get_locked_user( $post_id ) {
		$lock_manager = $this->get_lock_manager();
		return $lock_manager->get_locked_user( $post_id );
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

		$locked_user = $this->get_locked_user( $post_id );

		if ( $locked_user && get_current_user_id() === $locked_user->ID ) {
			$this->get_lock_manager()->extend_lock( $post_id );
		}

		return $response;
	}
}
