<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Debug;

use Elementor\Tests\Phpunit\Test_Upgrades_Trait;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Debug\Loading_Inspection_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Manager extends Elementor_Test_Base {

	use Test_Upgrades_Trait;

	public function test_check_inspections_when_does_not_shop_page () {
		// Arrange
		$shop_page = $this->create_post( 'page' );
		$not_wc_shop_page = $this->create_post( 'page' );
		update_option( 'woocommerce_shop_page_id', $shop_page->get_id() );
		$_GET['post'] = $not_wc_shop_page->get_id();

		$manager = new Loading_Inspection_Manager();
		$manager->register_inspections();

		$reflection = new \ReflectionClass( $manager );
		$property = $reflection->getProperty('inspections' );
		$property->setAccessible( true );
		$inspections = $property->getValue( $manager );

		// Assert
		$this->assertArrayNotHasKey( 'shop-page-edit', $inspections );
		unset( $_GET['post'] );
	}

	public function test_check_inspections_when_it_is_shop_page () {
		// Arrange
		$shop_page = $this->create_post( 'page' );
		update_option( 'woocommerce_shop_page_id', $shop_page->get_id() );
		$_GET['post'] = $shop_page->get_id();

		$manager = new Loading_Inspection_Manager();
		$manager->register_inspections();

		$reflection = new \ReflectionClass( $manager );
		$property = $reflection->getProperty( 'inspections' );
		$property->setAccessible( true );
		$inspections = $property->getValue( $manager );

		// Assert
		$this->assertArrayHasKey( 'shop-page-edit', $inspections );
		unset( $_GET['post'] );
	}
}
