<?php

namespace Elementor\Testing\Modules\Favorites;

use Elementor\Modules\Favorites\Module;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Testing\Modules\Favorites\Types\Concrete_Favorite_Type;
use Elementor\Testing\Modules\Favorites\Types\Test_Widgets;

class Test_Module extends Elementor_Test_Base {

	const CONCRETE_FAVORITE_TYPE = 'concrete-favorite-type';
	const WIDGETS = 'widgets';

	public function test_should_get_name() {
		$module = new Module();

		$this->assertEquals( $module->get_name(), 'favorites' );
	}

	public function test_type_registration() {
		$module = new Module();

		$module->register( Concrete_Favorite_Type::class );

		$this->assertInstanceof(
			$module->type_instance( static::CONCRETE_FAVORITE_TYPE ),
			Concrete_Favorite_Type::class
		);
	}

	public function test_get_instance_of_type() {
		$module = $this->generate_populated_module_instance();

		$this->assertInstanceof(
			$module->type_instance( static::CONCRETE_FAVORITE_TYPE ),
			Concrete_Favorite_Type::class
		);
	}

	public function test_get_available_types() {
		$module = $this->generate_populated_module_instance();

		$this->assertInstanceof(
			$module->available(),
			[ static::CONCRETE_FAVORITE_TYPE, static::WIDGETS ]
		);
	}

	public function test_merge_single_favorite() {
		$module = $this->generate_populated_module_instance();
		$new_favorite = 'forth-favorite-name';

		$this->assertEquals(
			$module->merge( static::CONCRETE_FAVORITE_TYPE, $new_favorite ),
			array_merge( Test_Favorite_Type::FAVORITES_DATA, [ $new_favorite ] )
		);
	}

	public function test_merge_multiple_favorites() {
		$module = $this->generate_populated_module_instance();
		$new_favorites = [ 'forth-favorite-name', 'fifth-favorite-name' ];

		$this->assertEquals(
			$module->merge( static::CONCRETE_FAVORITE_TYPE, $new_favorites ),
			array_merge( Test_Favorite_Type::FAVORITES_DATA, $new_favorites )
		);
	}

	public function test_delete_favorite() {
		$module = $this->generate_populated_module_instance();
		$deleted_favorite = 'third-favorite-name';

		$this->assertEquals(
			$module->delete( static::CONCRETE_FAVORITE_TYPE, $deleted_favorite ),
			array_diff( Test_Favorite_Type::FAVORITES_DATA, [ $deleted_favorite ] )
		);
	}

	public function test_delete_multiple_favorites() {
		$module = $this->generate_populated_module_instance();
		$deleted_favorites = [ 'second-favorite-name', 'third-favorite-name' ];

		$this->assertEquals(
			$module->delete(
				static::CONCRETE_FAVORITE_TYPE,
				array_map( function( $value ) {
					return Test_Favorite_Type::FAVORITES_DATA[ $value ];
				}, $deleted_favorites )
			),
			array_diff( Test_Favorite_Type::FAVORITES_DATA, $deleted_favorites )
		);
	}

	public function test_get_favorites_of_type() {
		$module = $this->generate_populated_module_instance();

		$this->assertEquals(
			$module->get( static::CONCRETE_FAVORITE_TYPE ),
			Test_Favorite_Type::FAVORITES_DATA
		);
	}

	public function test_get_favorites_of_all_types() {
		$module = $this->generate_populated_module_instance();

		$this->assertEquals(
			$module->get(),
			[
				static::CONCRETE_FAVORITE_TYPE => Test_Favorite_Type::FAVORITES_DATA,
				static::WIDGETS => Test_Widgets::FAVORITES_DATA,
			]
		);
	}

	protected function generate_populated_module_instance() {
		$module = new Module();
		$module->register( Concrete_Favorite_Type::class );

		$module->merge( static::CONCRETE_FAVORITE_TYPE, Test_Favorite_Type::FAVORITES_DATA );
		$module->merge( static::WIDGETS, Test_Widgets::FAVORITES_DATA );

		return $module;
	}
}
