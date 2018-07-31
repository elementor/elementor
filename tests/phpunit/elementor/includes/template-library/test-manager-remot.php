<?php /** @noinspection PhpParamsInspection */

namespace Elementor\Testing\Includes\TemplateLibrary;

require_once 'test-manager-general.php';

class Elementor_Test_Manager_Remote extends Elementor_Test_Manager_General {

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

	public function test_should_return_true_from_register_source() {
		$this->assertTrue( self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Remote' ) );
	}

	public function test_should_return_true_from_unregister_source() {
		$this->assertTrue( self::$manager->unregister_source( 'remote' ) );
	}

	public function test_should_return_registered_sources() {
		self::$manager->register_source( 'Elementor\TemplateLibrary\Source_Remote' );
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

		$remote_remote = [
			'template_id' => '5525',
			'source' => 'remote',
			'type' => 'block',
			'subtype' => 'about',
			'title' => 'About 14',
			'thumbnail' => 'https://library.elementor.com/wp-content/uploads/2018/03/about_white_10.png',
			'date' => '1520443532',
			'author' => 'Elementor',
			'tags' => [ 'About' ],
			'isPro' => false,
			'popularityIndex' => 29,
			'hasPageSettings' => false,
			'url' => 'https://library.elementor.com/blocks/about-14/?utm_source=library&utm_medium=wp-dash&utm_campaign=preview',
			'favorite' => false,
		];
		$this->assertArraySubset( $remote_remote, self::$manager->save_template( $template_data ) );
	}

	public function test_should_return_remote_template_data_from_update_template() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
		$template_data = [
			'source' => 'remote',
			'content' => 'banana',
			'type' => 'comment',
			'id' => 1,
		];

		$remote_remote = [
			'template_id' => 5533,
			'source' => 'remote',
			'type' => 'block',
			'subtype' => 'about',
			'title' => 'About 15',
			'thumbnail' => 'https://library.elementor.com/wp-content/uploads/2018/03/about_black_10.png',
			'author' => 'Elementor',
			'tags' => [ 'About' ],
			'isPro' => false,
			'hasPageSettings' => false,
			'url' => 'https://library.elementor.com/blocks/about-15/?utm_source=library&utm_medium=wp-dash&utm_campaign=preview',
			'favorite' => false,
		];
		$this->assertArraySubset( $remote_remote, self::$manager->update_template( $template_data ) );
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
		$this->assertFalse(
			self::$manager->delete_template(
				[
					'source' => 'remote',
					'template_id' => '777',
				]
			)
		);
	}
}
