<?php /** @noinspection PhpParamsInspection */

namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Testing\Elementor_Test_Base;

require_once 'test-manager-general.php';

class Elementor_Test_Manager_Remote extends Elementor_Test_Base {

	/**
	 * @var \Elementor\TemplateLibrary\Manager
	 */
	protected static $manager;

	public static function setUpBeforeClass() {
		self::$manager = \Elementor\Plugin::instance()->templates_manager;
	}

	public function test_should_mark_template_as_favorite() {
		$this->assertFalse(
			self::$manager->mark_template_as_favorite(
				[
					'source' => 'remote',
					'template_id' => '777',
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

	public function test_should_return_template_data_from_save_template() {
		$template_data = [
			'post_id' => '777',
			'source' => 'remote',
			'content' => 'banana',
			'type' => 'page',
		];

		$this->assertWPError( self::$manager->save_template( $template_data ), 'cannot save template from remote source' );
	}

	public function test_should_return_remote_template_data_from_update_template() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
		$template_data = [
			'source' => 'remote',
			'content' => 'banana',
			'type' => 'comment',
			'id' => 1,
		];

		$this->assertWPError( self::$manager->update_template( $template_data ), 'cannot update template from remote source' );
	}

	public function test_should_return_data_from_get_template_data() {
		$ret = self::$manager->get_template_data(
			[
				'source' => 'local',
				'template_id' => '777',
			]
		);

		$this->assertEquals( $ret, [ 'content' => [] ] );
	}

	public function test_should_delete_template() {

		$this->assertWPError(
			self::$manager->delete_template(
				[
					'source' => 'remote',
					'template_id' => '777',
				]
			), 'cannot delete template from remote source'
		);

	}
}
