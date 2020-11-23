<?php
namespace Elementor\Testing\Includes;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Test_Local extends Elementor_Test_Base {
	/**
	 * @var \Elementor\TemplateLibrary\Source_Local
	 */
	private $source;

	public function setUp() {
		parent::setUp();

		$this->source = Plugin::$instance->templates_manager->get_source( 'local' );
	}

	public function test_maybe_render_blank_state() {
		// Arrange - fake globals.
		global $post_type, $wp_list_table;

		$wp_list_table = _get_list_table( 'WP_Posts_List_Table' , array( 'screen' => 'edit-page' ) );
		$post_type = 'post';

		// Act.
		ob_start();
		$this->source->maybe_render_blank_state( 'bottom', [
			'cpt' => $post_type,
			'post_type' => $post_type,
		] );
		$output = ob_get_clean();

		// Assert
		$this->assertContains( 'elementor-template-library-add-new', $output );

		// Clean - globals.
		$post_type = null;
		$wp_list_table = null;
	}
}
