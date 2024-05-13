<?php
namespace Elementor\Testing\Modules\LandingPages;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\LandingPages\Module;
use ElementorEditorTesting\Traits\Elementor_Library;

class Elementor_Test_Landing_Pages_Module extends Elementor_Test_Base {

	use Elementor_Library;

	public function test__construct() {
		$this->assert_document_type_registered( Module::DOCUMENT_TYPE );
	}

	public function test_get_name() {
		$this->assertEquals( 'landing-pages', Plugin::$instance->modules_manager->get_modules( 'landing-pages' )->get_name() );
	}

	public function test_register_admin_menu__renders_empty_view() {
		// Arrange
		$this->act_as_admin();

		// Act.
		$output = $this->render_landing_pages_admin_menu();

		// Assert.
		$this->assertStringContainsString( 'Create Your First Landing Page', $output );
	}

	public function test_register_admin_menu__renders_edit_view() {
		// Arrange
		$this->act_as_admin();

		remove_all_actions( 'admin_page_edit?post_type=e-landing-page' );
		remove_all_actions( 'admin_page_e-landing-page' );
		remove_all_actions( 'admin_menu' );

		$this->create_landing_page();

		$module = new Module();

		// Act.
		$output = $this->render_landing_pages_admin_menu();

		// Assert.
		$this->assertEmpty( $output );
	}

	private function render_landing_pages_admin_menu() {
		do_action( 'admin_menu' );

		ob_start();

		// Need to dispatch both hooks since the promotion & edit pages uses different IDs.
		do_action( 'admin_page_edit?post_type=e-landing-page' );
		do_action( 'admin_page_e-landing-page' );

		return ob_get_clean();
	}

	private function create_landing_page() {
		$id = $this->factory()->documents->create_object( [
			'post_type' => Module::CPT,
			'post_status' => 'publish',
		] );

		update_post_meta(
			$id,
			Document::TYPE_META_KEY,
			Module::DOCUMENT_TYPE
		);
	}
}
