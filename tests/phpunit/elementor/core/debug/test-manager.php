<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Debug;

use Elementor\Core\Debug\Loading_Inspection_Manager;
use Elementor\Tests\Phpunit\Test_Upgrades_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Manager extends Elementor_Test_Base {

	use Test_Upgrades_Trait;

	public function test_get_message_for_wp_shop_page ()
	{
		// Arrange
		$shop_page = $this->create_post( 'page' );
		update_option( 'woocommerce_shop_page_id', $shop_page->get_id() );
		$_GET['post'] = $shop_page->get_id();

		// Act
		$result = Loading_Inspection_Manager::instance()->run_inspections();

		// Assert
		$this->assertEquals( $result['message'], esc_html__( 'You are trying to edit the Shop Page although it is a Product Archive. Use the Theme Builder to create your Shop Archive template instead.', 'elementor' ) );
		$this->assertEquals($result['header'], esc_html__( 'Sorry, The content area was not been found on your page', 'elementor' ) );
		$this->assertEquals( $result['doc_url'], 'https://elementor.com/help/the-content-area-was-not-found-error/#error-appears-on-woocommerce-pages' );

		unset( $_GET['post'] );

	}
}
