<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\App\KitLibrary\Data\Kits;

use Elementor\Plugin;
use Elementor\Testing\Traits\Rest_Trait;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\Library\User_Favorites;
use Elementor\Core\Common\Modules\Connect\Module;
use Elementor\Core\App\Modules\KitLibrary\Connect\Kit_Library;
use Elementor\Core\App\Modules\KitLibrary\Data\Kits\Controller;

class Test_Controller extends Elementor_Test_Base {
	use Rest_Trait {
		setUp as traitSetUP;
	}

	/**
	 * @var Kit_Library
	 */
	private $app_mock;

	public function setUp(  ) {
		$this->traitSetUP();

		$this->app_mock = $this->getMockBuilder( Kit_Library::class )
			->setMethods( [ 'get_all' ] )
			->getMock();

		$module_mock = $this->getMockBuilder( Module::class )
			->setMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );
	}

	public function test_get_items() {
		// Arrange
		$user = $this->act_as_admin();
		$this->app_mock->method( 'get_all' )->willReturn( $this->get_kits_api_mock() );

		$favorites = new User_Favorites( $user->ID );
		$favorites->add( 'elementor', 'kits', 'id_2' );

		$this->data_manager->register_controller( Controller::class );

		// Act
		$result = $this->http_get( 'kits', [ 'force' => true ] );

		// Assert
		$this->assertArrayHasKey( 'data', $result );
		$this->assertEqualSets( [
			[
				'id' => 'id_1',
				'title' => 'kit_1',
				'thumbnail_url' => 'https://localhost/image.png',
				'access_level' => 0,
				'keywords' => [ 'word', 'word2' ],
				'taxonomies' => ['a', 'b', 'c', 'd', 'e'],
				'is_favorite' => false,
				'trend_index' => 20,
				'featured_index' => 30,
				'popularity_index' => 40,
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			],
			[
				'id' => 'id_2',
				'title' => 'kit_2',
				'thumbnail_url' => 'https://localhost/image2.png',
				'access_level' => 1,
				'keywords' => [],
				'taxonomies' => ['1', '2', '3', '4', '5'],
				'is_favorite' => true,
				'trend_index' => 20,
				'featured_index' => 30,
				'popularity_index' => 40,
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			]
		], $result['data'] );
	}

	private function get_kits_api_mock() {
		return [
			(object) [
				'tags' => [
					(object) [ 'name' => 'a' ],
					(object) [ 'name' => 'b' ],
				],
				'categories' => [
					(object) [ 'name' => 'c' ],
				],
				'features' => [
					(object) [ 'name' => 'd' ],
				],
				'types' => [
					(object) [ 'name' => 'e' ],
				],
				'keywords' => [ 'word', 'word2' ],
				'_id' => 'id_1',
				'title' => 'kit_1',
				'slug' => 'kit_1',
				'thumbnail' => 'https://localhost/image.png',
				'access_level' => 0,
				'trend_index' => 20,
				'featured_index' => 30,
				'popularity_index' => 40,
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			],
			(object) [
				'tags' => [
					(object) [ 'name' => '1' ],
					(object) [ 'name' => '2' ],
				],
				'categories' => [
					(object) [ 'name' => '3' ],
				],
				'features' => [
					(object) [ 'name' => '4' ],
				],
				'types' => [
					(object) [ 'name' => '5' ],
				],
				'keywords' => [],
				'_id' => 'id_2',
				'title' => 'kit_2',
				'slug' => 'kit_2',
				'thumbnail' => 'https://localhost/image2.png',
				'access_level' => 1,
				'trend_index' => 20,
				'featured_index' => 30,
				'popularity_index' => 40,
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			],
		];
	}
}
