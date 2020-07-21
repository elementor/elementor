<?php
namespace Elementor\Testing\Modules\Screenshots\Module;

use Elementor\Modules\Screenshots\Module;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Extend_Document_Config extends Elementor_Test_Base {
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

		global $wp_query;
		$wp_query->queried_object = $this->post;
		$wp_query->queried_object_id = $this->post->ID;
	}

	public function test_should_extend_document_config() {
		$config = $this->module->extend_document_config( [
			'urls' => [
				'a' => 'a',
			],
			'a' => 'a',
		] );

		$this->assertArrayHaveKeys( [ 'urls', 'a' ], $config );
		$this->assertArrayHaveKeys( [ 'a', 'screenshot' ], $config['urls'] );
	}
}
