<?php

class Local_Factory extends WP_UnitTestCase {

	private $default_post;
	private $custom_post;
	private $parent_post;
	private $child_post;

	private $administrator_user;
	private $subscriber_user;

	/**
	 * @return WP_User
	 */
	public function get_subscriber_user() {
		if ( ! $this->subscriber_user ) {
			$this->subscriber_user = $this->factory->user->create_and_get( [ 'role' => 'subscriber' ] );
		}

		return $this->subscriber_user;
	}

	/**
	 * @return WP_Post
	 */
	public function get_default_Post() {
		if ( ! $this->default_post ) {
			$this->default_post = $this->factory->post->create_and_get();
		}

		return $this->default_post;
	}

	/**
	 * @return WP_Post
	 */
	public function get_custom_post( $args ) {
		$this->custom_post = clone $this->get_default_Post();

		$this->factory->post->update_object( $this->custom_post->ID, $args );

		return $this->custom_post;
	}

	/**
	 * @return WP_User
	 */
	public function get_administrator_user() {
		if ( ! $this->administrator_user ) {
			$this->administrator_user = $this->factory->user->create_and_get( [ 'role' => 'administrator' ] );
		}

		return $this->administrator_user;
	}
}