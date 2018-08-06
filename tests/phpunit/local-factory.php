<?php

namespace Elementor\Testing;

class Local_Factory extends \WP_UnitTestCase {

	private $default_post;
	private $custom_post;
	private $parent_post;
	private $child_post;

	private $local_template_id;

	private $administrator_user;
	private $subscriber_user;

	/**
	 * @return \WP_Post
	 */
	public function get_default_post() {
		if ( ! $this->default_post ) {
			$this->default_post = $this->factory()->post->create_and_get();
		}

		return $this->default_post;
	}

	/**
	 * @return \WP_Post
	 */
	public function create_and_get_default_post() {
		return $this->factory()->post->create_and_get();
	}

	/**
	 * @param array $args
	 *
	 * @return \WP_Post
	 */
	public function get_custom_post( $args ) {
		$this->custom_post = clone $this->get_default_post();

		$this->factory()->post->update_object( $this->custom_post->ID, $args );

		return $this->custom_post;
	}

	/**
	 * @param $args
	 *
	 * @return array|null|\WP_Post
	 */
	public function create_and_get_custom_post( $args ) {
		return $this->factory()->post->create_and_get( $args );
	}

	/**
	 * @return array parent_id | WP_Post; child_id | WP_Post; user_id | WP_User.
	 */
	public function create_and_get_parent_and_child_posts() {
		$user_id = $this->factory()->user->create( [ 'display_name' => 'elementor' ] );
		$post_id = $this->factory()->post->create(
			[
				'post_author' => $user_id,
				'post_date' => '2014-11-11 23:45:30',
				'post_type' => 'revision',
			]
		);
		$inherent_post_id = $this->factory()->post->create(
			[
				'post_date' => '2014-11-12 23:45:30',
				'post_type' => 'revision',
				'post_author' => $user_id,
				'post_parent' => $post_id,
				'post_name' => $post_id . '-autosave',

			]
		);

		return [
			'parent_id' => $post_id,
			'child_id' => $inherent_post_id,
			'user_id' => $user_id,
		];
	}

	/**
	 * @return int|\WP_Error
	 */
	public function get_local_template_id() {
		if ( ! $this->local_template_id ) {
			$this->local_template_id = $this->create_template();
		}

		return $this->local_template_id;
	}

	/**
	 * create new template and return it.
	 *
	 * @param $rags
	 *
	 * @return int|\WP_Error template id
	 */
	public function create_and_get_template_id( $rags ) {
		return $this->create_template( $rags );
	}

	/**
	 * @return \WP_User
	 */
	public function create_and_get_administrator_user() {
		$this->administrator_user = $this->factory()->user->create_and_get( [ 'role' => 'administrator' ] );

		return $this->administrator_user;
	}

	/**
	 * @return \WP_User
	 */
	public function get_administrator_user() {
		if ( ! $this->administrator_user ) {
			$this->administrator_user = $this->factory()->user->create_and_get( [ 'role' => 'administrator' ] );
		}

		return $this->administrator_user;
	}

	/**
	 * @return \WP_User
	 */
	public function get_subscriber_user() {
		if ( ! $this->subscriber_user ) {
			$this->subscriber_user = $this->factory()->user->create_and_get( [ 'role' => 'subscriber' ] );
		}

		return $this->subscriber_user;
	}

	private function create_template( $template_data = [ 'title' => 'new template' ] ) {
		$template_id  = $this->factory()->post->create(
			[
				'post_title' => ! empty( $template_data['title'] ) ? $template_data['title'] : __( '(no title)', 'elementor' ),
				'post_status' => current_user_can( 'publish_posts' ) ? 'publish' : 'pending',
				'post_type' => \Elementor\TemplateLibrary\Source_Local::CPT,
				'post_content' => '<ul>
									<li title="Edit">
						Edit
					</li>
							</ul>
													<h3>
								This is the heading							</h3>
								Click edit button to change this text. Lorem ipsum dolor sit amet consectetur adipiscing elit dolor							
													<h3>
								This is the heading							</h3>
								Click edit button to change this text. Lorem ipsum dolor sit amet consectetur adipiscing elit dolor							
													<a href="#">
								Click Here							</a>',
			]
		);
		update_post_meta( $template_id, '_elementor_data', '["type":"bla"]' );

		return $template_id;
	}
}
