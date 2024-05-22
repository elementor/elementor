<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Finder;

use Elementor\Core\Common\Modules\Finder\Categories_Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Finder\Mock\Mock_Category;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Common\Modules\Finder\Module as Finder_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {

	/**
	 * Test module ajax get category items returns all category items.
	 */
	public function test_ajax_get_category_items() {
		// Arrange
		$this->act_as_admin();

		$mock = new Mock_Category();

		add_action( 'elementor/finder/register', function ( Categories_Manager $categories_manager ) use ( $mock ) {
			$categories_manager->register( $mock );
		} );

		$module = new Finder_Module();

		// Act
		$category_items = $module->ajax_get_category_items( [ 'category' => 'mock_id' ] );

		// Assert
		$mock_items = $mock->get_category_items();

		$this->assertEquals( $category_items, $mock_items );
	}
}
