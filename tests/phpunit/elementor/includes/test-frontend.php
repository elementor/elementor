<?php
namespace Elementor\Testing\Includes;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Plugin;
use Elementor\Frontend;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Frontend extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		global $wp_scripts, $wp_styles;

		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $wp_scripts, $wp_styles;

		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();
	}

	public function test_get_builder_content__should_switch_back_to_to_the_last_document() {
		$main_document = $this->factory()->documents->create_and_get();
		$sub_document = $this->factory()->documents->create_and_get();

		Plugin::$instance->documents->switch_to_document( $main_document );

		Plugin::$instance->frontend->get_builder_content( $sub_document->get_id() );

		$this->assertEquals( $main_document->get_id(), Plugin::$instance->documents->get_current()->get_id() );

	}

	public function test_get_builder_content__should_switch_back_to_the_last_document_for_empty_document() {
		$main_document = $this->factory()->documents->create_and_get();
		$sub_document = $this->factory()->documents->create_and_get( [ 'meta_input' => [ '_elementor_data' => null ] ] );

		Plugin::$instance->documents->switch_to_document( $main_document );

		Plugin::$instance->frontend->get_builder_content( $sub_document->get_id() );

		$this->assertEquals( $main_document->get_id(), Plugin::$instance->documents->get_current()->get_id() );
	}

	public function test_body_classes() {
		// Arrange
		$document = $this->factory()->documents->publish_and_get();

		query_posts( [
			'p' => $document->get_id(),
		] );
		the_post();

		$frontend = new Frontend();

		// Act
		$result = $frontend->body_class( [] );

		// Assert
		$this->assertTrue( in_array( 'elementor-default', $result, true ) );
		$this->assertTrue( in_array( 'elementor-page elementor-page-' . $document->get_id() , $result, true ) );
	}

	public function test_body_classes__when_the_post_is_not_edit_with_elementor() {
		// Arrange
		$post = $this->factory()->post->create_and_get();

		query_posts( [
			'p' => $post->ID,
		] );
		the_post();

		$frontend = new Frontend();

		// Act
		$result = $frontend->body_class( [] );

		// Assert
		$this->assertTrue( in_array( 'elementor-default', $result, true ) );
		$this->assertFalse( in_array( 'elementor-page elementor-page-' . $post->ID , $result, true ) );
	}

	public function test_get_list_of_google_fonts_by_type() {
		// Arrange
		$frontend = new Frontend();

		$frontend->fonts_to_enqueue = [ 'Roboto', 'Open Sans', 'Open Sans Hebrew' ];

		// Act
		$google_fonts = $frontend->get_list_of_google_fonts_by_type();

		// Assert
		$this->assertEquals( [ 'Roboto', 'Open Sans' ], $google_fonts['google'] );

		$this->assertEquals( [ 'Open Sans Hebrew' ], $google_fonts['early'] );
	}

	public function test_get_stable_google_fonts_url() {
		// Arrange
		$frontend = new Frontend();

		$mock_google_fonts = [ 'Roboto', 'Open Sans' ];

		// Act
		$fonts_url = $frontend->get_stable_google_fonts_url( $mock_google_fonts );

		$font_display_url_str = '&display=' . get_option( 'elementor_font_display', 'auto' );

		$font_strings = [
			'Roboto:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic',
			'Open+Sans:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic',
		];

		// Assert
		$this->assertEquals( 'https://fonts.googleapis.com/css?family=' . implode( rawurlencode( '|' ), $font_strings ) . $font_display_url_str, $fonts_url );
	}

	public function test_get_early_access_google_font_urls() {
		// Arrange
		$frontend = new Frontend();

		$mock_google_fonts = [ 'Open Sans Hebrew' ];

		// Act
		$font_urls = $frontend->get_early_access_google_font_urls( $mock_google_fonts );

		// Assert
		$this->assertContains( 'https://fonts.googleapis.com/earlyaccess/opensanshebrew.css', $font_urls );
	}

	public function test_widget_with_global_scripts() {
		// Arrange
		$frontend = new Frontend();
		$frontend->register_scripts();

		$widget_with_global_scripts = $this->elementor()->widgets_manager->get_widget_types( 'text-editor' );

		// Act
		$widget_with_global_scripts->enqueue_scripts();

		// Assert
		$this->assertTrue( wp_script_is( 'elementor-frontend' ) );
		$this->assertTrue( wp_script_is( 'elementor-frontend-modules' ) );
		$this->assertTrue( wp_script_is( 'jquery' ) );
	}

	public function test_widget_without_global_scripts() {
		// Arrange
		$frontend = new Frontend();
		$frontend->register_scripts();

		// Act
		$widget_without_global_scripts = $this->elementor()->widgets_manager->get_widget_types( Atomic_Heading::get_element_type() );
		$widget_without_global_scripts->enqueue_scripts();

		// Assert
		$this->assertFalse( wp_script_is( 'elementor-frontend' ) );
		$this->assertFalse( wp_script_is( 'elementor-frontend-modules' ) );
		$this->assertFalse( wp_script_is( 'jquery' ) );
	}
}
