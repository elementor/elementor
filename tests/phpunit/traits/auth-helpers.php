<?php
namespace Elementor\Testing\Traits;

/**
 * @mixin \WP_UnitTestCase
 */
trait Auth_Helpers {
	/**
	 * @param $role
	 *
	 * @return \WP_User
	 */
	public function act_as( $role ) {
		$user = $this->factory()->user->create_and_get( [
			'role' => $role,
		] );

		wp_set_current_user( $user->ID );

		return $user;
	}

	/**
	 * @return \WP_User
	 */
	public function act_as_admin() {
		return $this->act_as( 'administrator' );
	}

	/**
	 * @return \WP_User
	 */
	public function act_as_network_admin() {
		$user = $this->act_as_admin();

		grant_super_admin( $user->ID );

		return $user;
	}

	/**
	 * @return \WP_User
	 */
	public function act_as_editor() {
		return $this->act_as( 'editor' );
	}

	/**
	 * @return \WP_User
	 */
	public function act_as_subscriber() {
		return $this->act_as( 'subscriber' );
	}

	/**
	 * @return \WP_User
	 */
	public function act_as_admin_or_network_admin() {
		if ( is_multisite() ) {
			return $this->act_as_network_admin();
		}

		return $this->act_as_admin();
	}
}
