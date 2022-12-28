<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Frontend\RenderModeManager;

use Elementor\Core\Frontend\Render_Mode_Manager;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Normal;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Render_Mode_Manager extends Elementor_Test_Base {
	public function test_it_should_set_the_mock_render_mode_as_the_current() {
		$post = $this->factory()->create_and_get_default_post();

		$nonce = wp_create_nonce( Render_Mode_Manager::get_nonce_action( $post->ID ) );

		$this->prepare( Render_Mode_Mock::class, Render_Mode_Mock::get_name(), $post->ID, $nonce );

		$render_mode_manager = new Render_Mode_Manager();

		do_action('wp_enqueue_scripts');

		$this->assertTrue( $render_mode_manager->get_current() instanceof Render_Mode_Mock );
		$this->assertTrue( wp_script_is( 'fake-script' ) );
		$this->assertTrue( wp_style_is( 'fake-style' ) );
	}

	public function test_it_should_not_accept_render_mode_that_do_not_extend_the_base(  ) {
		$this->expectException(\Exception::class);

		add_action(
			'elementor/frontend/render_mode/register',
			function ( Render_Mode_Manager $manager ) {
				$manager->register_render_mode( Render_Mode_Without_Extend::class );
			}
		);

		new Render_Mode_Manager();
	}

	public function test_throw_exception_if_get_permissions_callback_return_false() {
		// WP >= 6.2-alpha
		if ( class_exists( '\WpOrg\Requests\Exception\Http\Status403' ) ) {
			$this->expectException( \WpOrg\Requests\Exception\Http\Status403::class );
		} else {
			$this->expectException( \Requests_Exception_HTTP_403::class );
		}

		$post = $this->factory()->create_and_get_default_post();

		$nonce = wp_create_nonce( Render_Mode_Manager::get_nonce_action( $post->ID ) );

		$this->prepare( Render_Mode_Mock_Forbidden::class, Render_Mode_Mock_Forbidden::get_name(), $post->ID, $nonce );

		new Render_Mode_Manager();
	}

	/**
	 * @dataProvider get_query_params
	 *
	 * @param $name
	 * @param $post_id
	 * @param $nonce
	 */
	public function test_it_should_set_default_render_mock_if_query_params_are_not_valid( $name, $post_id, $nonce ) {
		$this->prepare( Render_Mode_Mock::class, $name, $post_id, $nonce );

		$render_mode_manager = new Render_Mode_Manager();

		$this->assertTrue( $render_mode_manager->get_current() instanceof Render_Mode_Normal );
	}

	/**
	 * @return array[]
	 */
	public function get_query_params() {
		$post = $this->factory()->create_and_get_default_post();
		$nonce = wp_create_nonce( Render_Mode_Manager::get_nonce_action( $post->ID ) );
		$name = Render_Mode_Mock::get_name();

		return [
			'name is not valid' => [ null, $post->ID, $nonce ],
			'post id is not valid' => [ $name, 9999999, $nonce ],
			'nonce is not valid' => [ $name, $post->ID, 'This is a fake nonce' ],
		];
	}

	/**
	 * @param $render_mode_class_name
	 * @param $name
	 * @param $post_id
	 * @param $nonce
	 */
	protected function prepare( $render_mode_class_name, $name, $post_id, $nonce ) {
		$_GET[ Render_Mode_Manager::QUERY_STRING_PARAM_NAME ] = $name;
		$_GET[ Render_Mode_Manager::QUERY_STRING_POST_ID ] = $post_id;
		$_GET[ Render_Mode_Manager::QUERY_STRING_NONCE_PARAM_NAME ] = $nonce;

		add_action(
			'elementor/frontend/render_mode/register',
			function ( Render_Mode_Manager $manager ) use ( $render_mode_class_name ) {
				$manager->register_render_mode( $render_mode_class_name );
			}
		);
	}
}

class Render_Mode_Mock extends Render_Mode_Base {
	public static function get_name() {
		return 'mock';
	}

	public function get_permissions_callback() {
		return true;
	}

	public function enqueue_scripts() {
		wp_enqueue_script( 'fake-script', 'fake-path' );
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'fake-style', 'fake-path' );
	}
}

class Render_Mode_Mock_Forbidden extends Render_Mode_Base {
	public static function get_name() {
		return 'mock-forbidden';
	}

	public function get_permissions_callback() {
		return false;
	}
}

class Render_Mode_Without_Extend {}

