<?php /** @noinspection PhpParamsInspection */
namespace Elementor\Testing\Includes\TemplateLibrary;

use \Elementor\TemplateLibrary\Manager;
use Elementor\Testing\Elementor_Test_Base;

require_once 'test-manager-general.php';

class Elementor_Test_Manager_Local extends Elementor_Test_Base {

	/**
	 * @var Manager
	 */
	protected static $manager;

	public static function setUpBeforeClass() {
		self::$manager = \Elementor\Plugin::instance()->templates_manager;
	}

	public function setUp() {
		parent::setUp();
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
	}

	public function test_should_return_true_from_unregister_source() {
		$this->assertTrue( self::$manager->unregister_source( 'local' ) );
	}

	public function test_should_return_true_from_register_source() {
		$this->assertTrue( self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Local' ) );
	}

	public function test_should_return_registered_sources() {
		$this->assertEquals( self::$manager->get_registered_sources()['local'], new \Elementor\TemplateLibrary\Source_Local() );
	}

	public function test_should_return_source() {
		$this->assertEquals( self::$manager->get_source( 'local' ), new \Elementor\TemplateLibrary\Source_Local() );
	}

	public function test_should_return_wp_error_save_error_from_save_template() {
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );
		$this->assertWPError(
			self::$manager->save_template(
				[
					'post_id' => '123',
					'source' => 'local',
					'content' => 'banana',
					'type' => 'comment',
				]
			), 'save_error'
		);
	}

	public function test_should_return_template_data_from_save_template() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$template_data = [
			'post_id' => $this->factory()->get_default_post()->ID,
			'source' => 'local',
			'content' => 'banana',
			'type' => 'page',
		];

		$remote_remote = [
			'template_id',
			'source',
			'type',
			'title',
			'thumbnail',
			'hasPageSettings',
			'tags',
			'url',
		];
		$res = self::$manager->save_template( $template_data );
		$this->assertArrayHaveKeys( $remote_remote, $res );
		//$this->assertArraySubset( $remote_remote,  );
	}


	public function test_should_return_wp_error_arguments_not_specified_from_update_template() {
		$this->assertWPError( self::$manager->update_template( [ 'post_id' => '123' ] ), 'arguments_not_specified' );
	}


	public function test_should_return_wp_error_template_error_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'banana',
					'content' => 'banana',
					'type' => 'page',
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_save_error_from_update_template() {
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'local',
					'content' => 'banana',
					'type' => 'comment',
					'id' => '777',
				]
			), 'save_error'
		);
	}

	/**
	 *
	 */
	public function test_should_return_template_data_from_update_template() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$template_data = [
			'source' => 'local',
			'content' => 'banana',
			'type' => 'post',
			'id' => $post_id,
		];

		$remote_remote = [
			'template_id',
			'source',
			'type',
			'title',
			'thumbnail',
			'author',
			'hasPageSettings',
			'tags',
			'url',
		];
		$res = self::$manager->update_template( $template_data );
		$this->assertArrayHaveKeys( $remote_remote, $res );
	}

	/**
	 * @covers \Elementor\TemplateLibrary\Manager::get_template_data()
	 */
	public function test_should_return_data_from_get_template_data() {
		$ret = self::$manager->get_template_data(
			[
				'source' => 'local',
				'template_id' => '8',
			]
		);

		$this->assertEquals( $ret, [ 'content' => [] ] );
	}

	/**
	 * @covers Manager::export_template
	 */
	public function test_should_export_template() {
		$this->markTestSkipped();
		$ret = self::$manager->export_template(
			[
				'source' => 'local',
				'template_id' => \Elementor\Testing\Manager::$instance->get_local_factory()->get_local_template_id(),
			]
		);
		$this->assertSame( $ret, '' );
	}

	/**
	 * @requires PHP 5.3
	 * @covers Manager::delete_template
	 */
	public function test_should_delete_template() {
		$this->markTestSkipped();
		$template_id = \Elementor\Testing\Manager::$instance->get_local_factory()->get_local_template_id();
		$template = get_post( $template_id );

		$ret = self::$manager->delete_template(
			[
				'source' => 'local',
				'template_id' => $template_id,
			]
		);

		$this->assertEquals( $ret, $template );
	}

	/**
	 * @requires PHP 5.3
	 * @covers Manager::import_template
	 */
	public function test_should_import_template() {
		$this->markTestSkipped();
		$_FILES = [
			'file' => [
				'name' => 'no-title',
				'tmp_name' => 'http://example.org/?elementor_library=no-title',
			],
		];
		var_dump( self::$manager->import_template() );
	}

	/*    public function () {

		}*/


	/*	public function test_should_fail_to_mark_template_as_favorite() {
			$this->assertTrue( is_wp_error( self::$manager->mark_template_as_favorite( [ 'source' => 'remote' ] ) ) );
		}*/

}
