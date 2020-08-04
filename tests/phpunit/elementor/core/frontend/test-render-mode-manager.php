<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Frontend;

use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Frontend\Render_Mode_Manager;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Normal;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Render_Mode_Manager extends Elementor_Test_Base {
	public function test_it_should_set_the_mock_render_mode_as_the_current() {
		$post = $this->factory()->create_and_get_default_post();

		$_GET[ Render_Mode_Manager::QUERY_STRING_PARAM_NAME ] = 'mock';
		$_GET[ Render_Mode_Manager::QUERY_STRING_POST_ID ] = $post->ID;
		$_GET[ Render_Mode_Manager::QUERY_STRING_NONCE_PARAM_NAME ] = wp_create_nonce(
			Render_Mode_Manager::get_nonce_action( $post->ID )
		);

		add_action( 'elementor/frontend/render_mode/register', function ( Render_Mode_Manager $manager ) {
			$manager->register_render_mode( Render_Mode_Mock::class );
		} );

		$render_mode_manager = new Render_Mode_Manager();

		$this->assertTrue( $render_mode_manager->get_current() instanceof Render_Mode_Mock );
	}

	/**
	 * @dataProvider get_query_params
	 *
	 * @param $name
	 * @param $post_id
	 * @param $nonce
	 */
	public function test_it_should_set_default_render_mock_if_query_params_are_not_valid( $name, $post_id, $nonce ) {
		$_GET[ Render_Mode_Manager::QUERY_STRING_PARAM_NAME ] = $name;
		$_GET[ Render_Mode_Manager::QUERY_STRING_POST_ID ] = $post_id;
		$_GET[ Render_Mode_Manager::QUERY_STRING_NONCE_PARAM_NAME ] = $nonce;

		add_action( 'elementor/frontend/render_mode/register', function ( Render_Mode_Manager $manager ) {
			$manager->register_render_mode( Render_Mode_Mock::class );
		} );

		$render_mode_manager = new Render_Mode_Manager();

		$this->assertTrue( $render_mode_manager->get_current() instanceof Render_Mode_Normal );
	}

	/**
	 * @return array[]
	 */
	public function get_query_params() {
		$post = $this->factory()->create_and_get_default_post();
		$nonce = wp_create_nonce( Render_Mode_Manager::get_nonce_action( $post->ID ) );

		return [
			'name is not valid' => [ null, $post->ID, $nonce],
			'post id is not valid' => [ 'mock', 9999999, $nonce],
			'nonce is not valid' => [ 'mock', $post->ID, 'This is a fake nonce'],
		];
	}
}

class Render_Mode_Mock extends Render_Mode_Base {
	public static function get_name() {
		return 'mock';
	}

	public function get_permissions_callback() {
		return true;
	}
}
