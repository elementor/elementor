<?php
namespace Elementor\Testing\Includes;

use \Elementor\Utils;
use \Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Utils extends Elementor_Test_Base {

	public function test_should_return_elementor_pro_link() {
		$base_link = 'https://elementor.com/pro/?utm_source=wp-role-manager&utm_campaign=gopro&utm_medium=wp-dash';
		$this->assertSame( $base_link . '&utm_term=twentysixteen', Utils::get_pro_link( $base_link ) );
	}

	public function test_should_return_elementor_pro_link_with_parent_post() {
		switch_theme( 'asdasdas' );
		$base_link = 'https://elementor.com/pro/?utm_source=wp-role-manager&utm_campaign=gopro&utm_medium=wp-dash';
		$this->assertSame( $base_link . '&utm_term=twentysixteen', Utils::get_pro_link( $base_link ) );
	}

	public function test_should_return_elementor_pro_link_elementor_partner_id() {
		$id = 'zcpo7c3r2ytm5or';
		define( 'ELEMENTOR_PARTNER_ID', $id );
		$theme = sanitize_key( wp_get_theme() );
		$base_link = 'https://elementor.com/pro/?utm_source=wp-role-manager&utm_campaign=gopro&utm_medium=wp-dash';
		$this->assertSame( $base_link . "&utm_term=$theme&partner_id=$id", Utils::get_pro_link( $base_link ) );
	}

	public function test_should_return_placeholder_image_src() {
		$this->assertSame( ELEMENTOR_ASSETS_URL . 'images/placeholder.png', Utils::get_placeholder_image_src() );
	}

	public function test_should_return_edit_link_no_input() {
		$this->assertSame( '', Utils::get_edit_link() );
	}

	public function test_should_return_edit_link() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$this->assertSame( home_url() . "/wp-admin/post.php?post=$post_id&action=elementor", Utils::get_edit_link( $post_id ) );
	}

	/**
	 * @todo need to test when DOING_AJAX is 100% defined and when it's not.
	 */
	public function test_should_confirm_ajax() {
		if ( defined( 'DOING_AJAX' ) ) {
			$this->assertTrue( Utils::is_ajax() );
		} else {
			$this->assertFalse( Utils::is_ajax() );
		}
	}

	public function test_should_danie_script_debug() {
		$this->assertFalse( Utils::is_script_debug() );
	}

	public function test_should_get_preview_url() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$this->assertSame( home_url() . "/?p=$post_id&elementor-preview=$post_id&ver=" . time(), Utils::get_preview_url( $post_id ) );
	}

	public function test_should_get_wordpress_preview_url() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$this->assertSame( home_url() . "/?p=$post_id&preview_nonce=" . wp_create_nonce( 'post_preview_' . $post_id ) . '&preview=true', Utils::get_wp_preview_url( $post_id ) );
	}

	/**
	 * @throws \Exception
	 */
	public function test_should_replace_0_urls() {
		$this->assertSame( '0 rows affected.', Utils::replace_urls( 'http://' . home_url() . '/elementor', 'https://' . home_url() . '/elementor' ) );
	}

	/**
	 *
	 * @expectedExceptionMessage The `from` and `to` URL's must be different
	 * @expectedException        \Exception
	 * @throws                   \Exception
	 */
	public function test_should_throw_error_urls_are_equal() {
		//$this->expectExceptionMessage( 'The `from` and `to` URL\'s must be different' );
		Utils::replace_urls( 'http://' . home_url() . '/elementor', 'http://' . home_url() . '/elementor' );
	}

	/**
	 *
	 * @expectedExceptionMessage The `from` and `to` URL's must be valid URL's
	 * @expectedException        \Exception
	 * @throws                   \Exception
	 */
	public function test_should_throw_error_urls_are_invalid() {
		//$this->expectExceptionMessage( 'The `from` and `to` URL\'s must be valid URL\'s' );
		Utils::replace_urls( 'elementor', '/elementor' );
	}

	public function test_should_not_get_exit_to_dashboard_url() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$this->assertNull( Utils::get_exit_to_dashboard_url( $post_id ) );
	}


	public function test_should_get_updated_timezone_string() {
		$added_time_offset = 3;
		update_option( 'gmt_offset', $added_time_offset );
		$this->assertSame( "UTC+$added_time_offset", Utils::get_timezone_string() );
	}

	public function test_should_get_zero_timezone_string() {
		$added_time_offset = 0;
		update_option( 'gmt_offset', $added_time_offset );
		$this->assertSame( 'UTC+0', Utils::get_timezone_string() );
	}

	public function test_should_get_timezone_string_default_option() {
		delete_option( 'timezone_string' );
		delete_option( 'gmt_offset' );
		$this->assertSame( 'UTC+0', Utils::get_timezone_string() );
	}

	public function test_should_get_minos_timezone_string() {
		$added_time_offset = - 5;
		update_option( 'gmt_offset', $added_time_offset );
		$this->assertSame( "UTC$added_time_offset", Utils::get_timezone_string() );
	}

	public function test_should_get_when_and_how_edited_the_post_last() {
		$user_id = $this->factory()->get_administrator_user()->ID;
		$post_id = $this->factory()->create_and_get_custom_post(
			[
				'post_author' => $user_id,
				'post_date' => '2014-11-11 23:45:30',
			]
		)->ID;
		$this->assertRegExp( '/Last edited on \<time\>.*\<\/time\>\ by .*/', Utils::get_last_edited( $post_id ) );
	}

	public function test_should_get_post_auto_save() {
		$posts = $this->factory()->create_and_get_parent_and_child_posts();
		$this->assertEquals( get_post( $posts['child_id'] )->ID, Utils::get_post_autosave( $posts['parent_id'], $posts['user_id'] )->ID );
	}

	public function test_should_create_and_get_new_post_url() {
		$nonce = wp_create_nonce( 'elementor_action_new_post' );
		$this->assertSame( "http://example.org/wp-admin/edit.php?action=elementor_new_post&amp;post_type=page&amp;_wpnonce=$nonce", Utils::get_create_new_post_url() );
	}


	public function test_getYoutubeId() {
		$youtube_id = '9uOETcuFjbE';
		$youtube_urls = [
			'https://www.youtube.com/watch?v=' . $youtube_id,
			'https://www.youtube.com/watch?v=' . $youtube_id . '&feature=player_embedded',
			'https://youtu.be/' . $youtube_id,
		];

		foreach ( $youtube_urls as $youtube_url ) {
			$video_properties = \Elementor\Embed::get_video_properties( $youtube_url );

			$this->assertEquals( $youtube_id, $video_properties['video_id'] );
		}

		$this->assertNull( \Elementor\Embed::get_video_properties( 'https://www.youtube.com/' ) );
	}
}
