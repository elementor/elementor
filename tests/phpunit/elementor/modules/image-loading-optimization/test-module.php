<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Image_Loading_Optimization;

use Elementor\Core\Base\Document;
use Elementor\Modules\PageTemplates\Module as PageTemplatesModule;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Image_Loading_Optimization_Test_Module extends Elementor_Test_Base {
	public function test_loading_optimization_single_page() {
		// Arrange.
		/** @var PageTemplatesModule $page_templates_module */
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );
		$image_loading_optimization_module = Plugin::$instance->modules_manager->get_modules( 'image-loading-optimization' );

		/** @var Document $document */
		$document = self::factory()->create_post();
		$document->update_main_meta( '_wp_page_template', $page_templates_module::TEMPLATE_CANVAS );

		$content = '<img width="800" height="530" src="featured_image.jpg" /><img width="640" height="471" src="image_1.jpg" /><img width="800" height="800" src="image_2.jpg" /><img width="566" height="541" src="image_3.jpg" /><img width="691" height="1024" src="image_4.jpg" />';

		// Update the post
		$updated_post = array(
			'ID'           => $document->get_main_id(),
			'post_content' => $content,
		);

		// Update the post into the database
		wp_update_post( $updated_post );
		
		// Simulate a singular query.
		query_posts( [ 'p' => $document->get_main_id() ] );
		ob_start();
		$page_templates_module->print_content();
		$output = ob_get_clean();
		$expected = '<p><img fetchpriority="high" decoding="async" width="800" height="530" src="featured_image.jpg" /><img decoding="async" width="640" height="471" src="image_1.jpg" /><img decoding="async" width="800" height="800" src="image_2.jpg" /><img loading="lazy" decoding="async" width="566" height="541" src="image_3.jpg" /><img loading="lazy" decoding="async" width="691" height="1024" src="image_4.jpg" /></p>';
		$this->assertStringContainsString( $expected, $output, "Loading Optimization not applied");
	}
}
