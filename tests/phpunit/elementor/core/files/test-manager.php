<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Files\Manager;
use Elementor\Core\Page_Assets\Data_Managers\Base as Page_Assets_Data_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

	/**
	 * @dataProvider site_url_change_hook_data_provider
	 *
	 * @return void
	 */
	public function test_register_actions__change_site_url( $type ) {
		// Arrange.
		remove_all_actions( "update_option_{$type}" );
		update_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY, 'test-value' );

		$manager = new Manager();

		// Act.
		do_action( "update_option_{$type}" );

		// Assert.
		$this->assertFalse( get_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY ) );
	}

	public function site_url_change_hook_data_provider() {
		return [
			[ 'siteurl' ],
			[ 'home' ],
		];
	}
}
