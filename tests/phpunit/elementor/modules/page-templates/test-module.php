<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Page_Templates;

use Elementor\Core\Base\Document;
use Elementor\Modules\PageTemplates\Module as PageTemplatesModule;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Module extends Elementor_Test_Base {

	public function test_template_include() {
		// Arrange.
		/** @var PageTemplatesModule $page_templates_module */
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );

		/** @var Document $document */
		$document = self::factory()->create_post();
		$document->update_main_meta( '_wp_page_template', $page_templates_module::TEMPLATE_CANVAS );

		// Simulate a singular query.
		query_posts( [
			'p' => $document->get_main_id(),
		] );

		the_post();

		// Act.
		$filtered_template = $page_templates_module->template_include( 'default' );

		// Assert.
		$this->assertEquals(
			$page_templates_module->get_template_path( $page_templates_module::TEMPLATE_CANVAS ),
			$filtered_template,
			'it should return a canvas template based on post meta.'
		);
	}

	public function test_template_include_kit_default_template() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		// Arrange.
		/** @var PageTemplatesModule $page_templates_module */
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->update_settings( [
			'default_page_template' => $page_templates_module::TEMPLATE_CANVAS,
		] );

		// Refresh kit cache.
		Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		/** @var Document $document */
		$document = self::factory()->create_post();

		// Simulate a singular query.
		query_posts( [
			'p' => $document->get_main_id(),
		] );

		the_post();

		// Act.
		$filtered_template = $page_templates_module->template_include( 'default' );

		// Assert.
		$this->assertEquals(
			$page_templates_module->get_template_path( $page_templates_module::TEMPLATE_CANVAS ),
			$filtered_template,
			'it should return a canvas template based on kit default template.'
		);
	}

	public function test_template_include_not_supported_document() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		// Arrange.
		/** @var PageTemplatesModule $page_templates_module */
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->update_settings( [
			'default_page_template' => $page_templates_module::TEMPLATE_CANVAS,
		] );

		// Refresh kit cache.
		Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		/** @var Document $document */
		$document = self::factory()->create_post();

		// Convert the document to the not supported document. (modules/library/documents/not-supported.php)
		$document->update_main_meta( Document::TYPE_META_KEY, 'not-supported' );

		// Refresh document cache.
		Plugin::$instance->documents->get( $document->get_main_id(), false );

		// Simulate a singular query.
		query_posts( [
			'p' => $document->get_main_id(),
		] );

		the_post();

		// Act.
		$filtered_template = $page_templates_module->template_include( 'default' );

		// Assert.
		$this->assertEquals(
			'default',
			$filtered_template,
			'it should return a default template because the document is not support page templates'
		);
	}

	public function test_template_include__theme_option_should_return_default() {
		// Arrange.
		/** @var PageTemplatesModule $page_templates_module */
		$page_templates_module = Plugin::$instance->modules_manager->get_modules( 'page-templates' );

		/** @var Document $document */
		$document = self::factory()->create_post();
		$document->update_main_meta( '_wp_page_template', $page_templates_module::TEMPLATE_THEME );

		// Simulate a singular query.
		query_posts( [
			'p' => $document->get_main_id(),
		] );

		the_post();

		// Act.
		$filtered_template = $page_templates_module->template_include( 'default' );

		// Assert.
		$this->assertEquals(
			'default',
			$filtered_template,
			'it should return a default template based on post meta (theme).'
		);
	}
}
