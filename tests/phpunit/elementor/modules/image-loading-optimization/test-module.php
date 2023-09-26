<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Image_Loading_Optimization;

use Elementor\Modules\PageTemplates\Module as PageTemplatesModule;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * Unit tests for the Image Loading Optimization module
 *
 * @group modules
 * @group image-loading-optimization
 */
class Elementor_Image_Loading_Optimization_Test_Module extends Elementor_Test_Base {
	/**
	 * An array of attachments.
	 *
	 * @type int[]
	 */
	static $attachments = [];

	/**
	 * Setup shared attachments.
	 */
	public static function set_up_before_class() {
		parent::set_up_before_class();

		self::$attachments[] = self::factory()->attachment->create_upload_object(
			ELEMENTOR_PATH . '/tests/phpunit/resources/mock-image.png'
		);
	}

	/**
	 * Clean up uploaded files when finished.
	 */
	public static function tear_down_after_class() {
		array_map(
			function ( $attachment_id ) {
				wp_delete_attachment( $attachment_id, true );
			},
			self::$attachments
		);

		parent::tear_down_after_class();
	}

	public function setUp() {
		parent::setUp();

		set_current_screen( 'front' );
	}

	/**
	 * Test fixtures are working as expected.
	 */
	public function test_attachment_fixtures() {
		$image = wp_get_attachment_image( self::$attachments[0], 'full' );

		$this->assertRegExp( '/mock-image.png/', $image, 'Could not confirm attachments were created' );
	}

	/**
	 * @dataProvider get_page_template
	 */
	public function test_loading_optimization_without_logo( $page_template ) {
		$document = self::factory()->create_post();
		$content = '<img width="800" height="530" src="featured_image.jpg" /><img width="640" height="471" src="image_1.jpg" /><img width="800" height="800" src="image_2.jpg" /><img width="566" height="541" src="image_3.jpg" /><img width="691" height="1024" src="image_4.jpg" />';

		// Update the post content.
		$updated_post = array( 'ID' => $document->get_main_id(), 'post_content' => $content );
		wp_update_post( $updated_post );
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );
		$document->update_main_meta( '_wp_page_template', $page_template );

		query_posts( [ 'p' => $document->get_main_id() ] );

		// Need to do the_post as `template_include` depends on `wp_query` for the post.
		the_post();

		// get template path from post. If it's not set switch to default single page template.
		$template_path = locate_template('single.php');
		$template_path = $page_templates_module->template_include( $template_path );

		// Template usually contains a loop so need to rewind it.
		rewind_posts();

		ob_start();
		load_template($template_path);
		/* php endscript works differently for phpunit.
		 * This is to ensure buffer started in footer is closed.
		 */
		$this->close_and_print_open_buffer();
		$output = ob_get_clean();

		$expected = '<p><img fetchpriority="high" decoding="async" width="800" height="530" src="featured_image.jpg" /><img decoding="async" width="640" height="471" src="image_1.jpg" /><img decoding="async" width="800" height="800" src="image_2.jpg" /><img loading="lazy" decoding="async" width="566" height="541" src="image_3.jpg" /><img loading="lazy" decoding="async" width="691" height="1024" src="image_4.jpg" /></p>';
		$this->assertStringContainsString( $expected, $output, "Loading optimization not applied to the content");
	}

	public function get_page_template() {
		return [
			[ PageTemplatesModule::TEMPLATE_CANVAS ],
			[ PageTemplatesModule::TEMPLATE_HEADER_FOOTER ],
			[ PageTemplatesModule::TEMPLATE_THEME ]
		];
	}

	/**
	 * This is to ensure buffer started in footer is closed.
	 */
	private function close_and_print_open_buffer() {
		$buffer_status = ob_get_status();

		if ( ! empty( $buffer_status ) && str_contains( $buffer_status['name'], 'ImageLoadingOptimization\Module::handle_buffer_content') ) {
			echo ob_get_clean();
		}
	}
}


