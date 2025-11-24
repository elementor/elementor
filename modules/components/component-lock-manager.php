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

	public function unlock( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
				throw new \Exception( 'Post is not a component type' );
		}

		$lock_data = $this->is_locked( $post_id );
		$current_user_id = get_current_user_id();

		// Only allow unlocking if the current user owns the lock
		if ( ! $lock_data['is_locked'] || (int) $lock_data['lock_user'] !== (int) $current_user_id ) {
			return false;
		}

		return parent::unlock( $post_id );
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

		$lock_data = $this->is_locked( $post_id );
		$current_user_id = get_current_user_id();
		if ( $lock_data['is_locked'] && $current_user_id === (int) $lock_data['lock_user'] ) {
			$this->extend_lock( $post_id );
		}

		return $response;
	}

	public function get_updated_status( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
			throw new \Exception( 'Post is not a component type' );
		}

		$lock_data = $this->is_locked( $post_id );

		if ( ! $lock_data['is_locked'] ) {
			if ( null !== $lock_data['lock_time'] ) {
				parent::unlock( $post_id );
			}
			return [
				'is_locked' => false,
				'lock_user' => null,
				'lock_time' => null,
			];
		}

		$current_user_id = get_current_user_id();
		if ( $current_user_id === (int) $lock_data['lock_user'] ) {
			$lock_data['is_locked'] = false;
		}

		return $lock_data;
	}

	public function lock( $document_id ) {
		if ( ! $this->is_component_post( $document_id ) ) {
			throw new \Exception( 'Post is not a component type' );
		}

		return parent::lock( $document_id );
	}
}
