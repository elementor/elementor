<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\EditorOneMenu;

use Elementor\Core\Admin\EditorOneMenu\Third_Party_Menu_Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\EditorOneMenu\Mock\Mock_Third_Party_Menu_Item;
use ElementorEditorTesting\Elementor_Test_Base;
use ReflectionClass;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/mock/mock-third-party-menu-item.php';

class Test_Third_Party_Menu_Manager extends Elementor_Test_Base {

	private function create_fresh_manager(): Third_Party_Menu_Manager {
		$reflection = new ReflectionClass( Third_Party_Menu_Manager::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );

		return Third_Party_Menu_Manager::instance();
	}

	public function test_register__returns_true_on_success() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item = new Mock_Third_Party_Menu_Item( 'test-item' );

		// Act
		$result = $manager->register( $item );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_get__returns_registered_item() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item = new Mock_Third_Party_Menu_Item( 'test-item' );
		$manager->register( $item );

		// Act
		$retrieved = $manager->get( 'test-item' );

		// Assert
		$this->assertSame( $item, $retrieved );
	}

	public function test_get__returns_null_for_unregistered_item() {
		// Arrange
		$manager = $this->create_fresh_manager();

		// Act
		$retrieved = $manager->get( 'non-existent' );

		// Assert
		$this->assertNull( $retrieved );
	}

	public function test_unregister__removes_item() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item = new Mock_Third_Party_Menu_Item( 'test-item' );
		$manager->register( $item );

		// Act
		$manager->unregister( 'test-item' );

		// Assert
		$this->assertNull( $manager->get( 'test-item' ) );
	}

	public function test_has_items__returns_true_when_items_exist() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item = new Mock_Third_Party_Menu_Item( 'test-item' );
		$manager->register( $item );

		// Act & Assert
		$this->assertTrue( $manager->has_items() );
	}

	public function test_has_items__returns_false_when_empty() {
		// Arrange
		$manager = $this->create_fresh_manager();

		// Act & Assert
		$this->assertFalse( $manager->has_items() );
	}

	public function test_get_all_sorted__returns_items_in_registration_order() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item1 = new Mock_Third_Party_Menu_Item( 'first-item' );
		$item2 = new Mock_Third_Party_Menu_Item( 'second-item' );

		$manager->register( $item1 );
		$manager->register( $item2 );

		// Act
		$sorted = $manager->get_all_sorted();
		$ids = array_keys( $sorted );

		// Assert
		$this->assertEquals( [ 'first-item', 'second-item' ], $ids );
	}

	public function test_register__rejects_duplicate_id() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item1 = new Mock_Third_Party_Menu_Item( 'same-id' );
		$item2 = new Mock_Third_Party_Menu_Item( 'same-id' );

		$manager->register( $item1 );

		// Act
		$result = $manager->register( $item2 );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_register__rejects_reserved_label() {
		// Arrange
		$manager = $this->create_fresh_manager();
		$item = new Mock_Third_Party_Menu_Item( 'test-item', 'Settings' );

		// Act
		$result = $manager->register( $item );

		// Assert
		$this->assertFalse( $result );
	}
}

