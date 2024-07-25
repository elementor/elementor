<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Debug;

use Elementor\Core\Debug\Classes\Shop_Page_Edit;
use Elementor\Tests\Phpunit\Test_Upgrades_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Manager extends Elementor_Test_Base {

	use Test_Upgrades_Trait;

	public function test_get_message_for_wp_shop_page () {
		// Arrange
		$shop_page = $this->create_post( 'page' );

		// Act
		update_option( 'woocommerce_shop_page_id', $shop_page->get_id() );
		$_GET['post'] = $shop_page->get_id();
		$shop_page_inspection = new Shop_Page_Edit();

		// Assert
		$this->assertFalse( $shop_page_inspection->run() );
		unset( $_GET['post'] );
	}
}
