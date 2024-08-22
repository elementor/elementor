<?php

namespace Elementor\Testing\Modules\Favorites;

use Elementor\Modules\Favorites\Module;
use Elementor\Modules\Favorites\Types\Widgets;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	const FAVORITES_DATA = [ 'heading', 'image', 'button' ];

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
	}

	public function test_should_get_name() {
		$module = new Module();

		$this->assertEquals( 'favorites', $module->get_name() );
	}

	public function test_get_instance_of_type() {
		$module = $this->generate_populated_module_instance();

		$this->assertInstanceof(
			Widgets::class,
			$module->type_instance( 'widgets' )
		);
	}

	public function test_get_available_types() {
		$module = $this->generate_populated_module_instance();

		$this->assertEquals(
			[ 'widgets' ],
			$module->available()
		);
	}

	public function test_merge_single_favorite() {
		$module = $this->generate_populated_module_instance();
		$new_favorite = 'icon';

		$this->assertEquals(
			array_merge( static::FAVORITES_DATA, [ $new_favorite ] ),
			$module->merge( 'widgets', $new_favorite )
		);
	}

	public function test_merge_multiple_favorites() {
		$module = $this->generate_populated_module_instance();
		$new_favorites = [ 'icon', 'video' ];

		$this->assertEquals(
			array_merge( static::FAVORITES_DATA, $new_favorites ),
			$module->merge( 'widgets', $new_favorites )
		);
	}

	public function test_delete_favorite() {
		$module = $this->generate_populated_module_instance();
		$deleted_favorite = 'image';

		$this->assertEquals(
			array_values( array_diff( static::FAVORITES_DATA, [ $deleted_favorite ] ) ),
			$module->delete( 'widgets', $deleted_favorite )
		);
	}

	public function test_delete_multiple_favorites() {
		$module = $this->generate_populated_module_instance();
		$deleted_favorites = [ 'image', 'button' ];

		$this->assertEquals(
			array_values( array_diff( static::FAVORITES_DATA, $deleted_favorites ) ),
			$module->delete( 'widgets', $deleted_favorites )
		);
	}

	public function test_get_favorites_of_type() {
		$module = $this->generate_populated_module_instance();

		$this->assertEquals(
			static::FAVORITES_DATA,
			$module->get( 'widgets' )
		);
	}

	public function test_get_favorites_of_all_types() {
		$module = $this->generate_populated_module_instance();

		$this->assertEquals(
			[
				'widgets' => static::FAVORITES_DATA,
			],
			$module->get()
		);
	}

	protected function generate_populated_module_instance() {
		$module = new Module();

		$module->merge( 'widgets', static::FAVORITES_DATA );

		return $module;
	}
}
