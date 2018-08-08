<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\TemplateLibrary\Manager;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Manager_General extends Elementor_Test_Base {
	/**
	 * @var Manager
	 */
	protected static $manager;
	private $fake_post_id = '123';

	public static function setUpBeforeClass() {
		self::$manager = \Elementor\Plugin::instance()->templates_manager;
	}

	public function test_should_return_import_images_instance() {
		$this->assertEquals( self::$manager->get_import_images_instance(), new \Elementor\TemplateLibrary\Classes\Import_Images() );
	}

	public function test_should_return_wp_error_source_class_name_not_exists_from_register_source() {
		$this->assertWPError( self::$manager->register_source( 'invalid class' ), 'source_class_name_not_exists' );
	}


	public function test_should_return_wp_error_wrong_instance_source_from_register_source() {
		$this->assertWPError( self::$manager->register_source( 'Elementor\Core\Ajax_Manager' ), 'wrong_instance_source' );
	}

	public function test_should_return_false_from_unregister_source() {
		$this->assertFalse( self::$manager->unregister_source( 0 ) );
	}

	public function test_should_fail_to_return_source() {
		$this->assertFalse( self::$manager->get_source( 'invalid source' ) );
	}

	public function test_should_return_templates() {
		$templates = self::$manager->get_templates();
		$this->assertGreaterThan( 0, count( $templates ) );
		$template_structure = [
			'template_id',
			'source',
			'type',
			'title',
			'thumbnail',
			'hasPageSettings',
			'tags',
			'url',
		];

		$this->assertArrayHaveKeys( $template_structure, $templates[0] );
	}

	public function test_should_return_library_data() {
		$ret = self::$manager->get_library_data( [] );

		$this->assertNotEmpty( $ret['templates'] );
	}

	public function test_should_return_wp_error_arguments_not_specified_from_save_template() {
		$this->assertWPError(
			self::$manager->save_template( [ 'post_id' => $this->fake_post_id ] ), 'arguments_not_specified'
		);
	}

	public function test_should_return_wp_error_template_error_from_save_template() {
		$this->assertWPError(
			self::$manager->save_template(
				[
					'post_id' => $this->fake_post_id,
					'source' => 'invalid source',
					'content' => 'content',
					'type' => 'page',
				]
			),
			'template_error'
		);
	}


	public function test_should_return_wp_error_arguments_not_specified_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template( [ 'post_id' => $this->fake_post_id ] ), 'arguments_not_specified'
		);
	}


	public function test_should_return_wp_error_template_error_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'invalid source',
					'content' => 'content',
					'type' => 'page',
				]
			),
			'template_error'
		);
	}

	public function test_should_return_wp_error_update_templates() {
		$templates = [
			'templates' => [
				[
					'source' => 'invalid content 1 ',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->fake_post_id,
				],
				[
					'source' => 'invalid content 2',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->fake_post_id,
				],
			],
		];

		$this->assertWPError( self::$manager->update_templates( $templates ) );
	}

	public function test_should_return_true_from_update_templates() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$templates = [
			'templates' => [
				[
					'source' => 'local',
					'content' => 'content',
					'type' => 'page',
					'id' => $this->factory()->create_and_get_default_post()->ID,
				],
				[
					'source' => 'local',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->factory()->create_and_get_default_post()->ID,
				],
			],
		];

		$this->assertTrue( self::$manager->update_templates( $templates ) );
	}


	public function test_should_return_wp_error_massage_arguments_not_specified_from_get_template_data() {
		$this->assertWPError( self::$manager->get_template_data( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_massage_template_error_from_get_template_data() {
		$this->assertWPError(
			self::$manager->get_template_data(
				[
					'source' => 'invalid source',
					'template_id' => $this->fake_post_id,
					'edit_mode' => true,
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_arguments_not_specified_from_delete_template() {
		$this->assertWPError( self::$manager->delete_template( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_template_error_from_delete_template() {
		$this->assertWPError(
			self::$manager->delete_template(
				[
					'source' => 'invalid source',
					'template_id' => $this->fake_post_id,
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_arguments_not_specified_from_export_template() {
		$this->assertWPError( self::$manager->export_template( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_template_error_from_export_template() {
		$this->assertWPError(
			self::$manager->export_template(
				[
					'source' => 'invalid source',
					'template_id' => $this->fake_post_id,
				]
			), 'template_error'
		);
	}
}
