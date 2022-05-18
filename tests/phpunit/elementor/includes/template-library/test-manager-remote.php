<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Manager_Remote extends Elementor_Test_Base {

	/**
	 * @var \Elementor\TemplateLibrary\Manager
	 */
	protected static $manager;
	private $fake_template_id = '777';


	public static function setUpBeforeClass() {
		self::$manager = self::elementor()->templates_manager;
	}

	public function test_should_mark_template_as_favorite() {
		$this->assertFalse(
			self::$manager->mark_template_as_favorite(
				[
					'source' => 'remote',
					'template_id' => $this->fake_template_id,
					'favorite' => 'false',
				]
			)
		);
	}

	public function test_should_return_source() {
		$this->assertInstanceOf( '\Elementor\TemplateLibrary\Source_Remote', self::$manager->get_source( 'remote' ) );
	}

	public function test_should_return_wp_error_from_save_template() {
		$template_data = [
			'post_id' => $this->fake_template_id,
			'source' => 'remote',
			'content' => 'content',
			'type' => 'page',
		];

		$this->assertWPError( self::$manager->save_template( $template_data ), 'cannot save template from remote source' );
	}

	public function test_should_return_wp_error_from_update_template() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
		$template_data = [
			'source' => 'remote',
			'content' => 'content',
			'type' => 'comment',
			'id' => $this->fake_template_id,
		];

		$this->assertWPError( self::$manager->update_template( $template_data ), 'cannot update template from remote source' );
	}

	public function test_should_return_wp_error_from_delete_template() {
		$this->assertWPError(
			self::$manager->delete_template(
				[
					'source' => 'remote',
					'template_id' => $this->fake_template_id,
				]
			), 'cannot delete template from remote source'
		);

	}
}
