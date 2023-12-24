<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Finder;

use Elementor\Core\Common\Modules\Finder\Categories_Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Finder\Mock\Mock_Category;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Categories_Manager extends Elementor_Test_Base {

	/**
	 * Test registration of new category without passing category id.
	 */
	public function test_register__without_passing_category_id() {
		// Arrange
		$mock = new Mock_Category();

		$categories_manager = new Categories_Manager();
		$old_categories = $categories_manager->get_categories();

		// Act
		$categories_manager->register( $mock );

		// Assert
		$new_categories = $categories_manager->get_categories();

		$this->assertEquals( $old_categories + [ 'mock_id' => $mock ], $new_categories );
	}

	/**
	 * Test registration backward compatibility.
	 * Registration of new category with category id.
	 */
	public function test_register__with_passing_category_id() {
		// Arrange
		$mock = new Mock_Category();

		$categories_manager = new Categories_Manager();
		$old_categories = $categories_manager->get_categories();

		// Act
		$categories_manager->register( $mock );

		// Assert
		$new_categories = $categories_manager->get_categories();

		$this->assertEquals( $old_categories + [ 'mock_id' => $mock ], $new_categories );
	}

	/**
	 * Test if the register hook is running as expected.
	 */
	public function test_register__hook() {
		// Arrange
		$categories_manager = new Categories_Manager();

		$mock = $this->getMockBuilder( static::class )
			->setMethods( [ 'on_finder_category_register' ] )
			->getMock();

		// Assert
		$mock->expects( $this->once() )
			->method( 'on_finder_category_register' )
			->with(
				$this->isInstanceOf( Categories_Manager::class )
			);

		// Act
		add_action( 'elementor/finder/register', [ $mock, 'on_finder_category_register' ] );

		// Trigger the hook.
		$categories_manager->get_categories();
	}
}
