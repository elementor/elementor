<?php

namespace Elementor\Testing\Modules\Screenshots\Module;

use Elementor\Modules\Screenshots\Module;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Ajax_Action extends Elementor_Test_Base {
	/**
	 * @var Module
	 */
	private $module;

	/**
	 * @var \WP_Post
	 */
	private $post;

	public function setUp() {
		parent::setUp();

		$this->module = Module::instance();
		$this->post = $this->factory()->create_and_get_default_post();
	}

	public function test_should_return_false_if_there_is_no_screenshot() {
		$response = $this->module->ajax_save( [ 'post_id' => $this->post->ID ] );

		$this->assertFalse( $response );
	}

	public function test_should_return_false_if_there_is_no_post_id() {
		$response = $this->module->ajax_save( [ 'screenshot' => 'adsasd' ] );

		$this->assertFalse( $response );
	}

	public function test_should_attach_image_to_the_current_post() {
		$one_px_image_base_68 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkZmD4DgABDQD8k9dv9wAAAABJRU5ErkJggg==';

		$response = $this->module->ajax_save( [
			'post_id' => $this->post->ID,
			'screenshot' => $one_px_image_base_68,
		] );

		$upload_dir = wp_get_upload_dir();
		$file_path = '/elementor/screenshots/Elementor-post-screenshot-' . $this->post->ID . '.png';

		$this->assertTrue( file_exists( $upload_dir['basedir'] . $file_path ) );

		$this->assertTrue(
			is_array( $post_meta = get_post_meta( $this->post->ID, '_elementor_screenshot', true ) )
		);

		$this->assertEquals( $upload_dir['baseurl'] . $file_path, $post_meta['url'] );
		$this->assertEquals( $post_meta['url'], $response );
	}
}
