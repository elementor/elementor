<?php

namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\TemplateLibrary\Manager;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Manager_General extends Elementor_Test_Base {
	/**
	 * @var Manager
	 */
	protected static $manager;

	public static function setUpBeforeClass() {
		self::$manager = \Elementor\Plugin::instance()->templates_manager;
	}

	public function test_should_return_import_images_instance() {
		$this->assertEquals( self::$manager->get_import_images_instance(), new \Elementor\TemplateLibrary\Classes\Import_Images() );
	}

	public function test_should_return_wp_error_source_class_name_not_exists_from_register_source() {
		$this->assertWPError( self::$manager->register_source( 'pop' ), 'source_class_name_not_exists' );
	}

	public function test_should_return_wp_error_wrong_instance_source_from_register_source() {
		$this->assertWPError( self::$manager->register_source( 'Elementor\Core\Ajax_Manager' ), 'wrong_instance_source' );
	}


	public function test_should_return_false_from_unregister_source() {
		$this->assertFalse( self::$manager->unregister_source( 0 ) );
	}

	public function test_should_fail_to_return_source() {
		$this->assertFalse( self::$manager->get_source( 'pop' ) );
	}

	public function mockGetTemplate() {
		$templates_array = [];
		$source_array['local'] = new \Elementor\TemplateLibrary\Source_Local();
		$source_array['remote'] = new \Elementor\TemplateLibrary\Source_Remote();
		foreach ( $source_array as $source ) {
			$templates_array = array_merge( $templates_array, $source->get_items() );
		}

		return $templates_array;
	}

	public function test_should_return_templates() {
		//run & check.
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Remote' );
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Local' );
		$this->assertEquals( self::$manager->get_templates(), $this->mockGetTemplate() );
	}

	public function test_should_return_library_data() {
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Remote' );
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Local' );

		$ret = self::$manager->get_library_data( [] );

		$this->assertNotEmpty( $ret['templates'] );
	}

	public function test_should_return_library_data_send_this_parameters() {
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Remote' );
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Local' );

		$ret = self::$manager->get_library_data( [ 'sync' => true ] );

		$this->assertNotEmpty( $ret['templates'] );
	}

	public function test_should_return_wp_error_arguments_not_specified_from_save_template() {
		$this->assertWPError(
			self::$manager->save_template( [ 'post_id' => '123' ] ), 'arguments_not_specified'
		);
	}

	public function test_should_return_wp_error_template_error_from_save_template() {
		$this->assertWPError(
			self::$manager->save_template(
				[
					'post_id' => '123',
					'source' => 'banana',
					'content' => 'banana',
					'type' => 'page',
				]
			),
			'template_error'
		);
	}


	public function test_should_return_wp_error_arguments_not_specified_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template( [ 'post_id' => '123' ] ), 'arguments_not_specified'
		);
	}


	public function test_should_return_wp_error_template_error_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'banana',
					'content' => 'banana',
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
					'source' => 'apple',
					'content' => 'banana',
					'type' => 'comment',
					'id' => 1,
				],
				[
					'source' => 'banana',
					'content' => 'banana',
					'type' => 'comment',
					'id' => 1,
				],
			],
		];
		$this->assertWPError( self::$manager->update_templates( $templates ) );
	}

	public function test_should_return_true_from_update_templates() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
		$templates = [
			'templates' => [
				[
					'source' => 'remote',
					'content' => 'banana',
					'type' => 'comment',
					'id' => 1,
				],
				[
					'source' => 'local',
					'content' => 'banana',
					'type' => 'comment',
					'id' => $this->factory()->post->create( [] ),
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
					'source' => 'banana',
					'template_id' => '777',
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
					'source' => 'banana',
					'template_id' => '777',
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
					'source' => 'banana',
					'template_id' => '777',
				]
			), 'template_error'
		);
	}

	/*    public function () {

		}*/


	/*	public function test_should_fail_to_mark_template_as_favorite() {
			$this->assertTrue( is_wp_error( self::$manager->mark_template_as_favorite( [ 'source' => 'remote' ] ) ) );
		}*/

}
