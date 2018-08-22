<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Testing\Elementor_Test_Base;

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

	public function test_should_return_true_from_unregister_source() {
		$this->assertTrue( self::$manager->unregister_source( 'remote' ) );
	}

	public function test_should_return_true_from_register_source() {
		$this->assertTrue( self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Remote' ) );
	}

	public function test_should_return_registered_sources() {
		$this->assertEquals( self::$manager->get_registered_sources()['remote'], new \Elementor\TemplateLibrary\Source_Remote() );
	}

	public function test_should_return_source() {
		$this->assertEquals( self::$manager->get_source( 'remote' ), new \Elementor\TemplateLibrary\Source_Remote() );
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

	public function test_should_return_data_from_get_template_data() {
		$template = self::$manager->get_templates()[0];
		$_POST['editor_post_id'] = $this->factory()->create_and_get_default_post()->ID;

		$ret = self::$manager->get_template_data(
			[
				'source' => 'remote',
				'template_id' => $template['template_id'],
			]
		);
		$this->assertArrayHaveKeys( [ 'content', 'page_settings' ], $ret );
		$this->assertArrayHaveKeys(
			[
				'id',
				'elType',
				'settings',
				'elements',
				'isInner',
			], $ret['content'][0]
		);
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
