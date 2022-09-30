<?php

namespace Elementor\Testing\Modules\Favorites;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Favorites\Types\Widgets;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Favorite_Type extends Elementor_Test_Base {

	const FAVORITES_DATA = [ 'heading', 'image', 'button' ];

	public function test_should_get_name() {
		$favorite_type = new Widgets();

		$this->assertEquals( 'widgets', $favorite_type->get_name() );
	}

	public function test_prepare_string() {
		$favorite_type = new Widgets();

		$this->assertEquals(
			[ static::FAVORITES_DATA[ 0 ] ],
			$favorite_type->prepare( static::FAVORITES_DATA[ 0 ] )
		);
	}

	public function test_prepare_array() {
		$favorite_type = new Widgets();

		$this->assertEquals(
			static::FAVORITES_DATA,
			$favorite_type->prepare( static::FAVORITES_DATA )
		);
	}

	public function test_prepare_collection() {
		$favorite_type = new Widgets();
		$collection = new Collection( static::FAVORITES_DATA );

		$this->assertEquals(
			static::FAVORITES_DATA,
			$favorite_type->prepare( $collection )
		);
	}

	public function test_static_collection_relation() {
		$favorite_type = new Widgets( static::FAVORITES_DATA );

		$this->assertEquals(
			static::FAVORITES_DATA,
			$favorite_type->values()
		);
	}
}
