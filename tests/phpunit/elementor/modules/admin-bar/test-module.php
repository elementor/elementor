<?php
namespace Elementor\Testing\Modules\AdminBar;

use Elementor\Plugin;
use Elementor\Modules\AdminBar\Module;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Module extends Elementor_Test_Base {
	/**
	 * @var Module
	 */
	protected $module;

	protected $fake_document_data = [
		'meta_input' => [
			'_elementor_edit_mode' => true,
			'_elementor_data' => '[{"id":"378e77c", "elType": "section"}]',
		],
	];

	public function setUp() {
		parent::setUp();

		wp_set_current_user( self::factory()->get_administrator_user()->ID );

		$this->module = new Module();

		remove_filter( 'elementor/frontend/admin_bar/settings', [
			Plugin::instance()->app->get_component( 'site-editor' ),
			'add_menu_in_admin_bar',
		] );
	}

	public function test_it_should_returns_a_valid_config() {
		$active_document = $this->create_document();
		$document = $this->create_document();

		query_posts( [ 'p' => $active_document->get_id() ] );

		$frontend = Plugin::$instance->frontend;

		$frontend->get_builder_content( $active_document->get_id() );
		$frontend->get_builder_content( $document->get_id() );

		$config = $this->module->get_settings();

		$this->assertTrue( isset( $config['elementor_edit_page'] ) );

		$editButtonConfig = $config['elementor_edit_page'];

		$this->assertEquals( $active_document->get_edit_url(), $editButtonConfig['href'] );

		$this->assertCount( 1, $editButtonConfig['children'] );
		$this->assertEquals( "elementor_edit_doc_{$document->get_id()}", $editButtonConfig['children'][ $document->get_id() ]['id'] );
	}

	public function test_it_should_not_add_document_that_is_excerpt() {
		$frontend = Plugin::$instance->frontend;

		$excerpt_document = $this->create_document();

		// Emulate an excerpt on frontend.
		$frontend->start_excerpt_flag( $excerpt_document->get_id() );
		$frontend->get_builder_content( $excerpt_document->get_id() );
		$frontend->end_excerpt_flag( $excerpt_document->get_id() );

		$config = $this->module->get_settings();

		$this->assertEmpty( $config );
	}

	public function test_it_should_not_add_document_that_the_settings_show_on_admin_bar_is_false(  ) {
		$frontend = Plugin::$instance->frontend;

		$not_supported_document = $this->create_document( [
			'meta_input' => [
				// The prop 'show_on_admin_bar' of NotSupport document type is false.
				'_elementor_template_type' => 'not-supported'
			],
		] );

		$frontend->get_builder_content( $not_supported_document->get_id() );

		$config = $this->module->get_settings();

		$this->assertEmpty( $config );
	}

	public function test_it_should_not_add_document_if_the_user_cant_edit_the_document() {
		wp_set_current_user( self::factory()->get_subscriber_user()->ID );

		$document = $this->create_document();

		$frontend = Plugin::$instance->frontend;

		$frontend->get_builder_content( $document->get_id() );

		$config = $this->module->get_settings();

		$this->assertEmpty( $config );
	}

	private function create_document( $args = [] ) {
		return Plugin::$instance->documents->get(
			$this->factory()->create_and_get_custom_post(
				array_merge_recursive( $this->fake_document_data, $args )
			)->ID
		);
	}
}
