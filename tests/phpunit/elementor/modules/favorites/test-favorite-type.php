<?php

namespace Elementor\Testing\Modules\Favorites;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Favorites\Favorites_Type;
use Elementor\Testing\Elementor_Test_Base;

class Test_Favorite_Type extends Elementor_Test_Base {

	const FAVORITES_DATA = [ 'first-favorite-name', 'second-favorite-name', 'third-favorite-name' ];

	public function test_should_get_name() {
		$favorite_type = new Favorite_Type_Concrete();

		$this->assertEquals( $favorite_type->get_name(), 'favorite-type-concrete' );
	}

	public function test_prepare_string() {
		$favorite_type = new Favorite_Type_Concrete();

		$this->assertEquals(
			$favorite_type->prepare( 'favorite-name' ),
			[ 'favorite-name' ]
		);
	}

	public function test_prepare_array() {
		$favorite_type = new Favorite_Type_Concrete();

		$this->assertEquals(
			$favorite_type->prepare( static::FAVORITES_DATA ),
			static::FAVORITES_DATA
		);
	}

	public function test_prepare_collection() {
		$favorite_type = new Favorite_Type_Concrete();
		$collection = new Collection( static::FAVORITES_DATA );

		$this->assertEquals(
			$favorite_type->prepare( $collection ),
			static::FAVORITES_DATA
		);
	}

	public function test_static_collection_relation() {
		$favorite_type = new Favorite_Type_Concrete( static::FAVORITES_DATA );

		$this->assertEquals(
			$favorite_type->values(),
			static::FAVORITES_DATA
		);
	}
}
