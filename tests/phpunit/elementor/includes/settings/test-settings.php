<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Plugin;
use Elementor\Modules\EditorOne\Module as EditorOneModule;

class Test_Settings extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		$this->act_as_admin();
		
		$module = Plugin::instance()->modules_manager->get_modules( 'editor-one' );
		if ( $module ) {
			$module->__construct();
		}
	}

	public function test_register_admin_menu() {
		// Arrange.
		$this->markTestSkipped();
		return;

		$this->act_as_admin();

		// Act.
		do_action( 'admin_menu' );

		// Assert.
		global $submenu;

		$this->assertArrayHasKey( 'elementor-home', $submenu, 'elementor-home menu should be registered when editor-one experiment is active' );

		$elementor_menu = $submenu['elementor-home'];
		$this->assertNotEmpty( $elementor_menu, 'Elementor submenu should not be empty' );
		$this->assertGreaterThanOrEqual( 1, count( $elementor_menu ), 'Should have at least one submenu item' );
		
		$submenu_items = [];
		foreach ( $elementor_menu as $menu_item ) {
			$submenu_items[] = [
				'label' => $menu_item[0],
				'slug' => $menu_item[2],
			];
		}
		
		$editor_item = null;
		foreach ( $submenu_items as $item ) {
			if ( 'elementor-editor' === $item['slug'] ) {
				$editor_item = $item;
				break;
			}
		}
		
		$this->assertNotNull( $editor_item, 'Editor submenu item should be registered' );
		$this->assertEquals( 'Editor', $editor_item['label'], 'Editor menu item should have correct label' );
		$this->assertEquals( 'elementor-editor', $editor_item['slug'], 'Editor menu item should have correct slug' );
	}

}

